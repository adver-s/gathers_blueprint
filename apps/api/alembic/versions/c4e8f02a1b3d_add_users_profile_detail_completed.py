"""add users.profile_detail_completed

Revision ID: c4e8f02a1b3d
Revises: 8a37eb1347e4
Create Date: 2026-04-11

"""
from alembic import op
import sqlalchemy as sa


revision = "c4e8f02a1b3d"
down_revision = "8a37eb1347e4"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "profile_detail_completed",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "profile_detail_completed")
