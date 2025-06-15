from typing import Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime


class NodePositionBase(BaseModel):
    node_id: str
    project_id: int
    node_type: str
    position_x: float
    position_y: float
    data: Optional[Dict[str, Any]] = None


class NodePositionCreate(NodePositionBase):
    pass


class NodePositionUpdate(BaseModel):
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    data: Optional[Dict[str, Any]] = None


class NodePosition(NodePositionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# For bulk operations
class NodePositionBulkCreate(BaseModel):
    project_id: int
    positions: list[NodePositionCreate]


class NodePositionBulkUpdate(BaseModel):
    positions: list[NodePosition] 