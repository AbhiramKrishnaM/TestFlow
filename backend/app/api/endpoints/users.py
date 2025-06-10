from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.core.security import get_password_hash

router = APIRouter()

@router.get("/me", response_model=schemas.User)
def read_user_me(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=schemas.User)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update current user.
    """
    if user_in.password:
        hashed_password = get_password_hash(user_in.password)
        current_user.hashed_password = hashed_password
    
    if user_in.email:
        # Check if email is already in use
        email_exists = db.query(models.User).filter(
            models.User.email == user_in.email,
            models.User.id != current_user.id
        ).first()
        if email_exists:
            raise HTTPException(
                status_code=400,
                detail="Email already registered",
            )
        current_user.email = user_in.email
    
    if user_in.username:
        # Check if username is already in use
        username_exists = db.query(models.User).filter(
            models.User.username == user_in.username,
            models.User.id != current_user.id
        ).first()
        if username_exists:
            raise HTTPException(
                status_code=400,
                detail="Username already registered",
            )
        current_user.username = user_in.username
    
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

# User management endpoints
@router.get("/", response_model=List[schemas.User])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve users.
    """
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=schemas.User)
def read_user(
    user_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get a specific user by id.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )
    return user

@router.post("/", response_model=schemas.User)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new user.
    """
    # Check if user with this email exists
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )
    
    # Check if user with this username exists
    user = db.query(models.User).filter(models.User.username == user_in.username).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered",
        )
    
    user = models.User(
        email=user_in.email,
        username=user_in.username,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        is_active=user_in.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.put("/{user_id}", response_model=schemas.User)
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a user.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )
    
    # Update fields
    if user_in.password:
        user.hashed_password = get_password_hash(user_in.password)
    
    if user_in.email:
        # Check if email is already in use
        email_exists = db.query(models.User).filter(
            models.User.email == user_in.email,
            models.User.id != user_id
        ).first()
        if email_exists:
            raise HTTPException(
                status_code=400,
                detail="Email already registered",
            )
        user.email = user_in.email
    
    if user_in.username:
        # Check if username is already in use
        username_exists = db.query(models.User).filter(
            models.User.username == user_in.username,
            models.User.id != user_id
        ).first()
        if username_exists:
            raise HTTPException(
                status_code=400,
                detail="Username already registered",
            )
        user.username = user_in.username
    
    if user_in.full_name is not None:
        user.full_name = user_in.full_name
    
    if user_in.is_active is not None:
        user.is_active = user_in.is_active
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user 