from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.auth.service import is_super_admin
from app.models.domain import Agent, Device, Message, Session as DbSession, SessionEvent, Tenant, User, Widget
from app.schemas import domain_schemas as schemas


def _write_tenant_id(db: Session, current_user: User, requested_tenant_id: UUID | None) -> UUID:
    tenant_id = requested_tenant_id if is_super_admin(current_user) else current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=422, detail="tenant_id is required")
    if not db.query(Tenant).filter(Tenant.id == tenant_id).first():
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant_id


def _agent_for_user(db: Session, agent_id: UUID, current_user: User) -> Agent:
    query = db.query(Agent).filter(Agent.id == agent_id)
    if not is_super_admin(current_user):
        query = query.filter(Agent.tenant_id == current_user.tenant_id)
    agent = query.first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


def list_agents(db: Session, current_user: User) -> list[Agent]:
    query = db.query(Agent)
    if not is_super_admin(current_user):
        query = query.filter(Agent.tenant_id == current_user.tenant_id)
    return query.order_by(Agent.created_at.desc()).all()


def create_agent(db: Session, current_user: User, request: schemas.AgentCreate) -> Agent:
    payload = request.model_dump()
    tenant_id = _write_tenant_id(db, current_user, payload.pop("tenant_id", None))
    agent = Agent(tenant_id=tenant_id, **payload)
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


def update_agent(db: Session, current_user: User, agent_id: UUID, request: schemas.AgentUpdate) -> Agent:
    agent = _agent_for_user(db, agent_id, current_user)
    for key, value in request.model_dump(exclude_unset=True).items():
        setattr(agent, key, value)
    db.commit()
    db.refresh(agent)
    return agent


def delete_agent(db: Session, current_user: User, agent_id: UUID) -> None:
    agent = _agent_for_user(db, agent_id, current_user)
    session_ids = [row[0] for row in db.query(DbSession.id).filter(DbSession.agent_id == agent.id).all()]
    if session_ids:
        db.query(Message).filter(Message.session_id.in_(session_ids)).delete(synchronize_session=False)
        db.query(SessionEvent).filter(SessionEvent.session_id.in_(session_ids)).delete(synchronize_session=False)
        db.query(DbSession).filter(DbSession.id.in_(session_ids)).delete(synchronize_session=False)
    db.query(Widget).filter(Widget.agent_id == agent.id).delete(synchronize_session=False)
    db.query(Device).filter(Device.agent_id == agent.id).delete(synchronize_session=False)
    db.delete(agent)
    db.commit()
