"""initial multi tenant realtime schema

Revision ID: 20260515_0001
Revises: f6950998ebdd
Create Date: 2026-05-15
"""

from typing import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


revision: str = "20260515_0001"
down_revision: str | None = "f6950998ebdd"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def timestamps() -> tuple[sa.Column, sa.Column]:
    return (
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
    )


def upgrade() -> None:
    for table_name in (
        "api_keys",
        "knowledge_bases",
        "session_events",
        "messages",
        "sessions",
        "widgets",
        "devices",
        "agents",
        "users",
        "tenants",
    ):
        op.execute(f'DROP TABLE IF EXISTS "{table_name}" CASCADE')

    op.create_table(
        "tenants",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(length=255)),
        sa.Column("slug", sa.String(length=255), unique=True),
        sa.Column("email", sa.String(length=255)),
        sa.Column("status", sa.String(length=50)),
        *timestamps(),
    )

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id")),
        sa.Column("email", sa.String(length=255), unique=True),
        sa.Column("password_hash", sa.Text()),
        sa.Column("first_name", sa.String(length=255)),
        sa.Column("last_name", sa.String(length=255)),
        sa.Column("role", sa.String(length=50)),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        *timestamps(),
    )

    op.create_table(
        "agents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id")),
        sa.Column("name", sa.String(length=255)),
        sa.Column("description", sa.Text()),
        sa.Column("beyond_avatar_id", sa.String(length=255)),
        sa.Column("system_prompt", sa.Text()),
        sa.Column("n8n_webhook_url", sa.Text()),
        sa.Column("voice_provider", sa.String(length=100)),
        sa.Column("voice_id", sa.String(length=255)),
        sa.Column("language", sa.String(length=20)),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        *timestamps(),
    )

    op.create_table(
        "devices",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id")),
        sa.Column("agent_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("agents.id")),
        sa.Column("name", sa.String(length=255)),
        sa.Column("location", sa.String(length=255)),
        sa.Column("device_token", sa.Text()),
        sa.Column("status", sa.String(length=50)),
        sa.Column("last_seen", sa.DateTime()),
        *timestamps(),
    )

    op.create_table(
        "widgets",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id")),
        sa.Column("agent_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("agents.id")),
        sa.Column("name", sa.String(length=255)),
        sa.Column("public_token", sa.Text()),
        sa.Column("allowed_domains", postgresql.ARRAY(sa.Text())),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        *timestamps(),
    )

    op.create_table(
        "sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id")),
        sa.Column("agent_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("agents.id")),
        sa.Column("device_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("devices.id"), nullable=True),
        sa.Column("widget_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("widgets.id"), nullable=True),
        sa.Column("session_type", sa.String(length=50)),
        sa.Column("status", sa.String(length=50)),
        sa.Column("started_at", sa.DateTime()),
        sa.Column("ended_at", sa.DateTime(), nullable=True),
        sa.Column("user_connected_at", sa.DateTime(), nullable=True),
        sa.Column("livekit_room_name", sa.String(length=255)),
        sa.Column("conversation_summary", sa.Text()),
        *timestamps(),
    )

    op.create_table(
        "messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("sessions.id")),
        sa.Column("role", sa.String(length=50)),
        sa.Column("message", sa.Text()),
        sa.Column("tokens_used", sa.Integer()),
        *timestamps(),
    )

    op.create_table(
        "session_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("sessions.id")),
        sa.Column("event_type", sa.String(length=100)),
        sa.Column("payload", postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        *timestamps(),
    )

    op.create_table(
        "knowledge_bases",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id")),
        sa.Column("name", sa.String(length=255)),
        sa.Column("description", sa.Text()),
        *timestamps(),
    )

    op.create_table(
        "api_keys",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id")),
        sa.Column("provider", sa.String(length=100)),
        sa.Column("encrypted_key", sa.Text()),
        *timestamps(),
    )

    op.create_index("ix_users_tenant_id", "users", ["tenant_id"])
    op.create_index("ix_agents_tenant_id", "agents", ["tenant_id"])
    op.create_index("ix_devices_tenant_id", "devices", ["tenant_id"])
    op.create_index("ix_widgets_tenant_id", "widgets", ["tenant_id"])
    op.create_index("ix_sessions_tenant_id", "sessions", ["tenant_id"])
    op.create_index("ix_messages_session_id", "messages", ["session_id"])
    op.create_index("ix_session_events_session_id", "session_events", ["session_id"])


def downgrade() -> None:
    op.drop_index("ix_session_events_session_id", table_name="session_events")
    op.drop_index("ix_messages_session_id", table_name="messages")
    op.drop_index("ix_sessions_tenant_id", table_name="sessions")
    op.drop_index("ix_widgets_tenant_id", table_name="widgets")
    op.drop_index("ix_devices_tenant_id", table_name="devices")
    op.drop_index("ix_agents_tenant_id", table_name="agents")
    op.drop_index("ix_users_tenant_id", table_name="users")

    op.drop_table("api_keys")
    op.drop_table("knowledge_bases")
    op.drop_table("session_events")
    op.drop_table("messages")
    op.drop_table("sessions")
    op.drop_table("widgets")
    op.drop_table("devices")
    op.drop_table("agents")
    op.drop_table("users")
    op.drop_table("tenants")
