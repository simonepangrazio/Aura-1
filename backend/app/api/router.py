from datetime import datetime
from secrets import token_urlsafe
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth.service import (
    authenticate_user,
    create_access_token,
    get_current_user,
    get_optional_current_user,
    is_super_admin,
    register_owner,
    require_super_admin,
)
from app.core.config import settings
from app.core.database import get_db
from app.models.domain import Agent, Device, User, Widget
from app.schemas import domain_schemas as schemas
from app.services import admin_service, agent_service, api_key_service, device_service, tenant_service
from app.services.session_service import (
    end_session,
    get_session_detail_for_user,
    list_sessions,
    runtime_status_for_agent,
    start_session,
)


router = APIRouter()
CurrentUser = Annotated[User, Depends(get_current_user)]
OptionalCurrentUser = Annotated[User | None, Depends(get_optional_current_user)]
SuperAdmin = Annotated[User, Depends(require_super_admin)]


KIOSK_DEFAULT_SETTINGS = {
    "presenceStartMs": 4000,
    "absenceEndMs": 15000,
    "language": "it-IT",
}


def _device_settings(device: Device) -> dict:
    return {**KIOSK_DEFAULT_SETTINGS, **(device.settings or {})}


def _agent_for_tenant(db: Session, agent_id: UUID, tenant_id: UUID) -> Agent:
    agent = db.query(Agent).filter(Agent.id == agent_id, Agent.tenant_id == tenant_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


def _tenant_id_for_widget(current_user: User, requested_tenant_id: UUID | None) -> UUID:
    tenant_id = requested_tenant_id if is_super_admin(current_user) else current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=422, detail="tenant_id is required")
    return tenant_id


@router.post("/auth/login", response_model=schemas.TokenResponse)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, request.email, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"access_token": create_access_token(user), "token_type": "bearer", "user": user}


@router.get("/auth/me", response_model=schemas.UserRead)
def me(current_user: CurrentUser):
    return current_user


@router.post("/auth/register", response_model=schemas.TokenResponse)
def register(request: schemas.RegisterRequest, db: Session = Depends(get_db)):
    user = register_owner(db, request)
    return {"access_token": create_access_token(user), "token_type": "bearer", "user": user}


@router.post("/auth/refresh", response_model=schemas.TokenResponse)
def refresh(current_user: CurrentUser):
    return {
        "access_token": create_access_token(current_user),
        "token_type": "bearer",
        "user": current_user,
    }


@router.get("/admin/overview", response_model=schemas.AdminOverview)
def get_admin_overview(_: SuperAdmin, db: Session = Depends(get_db)):
    return admin_service.get_overview(db)


@router.get("/tenants", response_model=list[schemas.TenantRead])
def get_tenants(_: SuperAdmin, db: Session = Depends(get_db)):
    return tenant_service.list_tenants(db)


@router.get("/tenants/{tenant_id}", response_model=schemas.TenantRead)
def get_tenant(tenant_id: UUID, _: SuperAdmin, db: Session = Depends(get_db)):
    return tenant_service.get_tenant_or_404(db, tenant_id)


@router.post("/tenants", response_model=schemas.TenantCreateResponse)
def create_tenant(tenant: schemas.TenantCreate, _: SuperAdmin, db: Session = Depends(get_db)):
    return tenant_service.create_tenant(db, tenant)


@router.put("/tenants/{tenant_id}", response_model=schemas.TenantRead)
def update_tenant(
    tenant_id: UUID,
    tenant_data: schemas.TenantUpdate,
    _: SuperAdmin,
    db: Session = Depends(get_db),
):
    return tenant_service.update_tenant(db, tenant_id, tenant_data)


@router.delete("/tenants/{tenant_id}")
def delete_tenant(tenant_id: UUID, _: SuperAdmin, db: Session = Depends(get_db)):
    tenant_service.delete_tenant(db, tenant_id)
    return {"ok": True}


@router.get("/users", response_model=list[schemas.UserRead])
def get_users(current_user: CurrentUser, db: Session = Depends(get_db)):
    return admin_service.list_users(db, current_user)


@router.post("/users", response_model=schemas.UserRead)
def create_user(user: schemas.UserCreate, current_user: CurrentUser, db: Session = Depends(get_db)):
    return admin_service.create_user(db, current_user, user)


