from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class TenantBase(BaseModel):
    name: str
    slug: str
    email: str | None = None
    status: str = "active"


class TenantCreate(TenantBase):
    name: str = Field(min_length=1)
    slug: str = Field(min_length=1)
    email: str = Field(min_length=1)
    admin_email: str = Field(min_length=1)
    admin_password: str = Field(min_length=8)
    admin_first_name: str = Field(min_length=1)
    admin_last_name: str = Field(min_length=1)
    create_default_agent: bool = True


class TenantUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    email: str | None = None
    status: str | None = None


class TenantRead(TenantBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserBase(BaseModel):
    email: str
    first_name: str | None = None
    last_name: str | None = None
    role: str = "tenant_admin"
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(min_length=8)
    tenant_id: UUID | None = None


class UserUpdate(BaseModel):
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    role: str | None = None
    tenant_id: UUID | None = None
    is_active: bool | None = None


class UserResetPasswordRequest(BaseModel):
    password: str = Field(min_length=8)


class UserRead(UserBase):
    id: UUID
    tenant_id: UUID | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TenantAdminCredentials(BaseModel):
    email: str
    password: str
    role: str = "tenant_admin"


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    tenant_name: str
    tenant_slug: str
    email: str
    password: str = Field(min_length=8)
    first_name: str | None = None
    last_name: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class AgentBase(BaseModel):
    name: str
    description: str | None = None
    beyond_avatar_id: str | None = None
    system_prompt: str | None = None
    n8n_webhook_url: str | None = None
    stt_provider: str | None = "browser"
    stt_model: str | None = None
    voice_provider: str | None = None
    voice_id: str | None = None
    tts_model: str | None = None
    language: str = "it-IT"
    is_active: bool = True


class AgentCreate(AgentBase):
    tenant_id: UUID | None = None


class AgentUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    beyond_avatar_id: str | None = None
    system_prompt: str | None = None
    n8n_webhook_url: str | None = None
    stt_provider: str | None = None
    stt_model: str | None = None
    voice_provider: str | None = None
    voice_id: str | None = None
    tts_model: str | None = None
    language: str | None = None
    is_active: bool | None = None


class AgentRead(AgentBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TenantCreateResponse(BaseModel):
    tenant: TenantRead
    admin_user: UserRead
    admin_credentials: TenantAdminCredentials
    default_agent: AgentRead | None = None


class DeviceBase(BaseModel):
    agent_id: UUID
    name: str
    location: str | None = None
    device_token: str | None = None
    settings: dict[str, Any] = Field(default_factory=dict)
    status: str = "offline"


class DeviceCreate(DeviceBase):
    tenant_id: UUID | None = None


class DeviceUpdate(BaseModel):
    agent_id: UUID | None = None
    name: str | None = None
    location: str | None = None
    device_token: str | None = None
    settings: dict[str, Any] | None = None
    status: str | None = None
    last_seen: datetime | None = None


class DeviceRead(DeviceBase):
    id: UUID
    tenant_id: UUID
    last_seen: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DeviceAuthRequest(BaseModel):
    device_id: UUID
    device_token: str


class DeviceAuthResponse(BaseModel):
    success: bool
    tenant_id: UUID
    agent_id: UUID
    agent_name: str
    beyond_avatar_id: str | None = None
    livekit_config: dict[str, Any] = Field(default_factory=dict)
    settings: dict[str, Any] = Field(default_factory=dict)
    runtime_status: dict[str, Any] = Field(default_factory=dict)


class WidgetBase(BaseModel):
    agent_id: UUID
    name: str
    public_token: str | None = None
    allowed_domains: list[str] | None = None
    is_active: bool = True


class WidgetCreate(WidgetBase):
    tenant_id: UUID | None = None


class WidgetUpdate(BaseModel):
    agent_id: UUID | None = None
    name: str | None = None
    public_token: str | None = None
    allowed_domains: list[str] | None = None
    is_active: bool | None = None


class WidgetRead(WidgetBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SessionStartRequest(BaseModel):
    agent_id: UUID | None = None
    device_id: UUID | None = None
    widget_id: UUID | None = None
    device_token: str | None = None
    public_token: str | None = None
    session_type: str = "dashboard_test"


class SessionEndRequest(BaseModel):
    session_id: UUID
    device_id: UUID | None = None
    device_token: str | None = None


class SessionBase(BaseModel):
    session_type: str
    status: str
    livekit_room_name: str | None = None
    conversation_summary: str | None = None


class SessionRead(SessionBase):
    id: UUID
    tenant_id: UUID
    agent_id: UUID
    device_id: UUID | None = None
    widget_id: UUID | None = None
    started_at: datetime | None = None
    ended_at: datetime | None = None
    user_connected_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SessionDetail(SessionRead):
    duration_seconds: int | None = None
    tenant: dict[str, Any] | None = None
    agent: dict[str, Any] | None = None
    device: dict[str, Any] | None = None
    widget: dict[str, Any] | None = None
    messages: list[dict[str, Any]] = Field(default_factory=list)
    events: list[dict[str, Any]] = Field(default_factory=list)


class SessionStartResponse(SessionRead):
    token: str
    url: str
    room: str
    session_id: UUID
    livekit_token: str
    livekit_url: str
    agent: dict[str, Any] = Field(default_factory=dict)
    avatar: dict[str, Any] = Field(default_factory=dict)
    runtime_status: dict[str, Any] = Field(default_factory=dict)


class MessageBase(BaseModel):
    role: str
    message: str
    tokens_used: int | None = None


class MessageCreate(MessageBase):
    session_id: UUID


class MessageRead(MessageBase):
    id: UUID
    session_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SessionEventBase(BaseModel):
    event_type: str
    payload: dict[str, Any] = Field(default_factory=dict)


class SessionEventCreate(SessionEventBase):
    session_id: UUID


class SessionEventRead(SessionEventBase):
    id: UUID
    session_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminOverview(BaseModel):
    tenant_total: int
    device_online: int
    active_sessions: int
    sessions_today: int
    registered_users: int
    active_agents: int
    recent_tenants: list[TenantRead] = Field(default_factory=list)
    recent_sessions: list[SessionRead] = Field(default_factory=list)
    recent_devices: list[DeviceRead] = Field(default_factory=list)
    uptime_status: str = "ok"


class WorkflowRead(BaseModel):
    agent_id: UUID
    agent_name: str
    tenant_id: UUID
    tenant_name: str | None = None
    webhook_url: str | None = None
    status: str


class WorkflowUpdateRequest(BaseModel):
    webhook_url: str | None = None


class WorkflowTestRequest(BaseModel):
    agent_id: UUID


class WorkflowTestResponse(BaseModel):
    ok: bool
    status_code: int | None = None
    message: str


class KnowledgeBaseBase(BaseModel):
    name: str
    description: str | None = None


class KnowledgeBaseCreate(KnowledgeBaseBase):
    pass


class KnowledgeBaseRead(KnowledgeBaseBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApiKeyUpsert(BaseModel):
    tenant_id: UUID | None = None
    api_key: str | None = None
    settings: dict[str, Any] = Field(default_factory=dict)


class ApiKeyRead(BaseModel):
    id: UUID
    tenant_id: UUID
    provider: str
    is_configured: bool
    key_preview: str | None = None
    settings: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
