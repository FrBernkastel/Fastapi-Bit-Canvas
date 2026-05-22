import { useEffect, useLayoutEffect, useRef } from "react";
import type { HexColor, PixelGrid } from "../types/canvas";
import { getCellFromCanvasPoint, isInsideCanvas } from "../utils/canvasMath";

interface PixelCanvasProps {
  pixels: PixelGrid;
  cellSize: number;
  onPixelsPaint: (cells: Cell[]) => void;
  onZoom: (direction: "in" | "out") => void;
}

interface CanvasPoint {
  canvasX: number;
  canvasY: number;
}

interface Cell {
  x: number;
  y: number;
}

export function PixelCanvas({
  pixels,
  cellSize,
  onPixelsPaint,
  onZoom,
}: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<CanvasPoint | null>(null);
  const lastPaintedCellRef = useRef<Cell | null>(null);

  const pendingZoomAnchorRef = useRef<{
    logicalX: number;
    logicalY: number;
    clientX: number;
    clientY: number;
  } | null>(null);

  const height = pixels.length;
  const width = pixels[0]?.length ?? 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, width * cellSize, height * cellSize);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color: HexColor = pixels[y][x];

        context.fillStyle = color;
        context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    context.strokeStyle = "#dddddd";
    context.lineWidth = 1;

    for (let x = 0; x <= width; x++) {
      const lineX = getGridLinePosition(x, width, cellSize);

      context.beginPath();
      context.moveTo(lineX, 0);
      context.lineTo(lineX, height * cellSize);
      context.stroke();
    }

    for (let y = 0; y <= height; y++) {
      const lineY = getGridLinePosition(y, height, cellSize);

      context.beginPath();
      context.moveTo(0, lineY);
      context.lineTo(width * cellSize, lineY);
      context.stroke();
    }
  }, [pixels, width, height, cellSize]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (event.button !== 0) return;

      isDrawingRef.current = true;

      const point = getCanvasPointFromPointerEvent(event);
      lastPointRef.current = point;
      lastPaintedCellRef.current = null;

      const cell = getPaintCellAtPoint(point);
      if (cell) {
        onPixelsPaint([cell]);
      }
    }

    function handlePointerMove(event: PointerEvent) {
      if (!isDrawingRef.current) return;

      const currentPoint = getCanvasPointFromPointerEvent(event);
      const lastPoint = lastPointRef.current;

      if (!lastPoint) {
        lastPointRef.current = currentPoint;
        const cell = getPaintCellAtPoint(currentPoint);
        if (cell) {
          onPixelsPaint([cell]);
        }
        return;
      }

      paintBetweenPoints(lastPoint, currentPoint);
      lastPointRef.current = currentPoint;
    }

    function handlePointerUp() {
      isDrawingRef.current = false;
      lastPointRef.current = null;
      lastPaintedCellRef.current = null;
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [cellSize, width, height, onPixelsPaint]);

  function getGridLinePosition(index: number, count: number, cellSize: number) {
    if (index === count) {
      return count * cellSize - 0.5;
    }

    return index * cellSize + 0.5;
  }

  function getCanvasPointFromPointerEvent(event: PointerEvent): CanvasPoint {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { canvasX: 0, canvasY: 0 };
    }

    const rect = canvas.getBoundingClientRect();

    return {
      canvasX: event.clientX - rect.left,
      canvasY: event.clientY - rect.top,
    };
  }

  function getPaintCellAtPoint(point: CanvasPoint): Cell | null {
    const { x, y } = getCellFromCanvasPoint(
      point.canvasX,
      point.canvasY,
      cellSize,
    );

    if (!isInsideCanvas(x, y, width, height)) {
      return null;
    }

    const lastPaintedCell = lastPaintedCellRef.current;

    if (lastPaintedCell && lastPaintedCell.x === x && lastPaintedCell.y === y) {
      return null;
    }

    lastPaintedCellRef.current = { x, y };
    return { x, y };
  }

  function paintBetweenPoints(from: CanvasPoint, to: CanvasPoint) {
    const dx = to.canvasX - from.canvasX;
    const dy = to.canvasY - from.canvasY;

    const distance = Math.max(Math.abs(dx), Math.abs(dy));
    const stepSize = Math.max(1, cellSize / 2);
    const steps = Math.max(1, Math.ceil(distance / stepSize));

    const cells: Cell[] = [];

    for (let i = 1; i <= steps; i++) {
      const canvasX = from.canvasX + (dx * i) / steps;
      const canvasY = from.canvasY + (dy * i) / steps;

      const cell = getPaintCellAtPoint({ canvasX, canvasY });

      if (cell) {
        cells.push(cell);
      }
    }

    if (cells.length > 0) {
      onPixelsPaint(cells);
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      const rect = canvas.getBoundingClientRect();

      const canvasX = event.clientX - rect.left;
      const canvasY = event.clientY - rect.top;

      pendingZoomAnchorRef.current = {
        logicalX: canvasX / cellSize,
        logicalY: canvasY / cellSize,
        clientX: event.clientX,
        clientY: event.clientY,
      };

      if (event.deltaY < 0) {
        onZoom("in");
      } else {
        onZoom("out");
      }
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [cellSize, onZoom]);

  useLayoutEffect(() => {
    const anchor = pendingZoomAnchorRef.current;
    const canvas = canvasRef.current;

    if (!anchor || !canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();

    const nextClientX = rect.left + anchor.logicalX * cellSize;
    const nextClientY = rect.top + anchor.logicalY * cellSize;

    const deltaX = nextClientX - anchor.clientX;
    const deltaY = nextClientY - anchor.clientY;

    window.scrollBy(deltaX, deltaY);

    pendingZoomAnchorRef.current = null;
  }, [cellSize]);

  return (
    <canvas
      ref={canvasRef}
      width={width * cellSize}
      height={height * cellSize}
      className="pixel-canvas"
    />
  );
}
