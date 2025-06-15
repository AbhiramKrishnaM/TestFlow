from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.schemas.test import Test, TestCreate, TestUpdate
from app.repositories.test_repository import TestRepository
from app.db.database import get_db

router = APIRouter(
    prefix="/tests",
    tags=["tests"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[Test])
def get_tests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tests = TestRepository.get_tests(db, skip=skip, limit=limit)
    return tests


@router.get("/{test_id}", response_model=Test)
def get_test(test_id: int, db: Session = Depends(get_db)):
    db_test = TestRepository.get_test(db, test_id=test_id)
    if db_test is None:
        raise HTTPException(status_code=404, detail="Test not found")
    return db_test


@router.get("/feature/{feature_id}", response_model=List[Test])
def get_feature_tests(feature_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tests = TestRepository.get_feature_tests(db, feature_id=feature_id, skip=skip, limit=limit)
    return tests


@router.post("/", response_model=Test, status_code=status.HTTP_201_CREATED)
def create_test(test: TestCreate, db: Session = Depends(get_db)):
    return TestRepository.create_test(db=db, test=test)


@router.put("/{test_id}", response_model=Test)
def update_test(test_id: int, test: TestUpdate, db: Session = Depends(get_db)):
    db_test = TestRepository.update_test(db=db, test_id=test_id, test=test)
    if db_test is None:
        raise HTTPException(status_code=404, detail="Test not found")
    return db_test


@router.patch("/{test_id}/toggle", response_model=Test)
def toggle_test_status(test_id: int, db: Session = Depends(get_db)):
    db_test = TestRepository.get_test(db, test_id=test_id)
    if db_test is None:
        raise HTTPException(status_code=404, detail="Test not found")
    
    update_data = TestUpdate(tested=not db_test.tested)
    return TestRepository.update_test(db=db, test_id=test_id, test=update_data)


@router.delete("/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_test(test_id: int, db: Session = Depends(get_db)):
    success = TestRepository.delete_test(db=db, test_id=test_id)
    if not success:
        raise HTTPException(status_code=404, detail="Test not found")
    return None 