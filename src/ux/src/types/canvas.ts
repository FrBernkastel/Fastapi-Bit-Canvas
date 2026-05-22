export type HexColor = string;

export type PixelGrid = HexColor[][];

export interface CanvasSnapshot {
  width: number;
  height: number;
  defaultColor: HexColor;
  pixels: PixelGrid;
}

export interface PixelChange {
  x: number;
  y: number;
  color: HexColor;
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

export interface PixelBatchUpdateMessage {
  type: "pixel_batch_update";
  pixels: PixelChange[];
}

export interface PixelBatchUpdatedMessage {
  type: "pixel_batch_updated";
  pixels: PixelChange[];
}

export interface ErrorMessage {
  type: "error";
  message: string;
}

export type ServerCanvasMessage = PixelUpdatedMessage | PixelBatchUpdatedMessage | ErrorMessage;