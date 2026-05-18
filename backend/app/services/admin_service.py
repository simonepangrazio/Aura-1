from datetime import datetime
from urllib.parse import urlparse
from uuid import UUID

import httpx
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.auth.service import SUPER_ADMIN, TENANT_ADMIN, hash_password, is_super_admin, normalize_role
from app.models.domain import Agent, Device, Session as DbSession, Tenant, User
from app.schemas import domain_schemas as schemas


ACTIVE_SESSION_STATUSES = ("starting", "active")


def _scoped_user_query(db: Session, current_user: User):
    query = db.query(User)
    if not is_super_admin(current_user):
        query = query.filter(User.tenant_id == current_user.tenant_id)
    return query


def _scoped_agent_query(db: Session, current_user: User):
    query = db.query(Agent)
    if not is_super_admin(current_user):
        query = query.filter(Agent.tenant_id == current_user.tenant_id)
    return query


def list_users(db: Session, current_user: User) -> list[User]:
    return _scoped_user_query(db, current_user).order_by(User.created_at.desc()).all()


def _resolve_user_tenant(db: Session, current_user: User, role: str, tenant_id: UUID | None) -> UUID | None:
    normalized_role = normalize_role(role)
    if not is_super_admin(current_user):
        if normalized_role == SUPER_ADMIN:
            raise HTTPException(status_code=403, detail="Cannot create or edit super admins")
        return current_user.tenant_id
    if normalized_role == SUPER_ADMIN:
        return None
    if not tenant_id:
        raise HTTPException(status_code=422, detail="tenant_id is required for tenant_admin")
    if not db.query(Tenant).filter(Tenant.id == tenant_id).first():
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant_id


def create_user(db: Session, current_user: User, request: schemas.UserCreate) -> User:
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    role = normalize_role(request.role)
    tenant_id = _resolve_user_tenant(db, current_user, role, request.tenant_id)
    user = User(
        tenant_id=tenant_id,
        email=request.email,
        password_hash=hash_password(request.password),
        first_name=request.first_name,
        last_name=request.last_name,
        role=role,
        is_active=request.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _user_for_current_user(db: Session, current_user: User, user_id: UUID) -> User:
    user = _scoped_user_query(db, current_user).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def update_user(db: Session, current_user: User, user_id: UUID, request: schemas.UserUpdate) -> User:
    user = _user_for_current_user(db, current_user, user_id)
    payload = request.model_dump(exclude_unset=True)
    if "email" in payload and payload["email"] != user.email:
        existing = db.query(User).filter(User.email == payload["email"], User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")
    next_role = normalize_role(payload.get("role", user.role))
    next_tenant_id = payload.get("tenant_id", user.tenant_id)
    if "role" in payload or "tenant_id" in payload:
        user.tenant_id = _resolve_user_tenant(db, current_user, next_role, next_tenant_id)
        user.role = next_role
    for key in ("email", "first_name", "last_name", "is_active"):
        if key in payload:
            setattr(user, key, payload[key])
    db.commit()
    db.refresh(user)
    return user


def reset_user_password(
    db: Session,
    current_user: User,
    user_id: UUID,
    request: schemas.UserResetPasswordRequest,
) -> User:
    user = _user_for_current_user(db, current_user, user_id)
    user.password_hash = hash_password(request.password)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, current_user: User, user_id: UUID) -> None:
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete the current user")
    user = _user_for_current_user(db, current_user, user_id)
    db.delete(user)
    db.commit()


def get_overview(db: Session) -> schemas.AdminOverview:
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    recent_tenants = db.query(Tenant).order_by(Tenant.created_at.desc()).limit(5).all()
    recent_sessions = db.query(DbSession).order_by(DbSession.created_at.desc()).limit(5).all()
    recent_devices = db.query(Device).order_by(Device.last_seen.desc().nullslast()).limit(5).all()
    return schemas.AdminOverview(
        tenant_total=db.query(Tenant).count(),
        device_online=db.query(Device).filter(Device.status.in_(["online", "busy"])).count(),
        active_sessions=db.query(DbSession).filter(DbSession.status.in_(ACTIVE_SESSION_STATUSES)).count(),
        sessions_today=db.query(DbSession).filter(DbSession.started_at >= today_start).count(),
        registered_users=db.query(User).count(),
        active_agents=db.query(Agent).filter(Agent.is_active.is_(True)).count(),
        recent_tenants=recent_tenants,
        recent_sessions=recent_sessions,
        recent_devices=recent_devices,
        uptime_status="ok",
    )


def list_workflows(db: Session, current_user: User) -> list[schemas.WorkflowRead]:
    agents = _scoped_agent_query(db, current_user).order_by(Agent.created_at.desc()).all()
    return [_workflow_read(agent) for agent in agents]


def _workflow_read(agent: Agent) -> schemas.WorkflowRead:
    return schemas.WorkflowRead(
        agent_id=agent.id,
        agent_name=agent.name,
        tenant_id=agent.tenant_id,
        tenant_name=agent.tenant.name if agent.tenant else None,
        webhook_url=agent.n8n_webhook_url,
        status="configured" if agent.n8n_webhook_url else "missing",
    )


def _workflow_agent_for_user(db: Session, current_user: User, agent_id: UUID) -> Agent:
    agent = _scoped_agent_query(db, current_user).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


def _normalize_webhook_url(webhook_url: str | None) -> str | None:
    if webhook_url is None:
        return None
    normalized = webhook_url.strip()
    if not normalized:
        return None
    parsed = urlparse(normalized)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise HTTPException(status_code=422, detail="Webhook URL must be a valid HTTP or HTTPS URL")
    return normalized


def update_workflow(
    db: Session,
    current_user: User,
    agent_id: UUID,
    request: schemas.WorkflowUpdateRequest,
) -> schemas.WorkflowRead:
    agent = _workflow_agent_for_user(db, current_user, agent_id)
    agent.n8n_webhook_url = _normalize_webhook_url(request.webhook_url)
    db.commit()
    db.refresh(agent)
    return _workflow_read(agent)


def delete_workflow(db: Session, current_user: User, agent_id: UUID) -> schemas.WorkflowRead:
    agent = _workflow_agent_for_user(db, current_user, agent_id)
    agent.n8n_webhook_url = None
    db.commit()
    db.refresh(agent)
    return _workflow_read(agent)


async def test_workflow(
    db: Session,
    current_user: User,
    request: schemas.WorkflowTestRequest,
) -> schemas.WorkflowTestResponse:
    agent = _workflow_agent_for_user(db, current_user, request.agent_id)
    if not agent.n8n_webhook_url:
        raise HTTPException(status_code=422, detail="Agent does not have an N8N webhook URL")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                agent.n8n_webhook_url,
                json={"test": True, "agent_id": str(agent.id), "timestamp": datetime.utcnow().isoformat()},
            )
        return schemas.WorkflowTestResponse(
            ok=response.status_code < 400,
            status_code=response.status_code,
            message="Connection succeeded" if response.status_code < 400 else response.text[:200],
        )
    except Exception as exc:
        return schemas.WorkflowTestResponse(ok=False, status_code=None, message=str(exc))
