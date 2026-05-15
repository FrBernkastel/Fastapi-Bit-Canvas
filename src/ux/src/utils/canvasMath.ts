export function getCellFromCanvasPoint(
  canvasX: number,
  canvasY: number,
  cellSize: number,
): { x: number; y: number } {
  return {
    x: Math.floor(canvasX / cellSize),
    y: Math.floor(canvasY / cellSize),
  };
}

export function isInsideCanvas(
  x: number,
  y: number,
  width: number,
  height: number,
): boolean {
  return x >= 0 && x < width && y >= 0 && y < height;
}
