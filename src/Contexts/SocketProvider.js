// src/contexts/WebSocketProvider.js
import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
    const socketRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const heartbeatTimersRef = useRef({});
    const hasConnectedRef = useRef(false);

    const [isConnected, setIsConnected] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [sensorsData, setSensorsData] = useState({});
    const [sensorsAlert, setSensorsAlert] = useState([]);
    const [sensorsLogsData, setSensorsLogsData] = useState({});
    const [flamesData, setFlamesData] = useState({});
    const [deviceStatuses, setDeviceStatuses] = useState({});

    const httpUrl = process.env.REACT_APP_HA_BASE_URL;
    const wsUrl = `${httpUrl.replace(/^http/, "ws")}/ws`;

    useEffect(() => {
        let isUnmounted = false;

        const connect = () => {
            // جلوگیری از چند اتصال همزمان
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
                if (isUnmounted) return;

                setIsConnected(true);
                console.log("[WSS] Connected ✔");

                // فقط یک بار auth بفرست
                ws.send(JSON.stringify({ type: "authWithCookie" }));
            };

            ws.onmessage = (event) => {
                let data;
                try {
                    data = JSON.parse(event.data);
                } catch {
                    return;
                }

                // --- Auth response ---
                if (data.type === "auth_response") {
                    if (data.success) {
                        setIsAuthenticated(true);
                        console.log("[WSS] Authenticated ✔");
                    } else {
                        console.warn("[WSS] Auth failed");
                        ws.close();
                    }
                    return;
                }

                // قبل از auth هیچ دیتایی پردازش نشود
                if (!isAuthenticated) return;

                // --- Status updates ---
                if (data.deviceId && data.messageType === "status") {
                    setSensorsData((prev) => ({
                        ...prev,
                        [data.deviceId]: data,
                    }));
                }

                // --- Alerts ---
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

                // --- Flame sensors ---
                if (data.device_class === "flame") {
                    setFlamesData((prev) => ({
                        ...prev,
                        [data.deviceId]: data,
                    }));
                }

                // --- Logs & Heartbeat ---
                if (data.deviceId && data.messageType === "logs") {
                    setSensorsLogsData((prev) => ({
                        ...prev,
                        [data.deviceId]: data,
                    }));

                    const msg = String(data.msg || data.message || "");
                    const isHeartbeat =
                        msg.toLowerCase().includes("heartbeat") ||
                        msg.includes("Sensor status publish OK");

                    if (isHeartbeat) {
                        setDeviceStatuses((prev) => ({
                            ...prev,
                            [data.deviceId]: "online",
                        }));

                        if (heartbeatTimersRef.current[data.deviceId]) {
                            clearTimeout(
                                heartbeatTimersRef.current[data.deviceId]
                            );
                        }

                        heartbeatTimersRef.current[data.deviceId] =
                            setTimeout(() => {
                                setDeviceStatuses((prev) => ({
                                    ...prev,
                                    [data.deviceId]: "offline",
                                }));
                                delete heartbeatTimersRef.current[
                                    data.deviceId
                                ];
                            }, 30000);
                    }
                }
            };

            ws.onclose = () => {
                if (isUnmounted) return;

                console.warn("[WSS] Closed, retrying in 5s");
                setIsConnected(false);
                setIsAuthenticated(false);

                if (!reconnectTimerRef.current) {
                    reconnectTimerRef.current = setTimeout(() => {
                        reconnectTimerRef.current = null;
                        connect();
                    }, 5000);
                }
            };

            ws.onerror = (err) => {
                console.error("[WSS] Error:", err);
            };
        };

        if (!hasConnectedRef.current) {
            hasConnectedRef.current = true;
            connect();
        }

        return () => {
            isUnmounted = true;

            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
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
                isAuthenticated,
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
