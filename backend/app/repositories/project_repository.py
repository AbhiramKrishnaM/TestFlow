from sqlalchemy.orm import Session
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate

class ProjectRepository:
    @staticmethod
    def get_projects(db: Session, skip: int = 0, limit: int = 100):
        return db.query(Project).offset(skip).limit(limit).all()
        
    @staticmethod
    def get_project(db: Session, project_id: int):
        return db.query(Project).filter(Project.id == project_id).first()
        
    @staticmethod
    def create_project(db: Session, project: ProjectCreate, owner_id: int):
        db_project = Project(
            name=project.name,
            description=project.description,
            owner_id=owner_id
        )
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        return db_project
        
    @staticmethod
    def update_project(db: Session, project_id: int, project: ProjectUpdate):
        db_project = ProjectRepository.get_project(db, project_id)
        if db_project:
            update_data = project.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_project, key, value)
            db.commit()
            db.refresh(db_project)
        return db_project
        
    @staticmethod
    def delete_project(db: Session, project_id: int):
        db_project = ProjectRepository.get_project(db, project_id)
        if db_project:
            db.delete(db_project)
            db.commit()
            return True
        return False 