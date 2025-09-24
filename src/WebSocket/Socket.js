import { useRef } from "react";

const BASE_URL = process.env.REACT_APP_HA_BASE_URL
const TOKEN = process.env.REACT_APP_HA_TOKEN

let socket


export const getSocket = (url) => {
    let ws;

    const connect = () => {
        ws = new WebSocket(url);

        ws.onopen = () => {
            console.log('[WS] Connected');
        };

        ws.onmessage = async (event) => {
            try {
                const msg = JSON.parse(event.data);
                console.log('[WS] Message:', msg);
            } catch {
                console.error('[WS] Invalid JSON:', event.data);
            }
        };

        ws.onerror = (err) => {
            console.error('[WS] Error:', err);
        };

        ws.onclose = (evt) => {
            console.warn(`[WS] Closed (${evt.code}), reconnecting in 3s`);
            setTimeout(connect, 3000);
        };
    };

    connect();

    return ws;
};



// let socket;
// const listeners = [];

// export const getSocket = () => {
//     if (socket && socket.readyState !== WebSocket.CLOSED) return socket;

//     const BASE_URL = process.env.REACT_APP_HA_BASE_URL;
//     const TOKEN = process.env.REACT_APP_HA_TOKEN;
//     const wsUrl = `${BASE_URL.replace(/^http/, 'ws')}/api/websocket`;

//     socket = new WebSocket(wsUrl);

//     socket.onopen = () => {
//         console.log('[WSS] Connected');
//         socket.send(JSON.stringify({ type: 'auth', access_token: TOKEN }));
//     };

//     socket.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         listeners.forEach((cb) => cb(data)); // Notify all listeners
//     };

//     socket.onerror = (err) => {
//         console.error('[WSS] Error:', err);
//     };

//     socket.onclose = () => {
//         console.warn('[WSS] Disconnected');
//     };

//     return socket;
// };

// export const subscribeSocket = (callback) => {
//     listeners.push(callback);
//     return () => {
//         const index = listeners.indexOf(callback);
//         if (index !== -1) listeners.splice(index, 1);
//     };
// };
