from fastapi import APIRouter

from backend.core.canvas_state import CanvasState
from backend.models.canvas import CanvasSnapshot

def create_rest_router(canvas_state: CanvasState) -> APIRouter:
    router = APIRouter(prefix="/api")
    
    @router.get("/canvas", response_model = CanvasSnapshot)
    async def get_canvas() -> CanvasSnapshot:
        return canvas_state.get_snapshot()
    
    return router