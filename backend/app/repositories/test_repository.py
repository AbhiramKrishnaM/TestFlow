from sqlalchemy.orm import Session
from app.models.test import Test
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