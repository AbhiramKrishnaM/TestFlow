from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from datetime import datetime
from typing import List, Dict, Any
from app.models.test import Test
from app.models.feature import Feature
from app.schemas.test import TestCreate, TestUpdate


class TestRepository:
    @staticmethod
    def get_tests(db: Session, skip: int = 0, limit: int = 100):
        return db.query(Test).offset(skip).limit(limit).all()

    @staticmethod
    def get_test(db: Session, test_id: int):
        return db.query(Test).filter(Test.id == test_id).first()

    @staticmethod
    def get_feature_tests(db: Session, feature_id: int, skip: int = 0, limit: int = 100):
        return db.query(Test).filter(Test.feature_id == feature_id).offset(skip).limit(limit).all()

    @staticmethod
    def create_test(db: Session, test: TestCreate):
        db_test = Test(**test.dict())
        db.add(db_test)
        db.commit()
        db.refresh(db_test)
        return db_test

    @staticmethod
    def update_test(db: Session, test_id: int, test: TestUpdate):
        db_test = TestRepository.get_test(db, test_id)
        if db_test:
            update_data = test.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_test, key, value)
            db.commit()
            db.refresh(db_test)
        return db_test

    @staticmethod
    def delete_test(db: Session, test_id: int):
        db_test = TestRepository.get_test(db, test_id)
        if db_test:
            db.delete(db_test)
            db.commit()
            return True
        return False
        
    # Analytics methods
    @staticmethod
    def count_tests_by_status(db: Session, tested: bool = None):
        """Count tests by tested status"""
        query = db.query(func.count(Test.id))
        if tested is not None:
            query = query.filter(Test.tested == tested)
        return query.scalar() or 0
        
    @staticmethod
    def count_tests_by_priority(db: Session, priority: str = None):
        """Count tests by priority"""
        query = db.query(func.count(Test.id))
        if priority:
            query = query.filter(Test.priority == priority)
        return query.scalar() or 0
        
    @staticmethod
    def get_activity_by_date_range(db: Session, start_date: datetime, end_date: datetime):
        """Get test and feature creation activity by date range"""
        # Query for test creation by date
        test_counts = db.query(
            func.date(Test.created_at).label('date'),
            func.count(Test.id).label('count')
        ).filter(
            Test.created_at.between(start_date, end_date)
        ).group_by(
            func.date(Test.created_at)
        ).all()
        
        # Query for feature creation by date
        feature_counts = db.query(
            func.date(Feature.created_at).label('date'),
            func.count(Feature.id).label('count')
        ).filter(
            Feature.created_at.between(start_date, end_date)
        ).group_by(
            func.date(Feature.created_at)
        ).all()
        
        # Combine the results
        result = {}
        for date, count in test_counts:
            if date not in result:
                result[date] = {"date": date, "test_count": 0, "feature_count": 0}
            result[date]["test_count"] = count
            
        for date, count in feature_counts:
            if date not in result:
                result[date] = {"date": date, "test_count": 0, "feature_count": 0}
            result[date]["feature_count"] = count
            
        return list(result.values())
        
    @staticmethod
    def get_monthly_test_progress(db: Session, start_date: datetime, end_date: datetime, project_id: int = None):
        """Get monthly test progress (tests added and completed)"""
        # Base query filters
        filters = [Test.created_at.between(start_date, end_date)]
        if project_id:
            filters.append(Feature.project_id == project_id)
        
        # Query for added tests by month
        added_query = db.query(
            extract('month', Test.created_at).label('month'),
            extract('year', Test.created_at).label('year'),
            func.count(Test.id).label('count')
        ).join(Feature, Test.feature_id == Feature.id)
        
        if filters:
            added_query = added_query.filter(and_(*filters))
            
        added_counts = added_query.group_by(
            extract('year', Test.created_at),
            extract('month', Test.created_at)
        ).all()
        
        # Query for completed tests by month (when tested status changed to True)
        # Note: This is an approximation since we don't track status changes
        # In a real app, you'd have a history table or events to track this accurately
        completed_filters = filters.copy()
        completed_filters.append(Test.tested == True)
        
        completed_query = db.query(
            extract('month', Test.updated_at).label('month'),
            extract('year', Test.updated_at).label('year'),
            func.count(Test.id).label('count')
        ).join(Feature, Test.feature_id == Feature.id)
        
        if completed_filters:
            completed_query = completed_query.filter(and_(*completed_filters))
            
        completed_counts = completed_query.group_by(
            extract('year', Test.updated_at),
            extract('month', Test.updated_at)
        ).all()
        
        # Combine results
        result = {}
        for month, year, count in added_counts:
            key = (int(year), int(month))
            if key not in result:
                result[key] = {"month": int(month), "year": int(year), "added": 0, "completed": 0}
            result[key]["added"] = count
            
        for month, year, count in completed_counts:
            key = (int(year), int(month))
            if key not in result:
                result[key] = {"month": int(month), "year": int(year), "added": 0, "completed": 0}
            result[key]["completed"] = count
            
        return list(result.values()) 