"""Add priority field to tests table

This migration adds a priority field to the tests table with values: high, normal, low.
The default value is 'normal'.
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = 'add_priority_to_tests'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create enum type
    op.execute("CREATE TYPE priorityenum AS ENUM ('high', 'normal', 'low')")
    
    # Add column with default value
    op.add_column('tests', sa.Column('priority', 
                                     sa.Enum('high', 'normal', 'low', name='priorityenum'),
                                     server_default='normal',
                                     nullable=False))


def downgrade():
    # Remove column
    op.drop_column('tests', 'priority')
    
    # Drop enum type
    op.execute("DROP TYPE priorityenum") 