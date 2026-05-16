from fastapi import WebSocket

class ConnectionManager:
    def __init__(self) -> None:
        self._connections: set[WebSocket] = set()
    
    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections.add(websocket)
        
    def disconnect(self, websocket: WebSocket) -> None:
        self._connections.discard(websocket)
        
    async def send_json(self, websocket: WebSocket, message: dict) -> None:
        await websocket.send_json(message)
        
    async def broadcast_json(self, message: dict) -> None:
        disconnected: list[WebSocket] = []
        
        for ws in self._connections:
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.append(ws)
        
        for ws in disconnected:
            self.disconnect(ws)
            