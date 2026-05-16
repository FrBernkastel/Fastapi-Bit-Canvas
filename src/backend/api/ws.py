from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from backend.core.canvas_state import CanvasState
from backend.core.connection_manager import ConnectionManager
from backend.models.canvas import ErrorMessage, PixelUpdate, PixelUpdated

def create_ws_router(
    canvas_state: CanvasState,
    connection_manager: ConnectionManager
) -> APIRouter:
    router = APIRouter()
    
    @router.websocket("/ws/canvas")
    async def canvas_websocket(websocket: WebSocket) -> None:
        await connection_manager.connect(websocket)
        
        try:
            while True:
                raw_message = await websocket.receive_json()
                
                try:
                    pixel_update = PixelUpdate.model_validate(raw_message)
                    canvas_state.set_pixel(
                        pixel_update.x,
                        pixel_update.y,
                        pixel_update.color
                    )
                    
                    event = PixelUpdated(
                        x = pixel_update.x,
                        y = pixel_update.y,
                        color = pixel_update.color
                    )
                    
                    await connection_manager.broadcast_json(event.model_dump())
                
                except (ValueError, ValidationError) as error:
                    error_message = ErrorMessage(message=str(error))
                    await connection_manager.send_json(
                        websocket, 
                        error_message.model_dump(),
                    )
                    
        except WebSocketDisconnect:
            connection_manager.disconnect(websocket)
            
    return router