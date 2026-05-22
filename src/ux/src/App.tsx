import { useEffect, useState } from "react";
import "./App.css";
import type {
  CanvasSnapshot,
  HexColor,
  PixelChange,
  PixelGrid,
} from "./types/canvas";
import { PixelCanvas } from "./components/PixelCanvas";
import { ColorPicker } from "./components/ColorPicker";
import { fetchCanvasSnapshot } from "./api/CanvasApi";
import { useCanvasSocket } from "./hooks/useCanvasSocket";

const CANVAS_WIDTH = 128;
const CANVAS_HEIGHT = 128;
const DEFAULT_CELL_SIZE = 6;
const MIN_CELL_SIZE = 3;
const MAX_CELL_SIZE = 14;
const DEFAULT_COLOR = "#ffffff";
const INITIAL_SELECTED_COLOR = "#5253a0";

function App() {
  const [pixels, setPixels] = useState<PixelGrid>([]);
  const [cellSize, setCellSize] = useState(DEFAULT_CELL_SIZE);
  const [selectedColor, setSelectedColor] = useState<HexColor>(
    INITIAL_SELECTED_COLOR,
  );

  function applyPixelChanges(pixelChanges: PixelChange[]) {
    setPixels((currentPixels) => {
      const nextPixels = currentPixels.map((row) => [...row]);

      for (const pixel of pixelChanges) {
        if (
          !nextPixels[pixel.y] ||
          nextPixels[pixel.y][pixel.x] === undefined
        ) {
          continue;
        }

        nextPixels[pixel.y][pixel.x] = pixel.color;
      }

      return nextPixels;
    });
  }

  const { connectionStatus, sendPixelUpdate, sendPixelBatchUpdate } =
    useCanvasSocket({
      onPixelUpdated: (x, y, color) => {
        applyPixelChanges([{ x, y, color }]);
      },
      onPixelBatchUpdated: (pixelChanges) => applyPixelChanges(pixelChanges),
      onError: (message) => {
        console.error("WebSocket error message:", message);
      },
    });

  // canvas ground truth from the background
  const [canvasSnapshot, setCanvasSnapshot] = useState<CanvasSnapshot | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // useEffects
  useEffect(() => {
    async function loadCanvas() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const snapshot = await fetchCanvasSnapshot();

        setCanvasSnapshot(snapshot);
        setPixels(snapshot.pixels);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Failed to load canvas",
        );
      } finally {
        setIsLoading(false);
      }
    }
    loadCanvas();
  }, []);

  function handlePixelsPaint(cells: { x: number; y: number }[]) {
    sendPixelBatchUpdate(
      cells.map((cell) => ({
        x: cell.x,
        y: cell.y,
        color: selectedColor,
      })),
    );
  }

  function handleCanvasZoom(direction: "in" | "out") {
    setCellSize((current) => {
      if (direction === "in") {
        return Math.min(current + 1, MAX_CELL_SIZE);
      }

      return Math.max(current - 1, MIN_CELL_SIZE);
    });
  }

  if (isLoading) {
    return (
      <main className="app">
        <section className="workspace">
          <p>Loading canvas...</p>
        </section>
      </main>
    );
  }

  if (loadError || !canvasSnapshot) {
    return (
      <main className="app">
        <section className="workspace">
          <p>Failed to load canvas: {loadError}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="app-banner">
        <div className="title-group">
          <div className="app-tabs">
            <span className="app-tab active">Canvas</span>
            <span className="app-tab">Local Prototype</span>
          </div>

          <h1>Shared Pixel Canvas</h1>
          <p>Backend canvas loaded. WebSocket: {connectionStatus}.</p>
        </div>

        <ColorPicker color={selectedColor} onChange={setSelectedColor} />
      </header>

      <section className="workspace">
        <div className="canvas-stage">
          <div className="canvas-frame">
            <PixelCanvas
              pixels={pixels}
              cellSize={cellSize}
              onPixelsPaint={handlePixelsPaint}
              onZoom={handleCanvasZoom}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
