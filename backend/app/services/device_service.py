from secrets import token_urlsafe
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.auth.service import is_super_admin
from app.models.domain import Agent, Device, Session as DbSession, Tenant, User
from app.schemas import domain_schemas as schemas


def make_device_token() -> str:
    return f"dev_{token_urlsafe(32)}"


def _write_tenant_id(db: Session, current_user: User, requested_tenant_id: UUID | None) -> UUID:
    tenant_id = requested_tenant_id if is_super_admin(current_user) else current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=422, detail="tenant_id is required")
    if not db.query(Tenant).filter(Tenant.id == tenant_id).first():
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant_id


def _validate_agent(db: Session, tenant_id: UUID, agent_id: UUID) -> Agent:
    agent = db.query(Agent).filter(Agent.id == agent_id, Agent.tenant_id == tenant_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found for tenant")
    return agent


def _device_for_user(db: Session, device_id: UUID, current_user: User) -> Device:
    query = db.query(Device).filter(Device.id == device_id)
    if not is_super_admin(current_user):
        query = query.filter(Device.tenant_id == current_user.tenant_id)
    device = query.first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device


def list_devices(db: Session, current_user: User) -> list[Device]:
    query = db.query(Device)
    if not is_super_admin(current_user):
        query = query.filter(Device.tenant_id == current_user.tenant_id)
    return query.order_by(Device.created_at.desc()).all()


def create_device(db: Session, current_user: User, request: schemas.DeviceCreate) -> Device:
    payload = request.model_dump()
    tenant_id = _write_tenant_id(db, current_user, payload.pop("tenant_id", None))
    _validate_agent(db, tenant_id, payload["agent_id"])
    payload["device_token"] = payload.get("device_token") or make_device_token()
    device = Device(tenant_id=tenant_id, **payload)
    db.add(device)
    db.commit()
    db.refresh(device)
    return device


def update_device(db: Session, current_user: User, device_id: UUID, request: schemas.DeviceUpdate) -> Device:
    device = _device_for_user(db, device_id, current_user)
    payload = request.model_dump(exclude_unset=True)
    if payload.get("agent_id"):
        _validate_agent(db, device.tenant_id, payload["agent_id"])
    for key, value in payload.items():
        setattr(device, key, value)
    db.commit()
    db.refresh(device)
    return device


def regenerate_device_token(db: Session, current_user: User, device_id: UUID) -> Device:
    device = _device_for_user(db, device_id, current_user)
    device.device_token = make_device_token()
    db.commit()
    db.refresh(device)
    return device


def delete_device(db: Session, current_user: User, device_id: UUID) -> None:
    device = _device_for_user(db, device_id, current_user)
    db.query(DbSession).filter(DbSession.device_id == device.id).update(
        {DbSession.device_id: None},
        synchronize_session=False,
    )
    db.delete(device)
    db.commit()
