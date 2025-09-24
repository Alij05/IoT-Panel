import { useEffect, useRef, useState } from "react";

export default function useWebSocket(url) {
    const [lastMessage, setLastMessage] = useState(null);
    const wsRef = useRef(null);

    useEffect(() => {
        if (!url) return;

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("[WS] Connected:", url);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log(data);
                setLastMessage(data);
            } catch (err) {
                console.error("[WS] Invalid JSON:", event.data);
            }
        };

        ws.onerror = (err) => {
            console.error("[WS] Error:", err);
        };

        ws.onclose = () => {
            console.warn("[WS] Closed:", url);
        };

        return () => {
            ws.close();
        };
    }, [url]);

    return lastMessage;
}
