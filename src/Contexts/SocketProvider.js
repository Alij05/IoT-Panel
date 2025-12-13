// src/contexts/WebSocketProvider.js
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
    const socketRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const heartbeatTimersRef = useRef({});
    const isAuthenticatedRef = useRef(false);
    const reconnectAttemptsRef = useRef(0);
    const destroyedRef = useRef(false);

    const [isConnected, setIsConnected] = useState(false);

    const [sensorsData, setSensorsData] = useState({});
    const [sensorsAlert, setSensorsAlert] = useState([]);
    const [sensorsLogsData, setSensorsLogsData] = useState({});
    const [flamesData, setFlamesData] = useState({});
    const [deviceStatuses, setDeviceStatuses] = useState({});

    const httpUrl = process.env.REACT_APP_HA_BASE_URL;
    const wsUrl = `${httpUrl.replace(/^http/, "ws")}/ws`;

    useEffect(() => {
        const connect = () => {
            if (destroyedRef.current) return;

            if (
                socketRef.current &&
                (socketRef.current.readyState === WebSocket.OPEN ||
                    socketRef.current.readyState === WebSocket.CONNECTING)
            ) {
                return;
            }

            const ws = new WebSocket(wsUrl);
            socketRef.current = ws;

            ws.onopen = () => {
                reconnectAttemptsRef.current = 0;
                setIsConnected(true);
                isAuthenticatedRef.current = false;

                console.log("[WSS] Connected ✔");
                ws.send(JSON.stringify({ type: "authWithCookie" }));
            };

            ws.onmessage = (event) => {
                let data;
                try {
                    data = JSON.parse(event.data);
                } catch {
                    return;
                }

                // ---- AUTH ----
                if (data.type === "auth_response") {
                    if (data.success) {
                        isAuthenticatedRef.current = true;
                        console.log("[WSS] Authenticated ✔");
                    } else {
                        console.warn("[WSS] Auth failed");
                        ws.close();
                    }
                    return;
                }

                if (!isAuthenticatedRef.current) return;

                // ---- STATUS ----
                if (data.deviceId && data.messageType === "status") {
                    setSensorsData((prev) => ({
                        ...prev,
                        [data.deviceId]: data,
                    }));
                }

                // ---- ALERTS ----
                if (data.deviceId && data.messageType === "alert") {
                    setSensorsAlert((prev) => {
                        const exists = prev.some(
                            (a) =>
                                a.timestamp === data.timestamp &&
                                a.deviceId === data.deviceId
                        );
                        if (exists) return prev;
                        return [data, ...prev].slice(0, 50);
                    });
                }

                // ---- FLAME ----
                if (data.device_class === "flame") {
                    setFlamesData((prev) => ({
                        ...prev,
                        [data.deviceId]: data,
                    }));
                }

                // ---- LOGS + HEARTBEAT ----
                if (data.deviceId && data.messageType === "logs") {
                    setSensorsLogsData((prev) => ({
                        ...prev,
                        [data.deviceId]: data,
                    }));

                    const msg = String(data.msg || data.message || "").toLowerCase();
                    const isHeartbeat =
                        msg.includes("heartbeat") ||
                        msg.includes("sensor status publish ok");

                    if (isHeartbeat) {
                        setDeviceStatuses((prev) => ({
                            ...prev,
                            [data.deviceId]: "online",
                        }));

                        if (heartbeatTimersRef.current[data.deviceId]) {
                            clearTimeout(heartbeatTimersRef.current[data.deviceId]);
                        }

                        heartbeatTimersRef.current[data.deviceId] = setTimeout(() => {
                            setDeviceStatuses((prev) => ({
                                ...prev,
                                [data.deviceId]: "offline",
                            }));
                            delete heartbeatTimersRef.current[data.deviceId];
                        }, 30000);
                    }
                }
            };

            ws.onclose = () => {
                setIsConnected(false);
                isAuthenticatedRef.current = false;

                if (destroyedRef.current) return;

                const attempt = reconnectAttemptsRef.current++;
                const delay = Math.min(30000, 2000 * 2 ** attempt);

                console.warn(`[WSS] Closed. Reconnecting in ${delay}ms`);
                reconnectTimerRef.current = setTimeout(connect, delay);
            };

            ws.onerror = () => {
                ws.close();
            };
        };

        connect();

        return () => {
            destroyedRef.current = true;

            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
            }

            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }

            Object.values(heartbeatTimersRef.current).forEach(clearTimeout);
            heartbeatTimersRef.current = {};
        };
    }, [wsUrl]);

    return (
        <WebSocketContext.Provider
            value={{
                socket: socketRef.current,
                isConnected,
                sensorsData,
                sensorsAlert,
                flamesData,
                sensorsLogsData,
                deviceStatuses,
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
}

export const useSockets = () => useContext(WebSocketContext);
