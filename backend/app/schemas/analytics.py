from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class TestStatusCount(BaseModel):
    tested: int
    untested: int
    total: int

class TestPriorityCount(BaseModel):
    high: int
    normal: int
    low: int
    total: int

class FeatureTestCount(BaseModel):
    feature_id: int
    feature_name: str
    test_count: int
    tested_count: int
    untested_count: int

class ProjectActivityData(BaseModel):
    dates: List[str]
    test_counts: List[int]
    feature_counts: List[int]

class TestProgressData(BaseModel):
    months: List[str]
    completed: List[int]
    added: List[int] 