from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.auth.service import TENANT_ADMIN, hash_password, normalize_role
from app.models.domain import (
    Agent,
    ApiKey,
    Device,
    KnowledgeBase,
    Message,
    Session as DbSession,
    SessionEvent,
    Tenant,
    User,
    Widget,
)
from app.schemas import domain_schemas as schemas


def get_tenant_or_404(db: Session, tenant_id: UUID) -> Tenant:
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


def list_tenants(db: Session) -> list[Tenant]:
    return db.query(Tenant).order_by(Tenant.created_at.desc()).all()


def create_tenant(db: Session, request: schemas.TenantCreate) -> dict:
    if db.query(Tenant).filter(Tenant.slug == request.slug).first():
        raise HTTPException(status_code=409, detail="Tenant slug already exists")
    if request.email and db.query(Tenant).filter(Tenant.email == request.email).first():
        raise HTTPException(status_code=409, detail="Tenant email already exists")
    if db.query(User).filter(User.email == request.admin_email).first():
        raise HTTPException(status_code=409, detail="Admin email already registered")

    tenant = Tenant(
        name=request.name,
        slug=request.slug,
        email=request.email,
        status=request.status or "active",
    )
    db.add(tenant)
    db.flush()

    admin_user = User(
        tenant_id=tenant.id,
        email=request.admin_email,
        password_hash=hash_password(request.admin_password),
        first_name=request.admin_first_name,
        last_name=request.admin_last_name,
        role=TENANT_ADMIN,
        is_active=True,
    )
    db.add(admin_user)

    default_agent = None
    if request.create_default_agent:
        default_agent = Agent(
            tenant_id=tenant.id,
            name="Default Avatar",
            description="Avatar AI predefinito pronto per la configurazione Beyond Presence e N8N.",
            beyond_avatar_id=None,
            system_prompt="Sei un assistente AI conversazionale per questo tenant.",
            n8n_webhook_url=None,
            stt_provider="browser",
            stt_model=None,
            voice_provider="openai",
            voice_id="alloy",
            tts_model="gpt-4o-mini-tts",
            language="it-IT",
            is_active=True,
        )
        db.add(default_agent)

    db.commit()
    db.refresh(tenant)
    db.refresh(admin_user)
    if default_agent:
        db.refresh(default_agent)
    return {
        "tenant": tenant,
        "admin_user": admin_user,
        "admin_credentials": {
            "email": request.admin_email,
            "password": request.admin_password,
            "role": TENANT_ADMIN,
        },
        "default_agent": default_agent,
    }


def update_tenant(db: Session, tenant_id: UUID, request: schemas.TenantUpdate) -> Tenant:
    tenant = get_tenant_or_404(db, tenant_id)
    payload = request.model_dump(exclude_unset=True)
    if "slug" in payload and payload["slug"] != tenant.slug:
        existing = db.query(Tenant).filter(Tenant.slug == payload["slug"], Tenant.id != tenant_id).first()
        if existing:
            raise HTTPException(status_code=409, detail="Tenant slug already exists")
    for key, value in payload.items():
        setattr(tenant, key, value)
    db.commit()
    db.refresh(tenant)
    return tenant


def delete_tenant(db: Session, tenant_id: UUID) -> None:
    tenant = get_tenant_or_404(db, tenant_id)
    session_ids = [row[0] for row in db.query(DbSession.id).filter(DbSession.tenant_id == tenant_id).all()]
    if session_ids:
        db.query(Message).filter(Message.session_id.in_(session_ids)).delete(synchronize_session=False)
        db.query(SessionEvent).filter(SessionEvent.session_id.in_(session_ids)).delete(synchronize_session=False)
        db.query(DbSession).filter(DbSession.id.in_(session_ids)).delete(synchronize_session=False)

    for model in (Widget, Device, Agent, KnowledgeBase, ApiKey, User):
        db.query(model).filter(model.tenant_id == tenant_id).delete(synchronize_session=False)

    db.delete(tenant)
    db.commit()


def normalize_existing_tenant_users(db: Session) -> None:
    users = db.query(User).filter(User.role.isnot(None)).all()
    changed = False
    for user in users:
        normalized_role = normalize_role(user.role)
        if user.role != normalized_role:
            user.role = normalized_role
            changed = True
    if changed:
        db.commit()
