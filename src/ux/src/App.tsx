import { useState } from "react";
import "./App.css";
import type { HexColor, PixelGrid } from "./types/canvas";
import { PixelCanvas } from "./components/PixelCanvas";
import { ColorPicker } from "./components/ColorPicker";

const CANVAS_WIDTH = 128;
const CANVAS_HEIGHT = 128;
const DEFAULT_CELL_SIZE = 6;
const MIN_CELL_SIZE = 3;
const MAX_CELL_SIZE = 14;
const DEFAULT_COLOR = "#ffffff";
const INITIAL_SELECTED_COLOR = "#5253a0";

function createInitialPixels(): PixelGrid {
  return Array.from({ length: CANVAS_HEIGHT }, () =>
    Array.from({ length: CANVAS_WIDTH }, () => DEFAULT_COLOR),
  );
}

function App() {
  const [pixels, setPixels] = useState<PixelGrid>(() => createInitialPixels());
  const [cellSize, setCellSize] = useState(DEFAULT_CELL_SIZE);
  const [selectedColor, setSelectedColor] = useState<HexColor>(
    INITIAL_SELECTED_COLOR,
  );

  function handlePixelClick(x: number, y: number) {
    setPixels((currentPixels) => {
      const nextPixels = currentPixels.map((row) => [...row]);
      nextPixels[y][x] = selectedColor;
      return nextPixels;
    });
  }

  function handleCanvasZoom(direction: "in" | "out") {
    setCellSize((current) => {
      if (direction === "in") {
        return Math.min(current + 1, MAX_CELL_SIZE);
      }

      return Math.max(current - 1, MIN_CELL_SIZE);
    });
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
          <p>Draw pixels locally. Real-time sync comes next.</p>
        </div>

        <ColorPicker color={selectedColor} onChange={setSelectedColor} />
      </header>

      <section className="workspace">
        <div className="canvas-stage">
          <div className="canvas-frame">
            <PixelCanvas
              pixels={pixels}
              cellSize={cellSize}
              onPixelClick={handlePixelClick}
              onZoom={handleCanvasZoom}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;