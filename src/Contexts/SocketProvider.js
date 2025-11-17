// src/contexts/WebSocketProvider.js
import axios from "axios";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
    const socketRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const heartbeatTimersRef = useRef({}); // Stores timeout timers for each device

    const [isConnected, setIsConnected] = useState(false);
    const [sensorsData, setSensorsData] = useState({});
    const [sensorsAlert, setSensorsAlert] = useState([]);
    const [sensorsLogsData, setSensorsLogsData] = useState({});
    const [flamesData, setFlamesData] = useState({});
    const [deviceStatuses, setDeviceStatuses] = useState({}); // Tracks device online/offline states

    const url = process.env.REACT_APP_HA_BASE_URL;
    const TOKEN = process.env.REACT_APP_TOKEN;

    const wsUrl = `${url.replace(/^http?/, "ws")}/ws`;

    useEffect(() => {
        const connect = () => {
            const ws = new WebSocket(wsUrl);
            socketRef.current = ws;

            ws.onopen = () => {
                setIsConnected(true);
                ws.send(JSON.stringify({ type: "auth", access_token: TOKEN }));
                console.log("WSS Connected ✔");
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log("[WS] State:", data);

                    // --- Handle device status messages ---
                    if (data.deviceId && data.messageType === "status") {
                        setSensorsData((prev) => ({
                            ...prev,
                            [data.deviceId]: data,
                        }));
                    }

                    // --- Handle device alerts ---
                    if (data.deviceId && data.messageType === "alert") {
                        console.log("[WS] Alert:", data);
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
                        // Save raw log data
                        setSensorsLogsData((prev) => ({
                            ...prev,
                            [data.deviceId]: data,
                        }));

                        // Detect if this log message is a heartbeat signal
                        const msg = (data.msg || data.message || "").toString();
                        const isHeartbeat =
                            msg.includes("Heartbeat") ||
                            msg.includes("heartbeat") ||
                            msg.includes("Sensor status publish OK");

                        if (isHeartbeat) {
                            // 1) Mark the device as online
                            setDeviceStatuses((prev) => ({
                                ...prev,
                                [data.deviceId]: "Heartbeat - device online",
                            }));

                            // 2) Clear any previous timer
                            if (heartbeatTimersRef.current[data.deviceId]) {
                                clearTimeout(
                                    heartbeatTimersRef.current[data.deviceId]
                                );
                            }

                            // 3) Start a new 10s timeout to mark it offline if no new heartbeat arrives
                            heartbeatTimersRef.current[data.deviceId] = setTimeout(
                                () => {
                                    setDeviceStatuses((prev) => ({
                                        ...prev,
                                        [data.deviceId]:
                                            "Heartbeat - device offline (timeout)",
                                    }));

                                    // Cleanup the timer reference
                                    delete heartbeatTimersRef.current[
                                        data.deviceId
                                    ];
                                }, 30000);
                        }
                    }

                } catch (err) {
                    console.error("[WS] Parse error:", err);
                }
            };

            ws.onclose = () => {
                setIsConnected(false);
                console.log("WSS Closed, will try to reconnect in 3s");

                // Reconnect after 3 seconds
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
            // Cleanup on unmount: close socket and clear timers
            if (reconnectTimerRef.current)
                clearTimeout(reconnectTimerRef.current);
            if (socketRef.current) socketRef.current.close();

            // Clear all heartbeat timers
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
                deviceStatuses, // Expose heartbeat statuses
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
}

export const useSockets = () => useContext(WebSocketContext);
