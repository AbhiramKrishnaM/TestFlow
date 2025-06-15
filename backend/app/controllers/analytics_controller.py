from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timedelta
import calendar

from app.db.database import get_db
from app.repositories.project_repository import ProjectRepository
from app.repositories.feature_repository import FeatureRepository
from app.repositories.test_repository import TestRepository
from app.schemas.analytics import (
    TestStatusCount,
    TestPriorityCount,
    FeatureTestCount,
    ProjectActivityData,
    TestProgressData
)

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
    responses={404: {"description": "Not found"}},
)

@router.get("/test-status", response_model=TestStatusCount)
def get_test_status_counts(db: Session = Depends(get_db)):
    """Get counts of tested vs untested tests"""
    tested_count = TestRepository.count_tests_by_status(db, tested=True)
    untested_count = TestRepository.count_tests_by_status(db, tested=False)
    
    return {
        "tested": tested_count,
        "untested": untested_count,
        "total": tested_count + untested_count
    }

@router.get("/test-priority", response_model=TestPriorityCount)
def get_test_priority_counts(db: Session = Depends(get_db)):
    """Get counts of tests by priority"""
    high_count = TestRepository.count_tests_by_priority(db, "high")
    normal_count = TestRepository.count_tests_by_priority(db, "normal")
    low_count = TestRepository.count_tests_by_priority(db, "low")
    
    return {
        "high": high_count,
        "normal": normal_count,
        "low": low_count,
        "total": high_count + normal_count + low_count
    }

@router.get("/feature-test-counts", response_model=List[FeatureTestCount])
def get_feature_test_counts(project_id: int = None, limit: int = 5, db: Session = Depends(get_db)):
    """Get test counts for top features (optionally filtered by project)"""
    return FeatureRepository.get_features_with_test_counts(db, project_id, limit)

@router.get("/project-activity", response_model=ProjectActivityData)
def get_project_activity(days: int = 30, db: Session = Depends(get_db)):
    """Get project activity over time (features and tests created)"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Get activity data
    data = TestRepository.get_activity_by_date_range(db, start_date, end_date)
    
    # Format into expected structure
    dates = []
    test_counts = []
    feature_counts = []
    
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        dates.append(date_str)
        
        test_count = 0
        feature_count = 0
        for item in data:
            if item["date"].strftime("%Y-%m-%d") == date_str:
                test_count = item["test_count"]
                feature_count = item["feature_count"]
                break
        
        test_counts.append(test_count)
        feature_counts.append(feature_count)
        current_date += timedelta(days=1)
    
    return {
        "dates": dates,
        "test_counts": test_counts,
        "feature_counts": feature_counts
    }

@router.get("/test-progress", response_model=TestProgressData)
def get_test_progress(project_id: int = None, db: Session = Depends(get_db)):
    """Get test progress over the last 6 months"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=180)  # Approximately 6 months
    
    # Get monthly data
    monthly_data = TestRepository.get_monthly_test_progress(db, start_date, end_date, project_id)
    
    # Format into expected structure
    months = []
    completed = []
    added = []
    
    # Initialize with last 6 months
    current_date = start_date
    while current_date <= end_date:
        month_name = calendar.month_name[current_date.month][:3]  # Abbreviated month name
        month_key = f"{month_name} {current_date.year}"
        
        if month_key not in months:
            months.append(month_key)
            
            # Find data for this month
            month_data = next((item for item in monthly_data if 
                              item["month"] == current_date.month and 
                              item["year"] == current_date.year), None)
            
            if month_data:
                completed.append(month_data["completed"])
                added.append(month_data["added"])
            else:
                completed.append(0)
                added.append(0)
                
        # Move to next month
        if current_date.month == 12:
            current_date = current_date.replace(year=current_date.year + 1, month=1)
        else:
            current_date = current_date.replace(month=current_date.month + 1)
    
    return {
        "months": months,
        "completed": completed,
        "added": added
    } 