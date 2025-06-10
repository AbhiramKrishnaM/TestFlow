from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.db.database import Base

class TestRunStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    PASSED = "passed"
    FAILED = "failed"

class TestRun(Base):
    __tablename__ = "test_runs"

    id = Column(Integer, primary_key=True, index=True)
    test_case_id = Column(Integer, ForeignKey("test_cases.id"))
    status = Column(Enum(TestRunStatus), default=TestRunStatus.PENDING)
    notes = Column(Text, nullable=True)
    executed_by = Column(Integer, ForeignKey("users.id"))
    executed_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    test_case = relationship("TestCase", back_populates="test_runs")
    executor = relationship("User", foreign_keys=[executed_by]) 