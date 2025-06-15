"""create node positions table

Revision ID: 0003
Revises: 0002
Create Date: 2023-10-15

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision = '5b3c7c20129'
down_revision = '4b2c6b10128'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'node_positions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('node_id', sa.String(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('node_type', sa.String(), nullable=False),
        sa.Column('position_x', sa.Float(), nullable=False),
        sa.Column('position_y', sa.Float(), nullable=False),
        sa.Column('data', JSONB(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_node_positions_node_id'), 'node_positions', ['node_id'], unique=False)
    op.create_index(op.f('ix_node_positions_id'), 'node_positions', ['id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_node_positions_node_id'), table_name='node_positions')
    op.drop_index(op.f('ix_node_positions_id'), table_name='node_positions')
    op.drop_table('node_positions') 