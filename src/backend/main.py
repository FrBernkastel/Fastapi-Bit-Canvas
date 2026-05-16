from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.rest import create_rest_router
from backend.api.ws import create_ws_router
from backend.core.canvas_state import CanvasState
from backend.core.connection_manager import ConnectionManager

# Constants
WIDTH = 128
HEIGHT = 128
DEFAULT_COLOR = "#ffffff"

# init the shares
canvas_state = CanvasState(
    width = WIDTH,
    height = HEIGHT,
    default_color= DEFAULT_COLOR
)
connection_manager = ConnectionManager()

app = FastAPI(
    title="Shared Pixel Canvas API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(create_rest_router(canvas_state))
app.include_router(create_ws_router(canvas_state, connection_manager))

@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}