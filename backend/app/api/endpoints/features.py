from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.models.user import User

router = APIRouter()


@router.get("/project/{project_id}", response_model=List[schemas.Feature])
def read_features(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve features for a specific project.
    """
    # Check if user has access to this project
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.owner_id != current_user.id and current_user not in project.members:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    features = (
        db.query(models.Feature)
        .filter(models.Feature.project_id == project_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return features


@router.post("/", response_model=schemas.Feature)
def create_feature(
    *,
    db: Session = Depends(deps.get_db),
    feature_in: schemas.FeatureCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new feature.
    """
    # Check if user has access to the project
    project = db.query(models.Project).filter(models.Project.id == feature_in.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.owner_id != current_user.id and current_user not in project.members:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    feature = models.Feature(**feature_in.dict())
    db.add(feature)
    db.commit()
    db.refresh(feature)
    return feature


@router.get("/{feature_id}", response_model=schemas.Feature)
def read_feature(
    *,
    db: Session = Depends(deps.get_db),
    feature_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get feature by ID.
    """
    feature = db.query(models.Feature).filter(models.Feature.id == feature_id).first()
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    
    # Check if user has access to the project
    project = db.query(models.Project).filter(models.Project.id == feature.project_id).first()
    if project.owner_id != current_user.id and current_user not in project.members:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return feature


@router.put("/{feature_id}", response_model=schemas.Feature)
def update_feature(
    *,
    db: Session = Depends(deps.get_db),
    feature_id: int,
    feature_in: schemas.FeatureUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a feature.
    """
    feature = db.query(models.Feature).filter(models.Feature.id == feature_id).first()
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    
    # Check if user has access to the project
    project = db.query(models.Project).filter(models.Project.id == feature.project_id).first()
    if project.owner_id != current_user.id and current_user not in project.members:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    update_data = feature_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(feature, field, value)
    
    db.add(feature)
    db.commit()
    db.refresh(feature)
    return feature


@router.delete("/{feature_id}", response_model=schemas.Feature)
def delete_feature(
    *,
    db: Session = Depends(deps.get_db),
    feature_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a feature.
    """
    feature = db.query(models.Feature).filter(models.Feature.id == feature_id).first()
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    
    # Check if user has access to the project
    project = db.query(models.Project).filter(models.Project.id == feature.project_id).first()
    if project.owner_id != current_user.id and current_user not in project.members:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(feature)
    db.commit()
    return feature 