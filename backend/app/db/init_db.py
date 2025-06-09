from sqlalchemy.orm import Session

from app import models
from app.core.config import settings
from app.core.security import get_password_hash


def init_db(db: Session) -> None:
    """
    Initialize the database with default data
    """
    # Create a default admin user if it doesn't exist
    admin_user = db.query(models.User).filter(models.User.email == "admin@testflow.com").first()
    if not admin_user:
        user_in = {
            "email": "admin@testflow.com",
            "username": "admin",
            "full_name": "Administrator",
            "password": "admin123",  # This should be a secure password in production
        }
        user = models.User(
            email=user_in["email"],
            username=user_in["username"],
            full_name=user_in["full_name"],
            hashed_password=get_password_hash(user_in["password"]),
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print("Admin user created") 