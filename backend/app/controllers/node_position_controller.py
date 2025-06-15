from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.schemas.node_position import NodePosition, NodePositionCreate, NodePositionUpdate, NodePositionBulkCreate
from app.repositories.node_position_repository import NodePositionRepository
from app.db.database import get_db

router = APIRouter(
    prefix="/node-positions",
    tags=["node-positions"],
    responses={404: {"description": "Not found"}},
)


@router.get("/project/{project_id}", response_model=List[NodePosition])
def get_project_node_positions(project_id: int, skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    """Get all node positions for a project"""
    positions = NodePositionRepository.get_project_node_positions(db, project_id=project_id, skip=skip, limit=limit)
    return positions


@router.post("/", response_model=NodePosition, status_code=status.HTTP_201_CREATED)
def create_node_position(node_position: NodePositionCreate, db: Session = Depends(get_db)):
    """Create a new node position"""
    return NodePositionRepository.create_node_position(db=db, node_position=node_position)


@router.put("/{node_id}/project/{project_id}", response_model=NodePosition)
def update_node_position(node_id: str, project_id: int, node_position: NodePositionUpdate, db: Session = Depends(get_db)):
    """Update a node position"""
    db_node_position = NodePositionRepository.update_node_position(
        db=db, node_id=node_id, project_id=project_id, node_position=node_position
    )
    if db_node_position is None:
        raise HTTPException(status_code=404, detail="Node position not found")
    return db_node_position


@router.delete("/{node_id}/project/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_node_position(node_id: str, project_id: int, db: Session = Depends(get_db)):
    """Delete a node position"""
    success = NodePositionRepository.delete_node_position(db=db, node_id=node_id, project_id=project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Node position not found")
    return None


@router.delete("/project/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_node_positions(project_id: int, db: Session = Depends(get_db)):
    """Delete all node positions for a project"""
    NodePositionRepository.delete_project_node_positions(db=db, project_id=project_id)
    return None


@router.post("/bulk", response_model=List[NodePosition], status_code=status.HTTP_201_CREATED)
def bulk_create_or_update_node_positions(bulk_data: NodePositionBulkCreate, db: Session = Depends(get_db)):
    """Create or update multiple node positions at once"""
    positions = NodePositionRepository.bulk_create_or_update_node_positions(
        db=db, project_id=bulk_data.project_id, node_positions=bulk_data.positions
    )
    return positions 