@router.put("/users/{user_id}", response_model=schemas.UserRead)
def update_user(
    user_id: UUID,
    user_data: schemas.UserUpdate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    return admin_service.update_user(db, current_user, user_id, user_data)


@router.post("/users/{user_id}/reset-password", response_model=schemas.UserRead)
def reset_user_password(
    user_id: UUID,
    password_data: schemas.UserResetPasswordRequest,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    return admin_service.reset_user_password(db, current_user, user_id, password_data)


@router.delete("/users/{user_id}")
def delete_user(user_id: UUID, current_user: CurrentUser, db: Session = Depends(get_db)):
    admin_service.delete_user(db, current_user, user_id)
    return {"ok": True}


@router.get("/agents", response_model=list[schemas.AgentRead])
def get_agents(current_user: CurrentUser, db: Session = Depends(get_db)):
    return agent_service.list_agents(db, current_user)


@router.post("/agents", response_model=schemas.AgentRead)
def create_agent(
    agent: schemas.AgentCreate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    return agent_service.create_agent(db, current_user, agent)


@router.put("/agents/{agent_id}", response_model=schemas.AgentRead)
def update_agent(
    agent_id: UUID,
    agent_data: schemas.AgentUpdate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    return agent_service.update_agent(db, current_user, agent_id, agent_data)


@router.delete("/agents/{agent_id}")
def delete_agent(agent_id: UUID, current_user: CurrentUser, db: Session = Depends(get_db)):
    agent_service.delete_agent(db, current_user, agent_id)
    return {"ok": True}


@router.get("/devices", response_model=list[schemas.DeviceRead])
def get_devices(current_user: CurrentUser, db: Session = Depends(get_db)):
    return device_service.list_devices(db, current_user)


@router.post("/devices", response_model=schemas.DeviceRead)
def create_device(
    device: schemas.DeviceCreate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    return device_service.create_device(db, current_user, device)


@router.post("/devices/auth", response_model=schemas.DeviceAuthResponse)
def auth_device(request: schemas.DeviceAuthRequest, db: Session = Depends(get_db)):
    device = (
        db.query(Device)
        .filter(Device.id == request.device_id, Device.device_token == request.device_token)
        .first()
    )
    if not device:
        raise HTTPException(status_code=401, detail="Invalid device credentials")

    agent = db.query(Agent).filter(Agent.id == device.agent_id, Agent.tenant_id == device.tenant_id).first()
    if not agent or not agent.is_active:
        raise HTTPException(status_code=404, detail="Active agent not found for device")

    device.last_seen = datetime.utcnow()
    device.status = "online"
    db.commit()
    db.refresh(device)

    return {
        "success": True,
        "tenant_id": device.tenant_id,
        "agent_id": agent.id,
        "agent_name": agent.name,
        "beyond_avatar_id": agent.beyond_avatar_id,
        "livekit_config": {"url": settings.LIVEKIT_URL},
        "settings": _device_settings(device),
        "runtime_status": runtime_status_for_agent(db, device.tenant_id, agent),
    }


@router.put("/devices/{device_id}", response_model=schemas.DeviceRead)
def update_device(
    device_id: UUID,
    device_data: schemas.DeviceUpdate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    return device_service.update_device(db, current_user, device_id, device_data)


@router.post("/devices/{device_id}/regenerate-token", response_model=schemas.DeviceRead)
def regenerate_device_token(
    device_id: UUID,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    return device_service.regenerate_device_token(db, current_user, device_id)


@router.delete("/devices/{device_id}")
def delete_device(device_id: UUID, current_user: CurrentUser, db: Session = Depends(get_db)):
    device_service.delete_device(db, current_user, device_id)
    return {"ok": True}


@router.get("/widgets", response_model=list[schemas.WidgetRead])
def get_widgets(current_user: CurrentUser, db: Session = Depends(get_db)):
    query = db.query(Widget)
    if not is_super_admin(current_user):
        query = query.filter(Widget.tenant_id == current_user.tenant_id)
    return query.order_by(Widget.created_at.desc()).all()


@router.post("/widgets", response_model=schemas.WidgetRead)
def create_widget(
    widget: schemas.WidgetCreate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    payload = widget.model_dump()
    tenant_id = _tenant_id_for_widget(current_user, payload.pop("tenant_id", None))
    _agent_for_tenant(db, payload["agent_id"], tenant_id)
    payload["public_token"] = payload["public_token"] or f"wid_{token_urlsafe(24)}"
    db_widget = Widget(tenant_id=tenant_id, **payload)
    db.add(db_widget)
    db.commit()
    db.refresh(db_widget)
    return db_widget


@router.put("/widgets/{widget_id}", response_model=schemas.WidgetRead)
def update_widget(
    widget_id: UUID,
    widget_data: schemas.WidgetUpdate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    query = db.query(Widget).filter(Widget.id == widget_id)
    if not is_super_admin(current_user):
        query = query.filter(Widget.tenant_id == current_user.tenant_id)
    db_widget = query.first()
    if not db_widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    if widget_data.agent_id:
        _agent_for_tenant(db, widget_data.agent_id, db_widget.tenant_id)
    for key, value in widget_data.model_dump(exclude_unset=True).items():
        setattr(db_widget, key, value)
    db.commit()
    db.refresh(db_widget)
    return db_widget


@router.get("/sessions", response_model=list[schemas.SessionRead])
def get_sessions(current_user: CurrentUser, db: Session = Depends(get_db)):
    return list_sessions(db, current_user)


@router.get("/api-keys", response_model=list[schemas.ApiKeyRead])
def get_api_keys(
    current_user: CurrentUser,
    tenant_id: UUID | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return api_key_service.list_api_keys(db, current_user, tenant_id)


@router.put("/api-keys/{provider}", response_model=schemas.ApiKeyRead)
def upsert_api_key(
    provider: str,
    request: schemas.ApiKeyUpsert,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    return api_key_service.upsert_api_key(db, current_user, provider, request)


@router.delete("/api-keys/{provider}")
def delete_api_key(
    provider: str,
    current_user: CurrentUser,
    tenant_id: UUID | None = Query(default=None),
    db: Session = Depends(get_db),
):
    api_key_service.delete_api_key(db, current_user, provider, tenant_id)
    return {"ok": True}


@router.post("/sessions/start", response_model=schemas.SessionStartResponse)
def create_session(
    request: schemas.SessionStartRequest,
    current_user: OptionalCurrentUser,
    db: Session = Depends(get_db),
):
    db_session, token, url, room, runtime_status = start_session(db, request, current_user)
    response = schemas.SessionRead.model_validate(db_session).model_dump()
    agent = db_session.agent
    response.update(
        {
            "token": token,
            "url": url,
            "room": room,
            "session_id": db_session.id,
            "livekit_token": token,
            "livekit_url": url,
            "agent": {
                "id": str(agent.id),
                "name": agent.name,
                "language": agent.language,
                "stt_provider": agent.stt_provider,
                "stt_model": agent.stt_model,
                "voice_provider": agent.voice_provider,
                "voice_id": agent.voice_id,
                "tts_model": agent.tts_model,
                "beyond_avatar_id": agent.beyond_avatar_id,
            }
            if agent
            else {},
            "avatar": {
                "provider": "beyond_presence",
                "beyond_avatar_id": agent.beyond_avatar_id if agent else None,
                "room": room,
            },
            "runtime_status": runtime_status,
        }
    )
    return response


@router.post("/sessions/end", response_model=schemas.SessionRead)
def close_session(
    request: schemas.SessionEndRequest,
    current_user: OptionalCurrentUser,
    db: Session = Depends(get_db),
):
    return end_session(
        db,
        request.session_id,
        current_user,
        device_id=request.device_id,
        device_token=request.device_token,
    )


@router.get("/sessions/{session_id}", response_model=schemas.SessionDetail)
def get_session(session_id: UUID, current_user: CurrentUser, db: Session = Depends(get_db)):
    return get_session_detail_for_user(db, session_id, current_user)


@router.get("/workflows", response_model=list[schemas.WorkflowRead])
def get_workflows(current_user: CurrentUser, db: Session = Depends(get_db)):
    return admin_service.list_workflows(db, current_user)


@router.put("/workflows/{agent_id}", response_model=schemas.WorkflowRead)
def update_workflow(
    agent_id: UUID,
    request: schemas.WorkflowUpdateRequest,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    return admin_service.update_workflow(db, current_user, agent_id, request)


@router.delete("/workflows/{agent_id}", response_model=schemas.WorkflowRead)
def delete_workflow(agent_id: UUID, current_user: CurrentUser, db: Session = Depends(get_db)):
    return admin_service.delete_workflow(db, current_user, agent_id)


@router.post("/workflows/test", response_model=schemas.WorkflowTestResponse)
async def test_workflow(
    request: schemas.WorkflowTestRequest,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    return await admin_service.test_workflow(db, current_user, request)
