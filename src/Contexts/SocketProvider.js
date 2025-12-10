// src/contexts/WebSocketProvider.js
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
    const socketRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const heartbeatTimersRef = useRef({}); // Stores timeout timers for each device

    const [isConnected, setIsConnected] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [sensorsData, setSensorsData] = useState({});
    const [sensorsAlert, setSensorsAlert] = useState([]);
    const [sensorsLogsData, setSensorsLogsData] = useState({});
    const [flamesData, setFlamesData] = useState({});
    const [deviceStatuses, setDeviceStatuses] = useState({}); // Tracks device online/offline states

    const url = process.env.REACT_APP_HA_BASE_URL;
    const wsUrl = `${url.replace(/^http?/, "ws")}/ws`;

    useEffect(() => {
        const connect = () => {
            const ws = new WebSocket(wsUrl);
            socketRef.current = ws;

            ws.onopen = () => {
                setIsConnected(true);
                console.log("WSS Connected ✔");

                ws.send(JSON.stringify({ type: "authWithCookie" }));
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    // --- بررسی پاسخ احراز هویت ---
                    if (data.type === "auth_response") {
                        if (data.success) {
                            console.log("کاربر با موفقیت احراز هویت شد");
                            setIsAuthenticated(true);
                        } else {
                            console.warn("احراز هویت ناموفق، بستن WebSocket");
                            ws.close();
                        }
                        return; // فقط مربوط به auth بود
                    }

                    // --- اگر هنوز احراز هویت نشده، هیچ داده‌ای پردازش نشود ---
                    if (!isAuthenticated) return;

                    // --- Handle device status messages ---
                    if (data.deviceId && data.messageType === "status") {
                        setSensorsData((prev) => ({
                            ...prev,
                            [data.deviceId]: data,
                        }));
                    }

                    // --- Handle device alerts ---
                    if (data.deviceId && data.messageType === "alert") {
                        setSensorsAlert((prev = []) => {
                            const exists = prev.some(
                                (a) =>
                                    a.timestamp === data.timestamp &&
                                    a.deviceId === data.deviceId
                            );
                            if (exists) return prev;
                            return [...prev, data];
                        });
                    }

                    // --- Handle flame sensors ---
                    if (data.device_class === "flame") {
                        setFlamesData((prev) => ({
                            ...prev,
                            [data.deviceId]: data,
                        }));
                    }

                    // --- Handle device logs (including heartbeat) ---
                    if (data.deviceId && data.messageType === "logs") {
                        setSensorsLogsData((prev) => ({
                            ...prev,
                            [data.deviceId]: data,
                        }));

                        const msg = (data.msg || data.message || "").toString();
                        const isHeartbeat =
                            msg.includes("Heartbeat") ||
                            msg.includes("heartbeat") ||
                            msg.includes("Sensor status publish OK");

                        if (isHeartbeat) {
                            setDeviceStatuses((prev) => ({
                                ...prev,
                                [data.deviceId]: "Heartbeat - device online",
                            }));

                            if (heartbeatTimersRef.current[data.deviceId]) {
                                clearTimeout(heartbeatTimersRef.current[data.deviceId]);
                            }

                            heartbeatTimersRef.current[data.deviceId] = setTimeout(() => {
                                setDeviceStatuses((prev) => ({
                                    ...prev,
                                    [data.deviceId]: "Heartbeat - device offline (timeout)",
                                }));
                                delete heartbeatTimersRef.current[data.deviceId];
                            }, 30000);
                        }
                    }
                } catch (err) {
                    console.error("[WS] Parse error:", err);
                }
            };

            ws.onclose = () => {
                setIsConnected(false);
                setIsAuthenticated(false);
                console.log("WSS Closed, will try to reconnect in 3s");

                if (reconnectTimerRef.current)
                    clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = setTimeout(connect, 3000);
            };

            ws.onerror = (err) => {
                console.error("WSS Error:", err);
            };
        };

        connect();

        return () => {
            if (reconnectTimerRef.current)
                clearTimeout(reconnectTimerRef.current);
            if (socketRef.current) socketRef.current.close();

            Object.values(heartbeatTimersRef.current).forEach(clearTimeout);
            heartbeatTimersRef.current = {};
        };
    }, [wsUrl, isAuthenticated]);

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
