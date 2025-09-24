import React, { useEffect, useRef, useState, useCallback } from 'react';

export default function WebRTCCamera({ cameraId }) {
    const videoRef = useRef(null);
    const pcRef = useRef(null);
    const wsRef = useRef(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState(null);

    const baseUrl = process.env.REACT_APP_HA_BASE_URL;
    const token = process.env.REACT_APP_HA_TOKEN;

    const startStreaming = useCallback(async () => {
        try {
            setIsConnecting(true);
            setError(null);

            pcRef.current = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });

            pcRef.current.ontrack = (event) => {
                if (videoRef.current && event.streams[0]) {
                    videoRef.current.srcObject = event.streams[0];
                    setIsStreaming(true);
                }
            };

            pcRef.current.onicecandidate = (event) => {
                if (event.candidate && wsRef.current) {
                    wsRef.current.send(JSON.stringify({
                        id: 2,
                        type: 'webrtc/candidate',
                        candidate: event.candidate
                    }));
                }
            };

            const wsUrl = `${baseUrl.replace(/^http/, 'ws')}/api/websocket`;
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                wsRef.current.send(JSON.stringify({
                    type: 'auth',
                    access_token: token
                }));
            };

            wsRef.current.onmessage = async (event) => {
                const msg = JSON.parse(event.data);

                if (msg.type === 'auth_ok') {
                    const offer = await pcRef.current.createOffer();
                    await pcRef.current.setLocalDescription(offer);

                    wsRef.current.send(JSON.stringify({
                        id: 1,
                        type: 'camera/webrtc_offer',
                        entity_id: cameraId,
                        offer: pcRef.current.localDescription
                    }));
                } else if (msg.type === 'result' && msg.id === 1 && msg.success) {
                    await pcRef.current.setRemoteDescription(
                        new RTCSessionDescription(msg.result.answer)
                    );
                } else if (msg.type === 'webrtc/candidate' && msg.candidate) {
                    await pcRef.current.addIceCandidate(new RTCIceCandidate(msg.candidate));
                } else if (msg.type === 'auth_invalid') {
                    setError("توکن نامعتبر است");
                    stopStream();
                }
            };

            wsRef.current.onerror = () => {
                setError("اتصال WebSocket با خطا مواجه شد");
                stopStream();
            };

            wsRef.current.onclose = () => {
                if (!isStreaming) setError("اتصال WebSocket بسته شد");
            };

        } catch (e) {
            setError("خطا در راه‌اندازی WebRTC: " + e.message);
        } finally {
            setIsConnecting(false);
        }
    }, [cameraId, baseUrl, token, isStreaming]);

    const stopStream = useCallback(() => {
        pcRef.current?.close();
        wsRef.current?.close();
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsStreaming(false);
        setIsConnecting(false);
    }, []);

    useEffect(() => {
        return () => stopStream();
    }, [stopStream]);

    return (
        <div style={{ textAlign: 'center' }}>
            <button onClick={startStreaming} disabled={isConnecting || isStreaming}>
                {isStreaming ? 'در حال پخش' : isConnecting ? 'در حال اتصال...' : 'شروع پخش'}
            </button>
            <button onClick={stopStream} disabled={!isStreaming && !isConnecting} style={{ marginLeft: 10 }}>
                توقف
            </button>

            {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}

            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{
                    width: '100%',
                    maxWidth: 640,
                    marginTop: 20,
                    backgroundColor: '#000',
                    borderRadius: 8
                }}
            />
        </div>
    );
}
