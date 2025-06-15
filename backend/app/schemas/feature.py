from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


# Shared properties
class FeatureBase(BaseModel):
    name: str
    description: Optional[str] = None


# Properties to receive on feature creation
class FeatureCreate(FeatureBase):
    project_id: int
    parent_id: Optional[int] = None


# Properties to receive on feature update
class FeatureUpdate(FeatureBase):
    parent_id: Optional[int] = None


# Properties shared by models stored in DB
class FeatureInDBBase(FeatureBase):
    id: int
    project_id: int
    parent_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


# Properties to return to client
class Feature(FeatureInDBBase):
    pass


# Recursive Feature model for nested representation
class FeatureWithChildren(Feature):
    children: List['FeatureWithChildren'] = []


# Complete the recursive type reference
FeatureWithChildren.update_forward_refs() 