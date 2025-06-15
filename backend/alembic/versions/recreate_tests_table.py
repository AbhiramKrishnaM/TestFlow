"""recreate tests table

Revision ID: 6c3d7d20130
Revises: fe32e6c02885
Create Date: 2025-06-15

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '6c3d7d20130'
down_revision = 'fe32e6c02885'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create the tests table that was accidentally dropped
    op.create_table('tests',
        sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column('feature_id', sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column('tested', sa.BOOLEAN(), autoincrement=False, nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
        sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=True),
        sa.Column('priority', postgresql.ENUM('high', 'normal', 'low', name='priorityenum', create_type=False), server_default=sa.text("'normal'::priorityenum"), autoincrement=False, nullable=False),
        sa.ForeignKeyConstraint(['feature_id'], ['features.id'], name='tests_feature_id_fkey', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name='tests_pkey')
    )
    op.create_index(op.f('ix_tests_id'), 'tests', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_tests_id'), table_name='tests')
    op.drop_table('tests') 