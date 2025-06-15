from fastapi import APIRouter

from app.api.endpoints import auth, users, projects, features
from app.controllers import test_controller, node_position_controller

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(features.router, prefix="/features", tags=["features"])
api_router.include_router(test_controller.router, tags=["tests"])
api_router.include_router(node_position_controller.router, tags=["node-positions"]) 