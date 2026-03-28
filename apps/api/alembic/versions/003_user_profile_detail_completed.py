"""add users.profile_detail_completed for onboarding gate"""

from alembic import op
import sqlalchemy as sa

revision = "003_user_profile_detail_completed"
down_revision = "002_extend_event_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "profile_detail_completed",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )
    # 既存ユーザーはオンボーディング済みとみなす
    op.execute(sa.text("UPDATE users SET profile_detail_completed = true"))


def downgrade() -> None:
    op.drop_column("users", "profile_detail_completed")
