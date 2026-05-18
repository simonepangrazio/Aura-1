"""voice provider runtime configuration

Revision ID: 20260516_0001
Revises: 20260515_0003
Create Date: 2026-05-16
"""

from typing import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


revision: str = "20260516_0001"
down_revision: str | None = "20260515_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _column_names(table_name: str) -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {column["name"] for column in inspector.get_columns(table_name)}


def upgrade() -> None:
    agent_columns = _column_names("agents")
    if "stt_provider" not in agent_columns:
        op.add_column("agents", sa.Column("stt_provider", sa.String(length=100), nullable=True))
    if "stt_model" not in agent_columns:
        op.add_column("agents", sa.Column("stt_model", sa.String(length=255), nullable=True))
    if "tts_model" not in agent_columns:
        op.add_column("agents", sa.Column("tts_model", sa.String(length=255), nullable=True))

    api_key_columns = _column_names("api_keys")
    if "settings" not in api_key_columns:
        op.add_column(
            "api_keys",
            sa.Column(
                "settings",
                postgresql.JSONB(),
                nullable=False,
                server_default=sa.text("'{}'::jsonb"),
            ),
        )

    op.execute("UPDATE agents SET stt_provider = 'browser' WHERE stt_provider IS NULL")


def downgrade() -> None:
    api_key_columns = _column_names("api_keys")
    if "settings" in api_key_columns:
        op.drop_column("api_keys", "settings")

    agent_columns = _column_names("agents")
    if "tts_model" in agent_columns:
        op.drop_column("agents", "tts_model")
    if "stt_model" in agent_columns:
        op.drop_column("agents", "stt_model")
    if "stt_provider" in agent_columns:
        op.drop_column("agents", "stt_provider")
