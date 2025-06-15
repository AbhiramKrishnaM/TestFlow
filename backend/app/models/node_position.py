from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import TIMESTAMP

from app.db.database import Base


class NodePosition(Base):
    __tablename__ = "node_positions"

    id = Column(Integer, primary_key=True, index=True)
    node_id = Column(String, nullable=False, index=True)  # ID of the node in the flow
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    node_type = Column(String, nullable=False)  # Type of the node (e.g., featureNode, testNode)
    position_x = Column(Float, nullable=False)  # X coordinate
    position_y = Column(Float, nullable=False)  # Y coordinate
    data = Column(JSON, nullable=True)  # Additional data (optional)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now())

    # Relationship
    project = relationship("Project", back_populates="node_positions") 