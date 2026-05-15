import type { HexColor } from "../types/canvas";

interface ColorPickerProps {
  color: HexColor;
  onChange: (color: HexColor) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  return (
    <label className="color-picker">
      <span>Color</span>
      <input
        type="color"
        value={color}
        onChange={(event) => onChange(event.target.value)}
      />
      <span className="color-value">{color}</span>
    </label>
  );
}
