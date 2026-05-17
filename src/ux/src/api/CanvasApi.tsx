import type { CanvasSnapshot } from "../types/canvas";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function fetchCanvasSnapshot(): Promise<CanvasSnapshot> {
    const response = await fetch(`${API_BASE_URL}/api/canvas`);

    if(!response.ok) {
        throw new Error(`Failed to fetch canvas snapshot: ${response.status}`);
    }

    return response.json();
}
