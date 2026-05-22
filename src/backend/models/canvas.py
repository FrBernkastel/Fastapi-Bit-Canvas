from typing import Literal
from pydantic import BaseModel, Field

HexColor = str

# Shared contract
class PixelChange(BaseModel):
    x: int = Field(ge=0)
    y: int = Field(ge=0)
    color: HexColor

# User Sent
class PixelUpdate(BaseModel):
    type: Literal["pixel_update"]
    x: int = Field(ge=0)
    y: int = Field(ge=0)
    color: HexColor

class PixelBatchUpdate(BaseModel):
    type: Literal["pixel_batch_update"]
    pixels: list[PixelChange] = Field(min_length=1)
    
class PixelBatchUpdated(BaseModel):
    type: Literal["pixel_batch_updated"] = "pixel_batch_updated"
    pixels: list[PixelChange]

# Server Sent
class PixelUpdated(BaseModel):
    type: Literal["pixel_updated"] = "pixel_updated"
    x: int
    y: int
    color: HexColor

class CanvasSnapshot(BaseModel):
    width: int
    height: int
    defaultColor: HexColor
    pixels: list[list[HexColor]]

class ErrorMessage(BaseModel):
    type: Literal["error"] = "error"
    message: str
