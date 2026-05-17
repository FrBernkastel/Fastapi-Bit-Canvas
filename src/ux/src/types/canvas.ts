export type HexColor = string;

export type PixelGrid = HexColor[][];

export interface CanvasSnapshot {
  width: number;
  height: number;
  defaultColor: HexColor;
  pixels: PixelGrid;
}

export interface PixelUpdateMessage {
  type: "pixel_update";
  x: number;
  y: number;
  color: HexColor;
}

export interface PixelUpdatedMessage {
  type: "pixel_updated";
  x: number;
  y: number;
  color: HexColor;
}

export interface ErrorMessage {
  type: "error";
  message: string;
}

export type ServerCanvasMessage = PixelUpdatedMessage | ErrorMessage;