from sqlalchemy.orm import Session
from sqlalchemy import func, and_, case
from typing import List, Optional
from app.models.feature import Feature
from app.models.test import Test
from app.schemas.feature import FeatureCreate, FeatureUpdate

class FeatureRepository:
    @staticmethod
    def get_features(db: Session, skip: int = 0, limit: int = 100):
        return db.query(Feature).offset(skip).limit(limit).all()
        
    @staticmethod
    def get_feature(db: Session, feature_id: int):
        return db.query(Feature).filter(Feature.id == feature_id).first()
        
    @staticmethod
    def get_project_features(db: Session, project_id: int, parent_id: Optional[int] = None, skip: int = 0, limit: int = 100):
        query = db.query(Feature).filter(Feature.project_id == project_id)
        if parent_id is not None:
            query = query.filter(Feature.parent_id == parent_id)
        else:
            query = query.filter(Feature.parent_id.is_(None))
        return query.offset(skip).limit(limit).all()
        
    @staticmethod
    def create_feature(db: Session, feature: FeatureCreate):
        db_feature = Feature(**feature.dict())
        db.add(db_feature)
        db.commit()
        db.refresh(db_feature)
        return db_feature
        
    @staticmethod
    def update_feature(db: Session, feature_id: int, feature: FeatureUpdate):
        db_feature = FeatureRepository.get_feature(db, feature_id)
        if db_feature:
            update_data = feature.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_feature, key, value)
            db.commit()
            db.refresh(db_feature)
        return db_feature
        
    @staticmethod
    def delete_feature(db: Session, feature_id: int):
        db_feature = FeatureRepository.get_feature(db, feature_id)
        if db_feature:
            db.delete(db_feature)
            db.commit()
            return True
        return False
        
    # Analytics methods
    @staticmethod
    def get_features_with_test_counts(db: Session, project_id: Optional[int] = None, limit: int = 5):
        """Get features with test counts, optionally filtered by project"""
        query = db.query(
            Feature.id.label('feature_id'),
            Feature.name.label('feature_name'),
            func.count(Test.id).label('test_count'),
            func.sum(case((Test.tested == True, 1), else_=0)).label('tested_count'),
            func.sum(case((Test.tested == False, 1), else_=0)).label('untested_count')
        ).outerjoin(
            Test, Feature.id == Test.feature_id
        ).group_by(
            Feature.id, Feature.name
        ).order_by(
            func.count(Test.id).desc()
        )
        
        if project_id:
            query = query.filter(Feature.project_id == project_id)
            
        return query.limit(limit).all() 