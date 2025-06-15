from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

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
    parent_id: Optional[int] = None,
) -> Any:
    """
    Retrieve features for a specific project.
    Optional filtering by parent_id (None for root features).
    """
    # Check if user has access to this project
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.owner_id != current_user.id and current_user not in project.members:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    query = db.query(models.Feature).filter(models.Feature.project_id == project_id)
    
    # Filter by parent_id (None for root features)
    if parent_id is not None:
        query = query.filter(models.Feature.parent_id == parent_id)
    else:
        query = query.filter(models.Feature.parent_id.is_(None))
    
    features = query.offset(skip).limit(limit).all()
    return features


@router.get("/project/{project_id}/tree", response_model=List[schemas.FeatureWithChildren])
def read_features_tree(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve features for a specific project as a hierarchical tree.
    """
    # Check if user has access to this project
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.owner_id != current_user.id and current_user not in project.members:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Get root features (those with no parent)
    root_features = (
        db.query(models.Feature)
        .filter(models.Feature.project_id == project_id)
        .filter(models.Feature.parent_id.is_(None))
        .all()
    )
    
    # Function to recursively build the feature tree
    def build_feature_tree(feature):
        children = (
            db.query(models.Feature)
            .filter(models.Feature.parent_id == feature.id)
            .all()
        )
        
        result = schemas.FeatureWithChildren(
            id=feature.id,
            name=feature.name,
            description=feature.description,
            project_id=feature.project_id,
            parent_id=feature.parent_id,
            created_at=feature.created_at,
            updated_at=feature.updated_at,
            children=[]
        )
        
        if children:
            result.children = [build_feature_tree(child) for child in children]
        
        return result
    
    # Build the complete feature tree
    feature_tree = [build_feature_tree(feature) for feature in root_features]
    return feature_tree


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
    
    # If parent_id is provided, check that it exists and belongs to the same project
    if feature_in.parent_id is not None:
        parent_feature = db.query(models.Feature).filter(models.Feature.id == feature_in.parent_id).first()
        if not parent_feature:
            raise HTTPException(status_code=404, detail="Parent feature not found")
        if parent_feature.project_id != feature_in.project_id:
            raise HTTPException(status_code=400, detail="Parent feature must belong to the same project")
    
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
    
    # If parent_id is provided, check that it exists, belongs to the same project,
    # and doesn't create a cycle
    if feature_in.parent_id is not None and feature_in.parent_id != feature.parent_id:
        if feature_in.parent_id == feature.id:
            raise HTTPException(status_code=400, detail="A feature cannot be its own parent")
        
        parent_feature = db.query(models.Feature).filter(models.Feature.id == feature_in.parent_id).first()
        if not parent_feature:
            raise HTTPException(status_code=404, detail="Parent feature not found")
        if parent_feature.project_id != feature.project_id:
            raise HTTPException(status_code=400, detail="Parent feature must belong to the same project")
        
        # Check for cycles in the hierarchy
        current_parent = parent_feature
        while current_parent is not None:
            if current_parent.id == feature.id:
                raise HTTPException(status_code=400, detail="Circular dependency detected")
            current_parent = db.query(models.Feature).filter(models.Feature.id == current_parent.parent_id).first()
    
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