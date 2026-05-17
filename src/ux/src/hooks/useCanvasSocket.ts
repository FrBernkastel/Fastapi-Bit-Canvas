import { useEffect, useRef, useState } from "react";
import type { HexColor, PixelUpdateMessage, ServerCanvasMessage } from "../types/canvas";


const WS_URL = "ws://127.0.0.1:8000/ws/canvas";

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

interface UseCanvasSocketOptions {
    onPixelUpdated: (x: number, y: number, color: HexColor) => void;
    onError?: (message: string) => void;
}

export function useCanvasSocket({
    onPixelUpdated, 
    onError,
}: UseCanvasSocketOptions) {
    const websocketRef = useRef<WebSocket | null>(null);
    const onPixelUpdatedRef = useRef(onPixelUpdated);
    const onErrorRef = useRef(onError);

    const [connectionStatus, setConnectionStatus] =
        useState<ConnectionStatus>("connecting");

    useEffect(() => {
        onPixelUpdatedRef.current = onPixelUpdated;
        onErrorRef.current = onError;
    }, [onPixelUpdated, onError])

    useEffect(() => {
        const websocket = new WebSocket(WS_URL);
        websocketRef.current = websocket;

        setConnectionStatus("connecting");

        websocket.onopen = () => {
            setConnectionStatus("connected");
        }

        websocket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as ServerCanvasMessage;

                if(message.type === "pixel_updated") {
                    onPixelUpdatedRef.current(message.x, message.y, message.color);
                    return;
                }

                if(message.type == "error") {
                    onErrorRef.current?.(message.message);
                    return;
                }
            }
            catch(error) {
                onErrorRef.current?.(
                    error instanceof Error
                    ? error.message
                    : "Failed to parse WebSocket message",
                );
            }
        }

        websocket.onerror = () => {
            setConnectionStatus("error");
        }

        websocket.onclose = () => {
            setConnectionStatus("disconnected");
        }

        return () => {
            websocket.close();
            websocketRef.current = null;
        };
    }, [])

    function sendPixelUpdate(x: number, y: number, color: HexColor) {
        const websocket = websocketRef.current;

        if(!websocket || websocket.readyState != websocket.OPEN) {
            return;
        }

        const message: PixelUpdateMessage = {
            type: "pixel_update",
            x: x,
            y: y,
            color: color
        };

        websocket.send(JSON.stringify(message));
    }

    return {
        connectionStatus,
        sendPixelUpdate,
    };
}