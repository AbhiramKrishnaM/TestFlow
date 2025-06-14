from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Feature(Base):
    __tablename__ = "features"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    parent_id = Column(Integer, ForeignKey("features.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="features")
    tests = relationship("Test", back_populates="feature", cascade="all, delete-orphan")
    
    # Self-referential relationship
    children = relationship("Feature", 
                           backref="parent",
                           remote_side=[id],
                           cascade="all") 