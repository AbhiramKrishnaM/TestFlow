from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TestBase(BaseModel):
    name: str
    feature_id: int
    tested: bool = False


class TestCreate(TestBase):
    pass


class TestUpdate(BaseModel):
    name: Optional[str] = None
    tested: Optional[bool] = None


class Test(TestBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True 