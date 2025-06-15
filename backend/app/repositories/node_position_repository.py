from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.node_position import NodePosition
from app.schemas.node_position import NodePositionCreate, NodePositionUpdate


class NodePositionRepository:
    @staticmethod
    def get_project_node_positions(db: Session, project_id: int, skip: int = 0, limit: int = 1000):
        """Get all node positions for a project"""
        return db.query(NodePosition).filter(
            NodePosition.project_id == project_id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_node_position(db: Session, node_id: str, project_id: int) -> Optional[NodePosition]:
        """Get a specific node position by node_id and project_id"""
        return db.query(NodePosition).filter(
            NodePosition.node_id == node_id,
            NodePosition.project_id == project_id
        ).first()
    
    @staticmethod
    def create_node_position(db: Session, node_position: NodePositionCreate) -> NodePosition:
        """Create a new node position"""
        db_node_position = NodePosition(**node_position.dict())
        db.add(db_node_position)
        db.commit()
        db.refresh(db_node_position)
        return db_node_position
    
    @staticmethod
    def update_node_position(db: Session, node_id: str, project_id: int, node_position: NodePositionUpdate) -> Optional[NodePosition]:
        """Update an existing node position"""
        db_node_position = NodePositionRepository.get_node_position(db, node_id, project_id)
        if db_node_position:
            update_data = node_position.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_node_position, key, value)
            db.commit()
            db.refresh(db_node_position)
        return db_node_position
    
    @staticmethod
    def delete_node_position(db: Session, node_id: str, project_id: int) -> bool:
        """Delete a node position"""
        db_node_position = NodePositionRepository.get_node_position(db, node_id, project_id)
        if db_node_position:
            db.delete(db_node_position)
            db.commit()
            return True
        return False
    
    @staticmethod
    def delete_project_node_positions(db: Session, project_id: int) -> bool:
        """Delete all node positions for a project"""
        try:
            db.query(NodePosition).filter(NodePosition.project_id == project_id).delete()
            db.commit()
            return True
        except Exception as e:
            # If table doesn't exist yet, just log and return True
            print(f"Warning: Could not delete node positions: {e}")
            db.rollback()
            return True
    
    @staticmethod
    def bulk_create_or_update_node_positions(db: Session, project_id: int, node_positions: List[NodePositionCreate]) -> List[NodePosition]:
        """Create or update multiple node positions at once"""
        try:
            # First, delete all existing node positions for this project
            NodePositionRepository.delete_project_node_positions(db, project_id)
            
            # Then create all the new positions
            db_node_positions = []
            for position in node_positions:
                db_node_position = NodePosition(**position.dict())
                db.add(db_node_position)
                db_node_positions.append(db_node_position)
            
            db.commit()
            
            # Refresh all the objects
            for position in db_node_positions:
                db.refresh(position)
            
            return db_node_positions
        except Exception as e:
            print(f"Error in bulk create/update node positions: {e}")
            db.rollback()
            return [] 