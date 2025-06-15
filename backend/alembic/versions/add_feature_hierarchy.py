"""add feature hierarchy

Revision ID: 4b2c6b10128
Revises: 3a4e89b7c123
Create Date: 2023-06-16 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4b2c6b10128'
down_revision = '3a4e89b7c123'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('features', sa.Column('parent_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_feature_parent', 'features', 'features', ['parent_id'], ['id'], ondelete='CASCADE')


def downgrade():
    op.drop_constraint('fk_feature_parent', 'features', type_='foreignkey')
    op.drop_column('features', 'parent_id') 