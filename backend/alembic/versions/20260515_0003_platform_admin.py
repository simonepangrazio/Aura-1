"""platform admin role support

Revision ID: 20260515_0003
Revises: 20260515_0002
Create Date: 2026-05-15
"""

from typing import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


revision: str = "20260515_0003"
down_revision: str | None = "20260515_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _column_names(table_name: str) -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {column["name"] for column in inspector.get_columns(table_name)}


def upgrade() -> None:
    columns = _column_names("users")
    if "role" not in columns:
        op.add_column("users", sa.Column("role", sa.String(length=50), nullable=True))
    if "tenant_id" in columns:
        op.alter_column("users", "tenant_id", existing_type=postgresql.UUID(as_uuid=True), nullable=True)

    op.execute("UPDATE users SET role = 'tenant_admin' WHERE role IN ('owner', 'admin', 'tenant_owner') OR role IS NULL")


def downgrade() -> None:
    op.execute("UPDATE users SET role = 'admin' WHERE role = 'tenant_admin'")
