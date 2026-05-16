import re
from backend.models.canvas import CanvasSnapshot, HexColor

HEX_COLOR_PATTERN = re.compile(r"^#[0-9a-fA-F]{6}$")

class CanvasState:
    def __init__(
        self,
        width: int,
        height:int,
        default_color: HexColor = "#ffffff"
    ) -> None:
        self.width = width
        self.height = height
        self.default_color = default_color
        self._pixels: list[list[HexColor]] = [
                [default_color for _ in range(width)] for _ in range(height)
            ]
        
    def get_snapshot(self) -> CanvasSnapshot:
        return CanvasSnapshot(
            width = self.width,
            height = self.height,
            defaultColor = self.default_color,
            pixels = self._copy_pixels()
        )
        
    def set_pixel(self, x: int, y: int, color: HexColor) -> None:
        self._validate_coordinate(x, y)
        self._validate_color(color)
        
        self._pixels[y][x] = color
        
    def _copy_pixels(self) -> list[list[HexColor]]:
        return [row.copy() for row in self._pixels]
        
    def _validate_coordinate(self, x: int, y: int) -> None:
        if x < 0 or x >= self.width or y < 0 or y >= self.height:
            raise ValueError(f"Pixel coordinate out of range: x={x}, y={y}")
        
    def _validate_color(self, color: HexColor) -> None:
        if not HEX_COLOR_PATTERN.match(color):
            raise ValueError(f"Invalid hex color: {color}")