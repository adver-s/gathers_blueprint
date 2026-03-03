"""Init models migration

Revision ID: 001_init_models
Revises: 
Create Date: 2026-03-03 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_init_models'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # NOTE: enums will be created inline with the first table that references them.
    # This avoids a separate top-level CREATE TYPE block and keeps enum creation
    # localized to the table that uses it.

    # Create User table
    op.create_table(
        'User',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('createdAt', sa.DateTime(), nullable=False),
        sa.Column('updatedAt', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index('ix_User_email', 'User', ['email'], unique=True)

    # Create Profile table
    op.create_table(
        'Profile',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('userId', sa.String(), nullable=False),
        sa.Column('bio', sa.String(), nullable=False, server_default=''),
        sa.Column('avatarUrl', sa.String(), nullable=True),
        sa.Column('updatedAt', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['userId'], ['User.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('userId')
    )

    # Create Event table
    op.create_table(
        'Event',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('imageUrl', sa.String(), nullable=True),
        sa.Column('place', sa.String(), nullable=False),
        sa.Column('startsAt', sa.DateTime(), nullable=False),
        sa.Column('capacity', sa.Integer(), nullable=False),
            sa.Column('status', sa.Enum('OPEN', 'CLOSED', 'CANCELLED', name='EventStatus'), nullable=False, server_default='OPEN'),
        sa.Column('ownerUserId', sa.String(), nullable=False),
        sa.Column('createdAt', sa.DateTime(), nullable=False),
        sa.Column('updatedAt', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['ownerUserId'], ['User.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create EventMembership table
    op.create_table(
        'EventMembership',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('eventId', sa.String(), nullable=False),
        sa.Column('userId', sa.String(), nullable=False),
        sa.Column('status', sa.Enum('JOINED', 'LEFT', 'KICKED', name='MembershipStatus'), nullable=False, server_default='JOINED'),
        sa.Column('joinedAt', sa.DateTime(), nullable=False),
        sa.Column('leftAt', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['eventId'], ['Event.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['userId'], ['User.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('eventId', 'userId')
    )
    op.create_index('EventMembership_userId_idx', 'EventMembership', ['userId'])
    op.create_index('EventMembership_eventId_idx', 'EventMembership', ['eventId'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('EventMembership_eventId_idx', 'EventMembership')
    op.drop_index('EventMembership_userId_idx', 'EventMembership')

    # Drop tables
    op.drop_table('EventMembership')
    op.drop_table('Event')
    op.drop_table('Profile')
    op.drop_index('ix_User_email', 'User')
    op.drop_table('User')

    # Drop enums
    membership_status = postgresql.ENUM('JOINED', 'LEFT', 'KICKED', name='MembershipStatus')
    event_status = postgresql.ENUM('OPEN', 'CLOSED', 'CANCELLED', name='EventStatus')
    membership_status.drop(op.get_bind(), checkfirst=True)
    event_status.drop(op.get_bind(), checkfirst=True)
