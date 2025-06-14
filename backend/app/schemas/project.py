from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.schemas.user import UserBase

# Shared properties
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

# Properties to receive via API on creation
class ProjectCreate(ProjectBase):
    pass

# Properties to receive via API on update
class ProjectUpdate(ProjectBase):
    pass

# Properties to return via API
class ProjectInDBBase(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Additional properties to return via API
class Project(ProjectInDBBase):
    pass

# Project with members
class ProjectWithMembers(Project):
    members: List[UserBase] = []
    
# Project with full details
class ProjectDetail(ProjectWithMembers):
    pass 