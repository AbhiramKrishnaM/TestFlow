from pydantic import BaseModel, field_validator
from typing import Optional, Literal, Any
from datetime import datetime
from app.models.test import PriorityEnum


class TestBase(BaseModel):
    name: str
    feature_id: int
    tested: bool = False
    priority: Literal["high", "normal", "low"] = "normal"


class TestCreate(TestBase):
    pass


class TestUpdate(BaseModel):
    name: Optional[str] = None
    tested: Optional[bool] = None
    priority: Optional[Literal["high", "normal", "low"]] = None


class Test(TestBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
    }
        
    @field_validator('priority', mode='before')
    @classmethod
    def convert_enum_to_str(cls, v: Any) -> str:
        if isinstance(v, PriorityEnum):
            return v.value
        return v 