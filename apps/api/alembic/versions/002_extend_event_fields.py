"""extend events table with extra event fields (mood/schedule/rule/restrictions)"""

from alembic import op
import sqlalchemy as sa

revision = "002_extend_event_fields"
down_revision = "001_init_models"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("events", sa.Column("mood", sa.JSON(), nullable=True))
    op.add_column("events", sa.Column("schedule_items", sa.JSON(), nullable=True))
    op.add_column("events", sa.Column("rule_text", sa.Text(), nullable=True))
    op.add_column("events", sa.Column("restrictions", sa.JSON(), nullable=True))
    op.add_column("events", sa.Column("location_note", sa.Text(), nullable=True))
    op.add_column("events", sa.Column("reservation_note", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("events", "reservation_note")
    op.drop_column("events", "location_note")
    op.drop_column("events", "restrictions")
    op.drop_column("events", "rule_text")
    op.drop_column("events", "schedule_items")
    op.drop_column("events", "mood")

