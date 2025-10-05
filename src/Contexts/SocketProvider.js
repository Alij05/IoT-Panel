import axios from "axios";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
    const socketRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [sensorsData, setSensorsData] = useState({});
    const [sensorsLogsData, setSensorsLogsData] = useState({});
    const [flamesData, setFlamesData] = useState({});

    const BASE_URL = process.env.REACT_APP_HA_BASE_URL;
    const wsUrl = `${BASE_URL.replace(/^https?/, "wss")}/ws`;
    const url = process.env.REACT_APP_URL;



    useEffect(() => {
        const connect = () => {
            const ws = new WebSocket(wsUrl);
            socketRef.current = ws;

            ws.onopen = () => {
                console.log("[WSS] Connected ✅");
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log("[WSS] Message:", data);

                    if (data.deviceId && data.messageType === 'status') {
                        setSensorsData((prev) => ({
                            ...prev,
                            [data.deviceId]: data,
                        }));
                        // Update Database When State Changed

                    }
                    if (data.device_class === 'flame') {
                        setFlamesData((prev) => ({
                            ...prev,
                            [data.deviceId]: data
                        }))
                    }

                    if (data.deviceId && data.messageType === 'logs') {
                        setSensorsLogsData((prev) => ({
                            ...prev,
                            [data.deviceId]: data,
                        }));
                    }

                } catch (err) {
                    console.error("[WSS] Parse error:", err);
                }
            };

            ws.onclose = (evt) => {
                setIsConnected(false);
                console.warn(`[WSS] Closed (${evt.code}), reconnecting in 3s`);
                if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = setTimeout(connect, 3000);
            };

            ws.onerror = (err) => {
                console.error("[WSS] Error:", err);
            };
        };

        connect();

        return () => {
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            if (socketRef.current) socketRef.current.close();
        };
    }, [wsUrl]);

    return (
        <WebSocketContext.Provider
            value={{ socket: socketRef.current, isConnected, sensorsData, flamesData, sensorsLogsData }}
        >
            {children}
        </WebSocketContext.Provider>
    );
}

export const useSockets = () => useContext(WebSocketContext);
