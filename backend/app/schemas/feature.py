from typing import Optional
from datetime import datetime
from pydantic import BaseModel


# Shared properties
class FeatureBase(BaseModel):
    name: str
    description: Optional[str] = None


# Properties to receive on feature creation
class FeatureCreate(FeatureBase):
    project_id: int


# Properties to receive on feature update
class FeatureUpdate(FeatureBase):
    pass


# Properties shared by models stored in DB
class FeatureInDBBase(FeatureBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


# Properties to return to client
class Feature(FeatureInDBBase):
    pass 