import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Integer, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship
from app.core.database import Base

class Tenant(Base):
    __tablename__ = "tenants"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255))
    slug = Column(String(255), unique=True)
    email = Column(String(255))
    status = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    users = relationship("User", back_populates="tenant")
    agents = relationship("Agent", back_populates="tenant")
    devices = relationship("Device", back_populates="tenant")
    widgets = relationship("Widget", back_populates="tenant")
    sessions = relationship("Session", back_populates="tenant")
    knowledge_bases = relationship("KnowledgeBase", back_populates="tenant")
    api_keys = relationship("ApiKey", back_populates="tenant")

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=True)
    email = Column(String(255), unique=True)
    password_hash = Column(Text)
    first_name = Column(String(255))
    last_name = Column(String(255))
    role = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="users")

class Agent(Base):
    __tablename__ = "agents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"))
    name = Column(String(255))
    description = Column(Text)
    beyond_avatar_id = Column(String(255))
    system_prompt = Column(Text)
    n8n_webhook_url = Column(Text)
    stt_provider = Column(String(100), default="browser")
    stt_model = Column(String(255))
    voice_provider = Column(String(100))
    voice_id = Column(String(255))
    tts_model = Column(String(255))
    language = Column(String(20))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="agents")
    devices = relationship("Device", back_populates="agent")
    widgets = relationship("Widget", back_populates="agent")
    sessions = relationship("Session", back_populates="agent")

class Device(Base):
    __tablename__ = "devices"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"))
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"))
    name = Column(String(255))
    location = Column(String(255))
    device_token = Column(Text)
    settings = Column(JSONB, default=dict)
    status = Column(String(50))
    last_seen = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="devices")
    agent = relationship("Agent", back_populates="devices")
    sessions = relationship("Session", back_populates="device")

class Widget(Base):
    __tablename__ = "widgets"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"))
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"))
    name = Column(String(255))
    public_token = Column(Text)
    allowed_domains = Column(ARRAY(Text))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="widgets")
    agent = relationship("Agent", back_populates="widgets")
    sessions = relationship("Session", back_populates="widget")

class Session(Base):
    __tablename__ = "sessions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"))
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"))
    device_id = Column(UUID(as_uuid=True), ForeignKey("devices.id"), nullable=True)
    widget_id = Column(UUID(as_uuid=True), ForeignKey("widgets.id"), nullable=True)
    session_type = Column(String(50))
    status = Column(String(50))
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    user_connected_at = Column(DateTime, nullable=True)
    livekit_room_name = Column(String(255))
    conversation_summary = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="sessions")
    agent = relationship("Agent", back_populates="sessions")
    device = relationship("Device", back_populates="sessions")
    widget = relationship("Widget", back_populates="sessions")
    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")
    session_events = relationship("SessionEvent", back_populates="session", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id"))
    role = Column(String(50))
    message = Column(Text)
    tokens_used = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    session = relationship("Session", back_populates="messages")

class SessionEvent(Base):
    __tablename__ = "session_events"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id"))
    event_type = Column(String(100))
    payload = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    session = relationship("Session", back_populates="session_events")

class KnowledgeBase(Base):
    __tablename__ = "knowledge_bases"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"))
    name = Column(String(255))
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="knowledge_bases")

class ApiKey(Base):
    __tablename__ = "api_keys"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"))
    provider = Column(String(100))
    encrypted_key = Column(Text)
    settings = Column(JSONB, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="api_keys")
