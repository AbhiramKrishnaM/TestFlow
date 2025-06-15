"""create tests table

Revision ID: 3a4e89b7c123
Revises: 42b2c6b10127
Create Date: 2023-06-15 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3a4e89b7c123'
# Set this to the previous migration's revision ID
down_revision = '42b2c6b10127'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'tests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('feature_id', sa.Integer(), nullable=False),
        sa.Column('tested', sa.Boolean(), default=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['feature_id'], ['features.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tests_id'), 'tests', ['id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_tests_id'), table_name='tests')
    op.drop_table('tests') 