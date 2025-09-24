// import React, { useEffect, useState, useRef } from 'react';
// import { getSocket } from '../../WebSocket/Socket';

// const BASE_URL = process.env.REACT_APP_HA_BASE_URL;
// const TOKEN = process.env.REACT_APP_HA_TOKEN;

// export default function FlameAlert() {
//     const [flameDetected, setFlameDetected] = useState(false);
//     // const []
//     const audioRef = useRef(null);

//     useEffect(() => {
//         const ws = getSocket()

//         ws.onmessage = (event) => {
//             const data = JSON.parse(event.data);

//             if (data.type === 'auth_ok') {
//                 ws.send(JSON.stringify({
//                     id: 1,
//                     type: 'subscribe_events',
//                     event_type: 'state_changed'
//                 }));
//             }

//             if (data.type === 'event' && data.event?.data?.entity_id === 'binary_sensor.flame_detector_flame_sensor') {
//                 const newState = data.event.data.new_state.state;

//                 if (newState === 'on') {
//                     setFlameDetected(true);
//                 }
//             }
//         };

//         return () => {
//             ws.close();
//         };
//     }, []);


//     useEffect(() => {
//         if (flameDetected) {
//             if (audioRef.current) {
//                 audioRef.current.play().catch(e => console.log('Audio play prevented:', e));
//             }
//             const timer = setTimeout(() => setFlameDetected(false), 4000);
//             return () => clearTimeout(timer);
//         }
//     }, [flameDetected]);

//     return (
//         <>
//             {flameDetected && (
//                 <div style={modalStyles.overlay}>
//                     <div style={modalStyles.modal}>
//                         <h1 style={{ marginBottom: '15px', fontSize: '3rem' }}>🔥 هشدار</h1>
//                         <p style={{ fontSize: '2rem' }}>شعله تشخیص داده شد!</p>
//                     </div>
//                     {/* صدای آلارم */}
//                     <audio
//                         ref={audioRef}
//                         src="https://actions.google.com/sounds/v1/alarms/fire_alarm.ogg"
//                         preload="auto"
//                     />
//                 </div>
//             )}
//         </>
//     );
// }

// const modalStyles = {
//     overlay: {
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         width: '100vw',
//         height: '100vh',
//         backgroundColor: 'rgba(0, 0, 0, 0.6)',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         zIndex: 1000,
//     },
//     modal: {
//         backgroundColor: 'white',
//         padding: '50px 80px',
//         borderRadius: '15px',
//         textAlign: 'center',
//         fontSize: '20px',
//         boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
//         minWidth: '400px',
//         maxWidth: '600px',
//     },
// };




import React, { useEffect, useState, useRef } from 'react';

const BASE_URL = process.env.REACT_APP_HA_BASE_URL;
const TOKEN = process.env.REACT_APP_HA_TOKEN;

export default function FlameAlert() {
  const [flameDetected, setFlameDetected] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const nextIdRef = useRef(1);
  const audioRef = useRef(null);

  useEffect(() => {
    const wsUrl = `${BASE_URL.replace(/^http/, 'ws')}/api/websocket`;

    const connect = () => {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('[WSS] Connected, sending auth');
        // Send authentication message
        ws.send(JSON.stringify({ type: 'auth', access_token: TOKEN }));
      };

      ws.onmessage = (event) => {
        let msg;
        try {
          msg = JSON.parse(event.data);
        } catch {
          console.error('Invalid JSON', event.data);
          return;
        }

        // HA auth OK?
        if (msg.type === 'auth_ok') {
          console.log('[WSS] Authenticated');
          // Subscribe to state_changed events
          const id = nextIdRef.current++;
          ws.send(JSON.stringify({
            id,
            type: 'subscribe_events',
            event_type: 'state_changed'
          }));
          return;
        }

        // Handle event message for our flame sensor
        if (msg.type === 'event'
            && msg.event
            && msg.event.data
            && msg.event.data.entity_id === 'binary_sensor.flame_detector_flame_sensor'
        ) {
          const state = msg.event.data.new_state.state;
          console.log('[WSS] Flame sensor state:', state);
          if (state === 'on') {
            setFlameDetected(true);
          }
        }
      };

      ws.onerror = (err) => {
        console.error('[WSS] Error', err);
      };

      ws.onclose = (evt) => {
        console.warn(`[WSS] Closed (${evt.code}), reconnecting in 3s`);
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      // Cleanup: stop reconnects and close socket
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (socketRef.current) {
        socketRef.current.onopen = null;
        socketRef.current.onmessage = null;
        socketRef.current.onerror = null;
        socketRef.current.onclose = null;
        socketRef.current.close();
      }
    };
  }, []);

  // Play alarm and reset after 4s
  useEffect(() => {
    if (!flameDetected) return;
    console.log('[ALARM] Flame detected!');
    audioRef.current?.play().catch(e => console.warn('Audio play blocked', e));
    const t = setTimeout(() => setFlameDetected(false), 4000);
    return () => clearTimeout(t);
  }, [flameDetected]);

  return (
    <>
      {flameDetected && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h1 style={{ marginBottom: 15, fontSize: '3rem' }}>🔥 هشدار</h1>
            <p style={{ fontSize: '2rem' }}>شعله تشخیص داده شد!</p>
          </div>
          <audio
            ref={audioRef}
            src="https://actions.google.com/sounds/v1/alarms/fire_alarm.ogg"
            preload="auto"
          />
        </div>
      )}
    </>
  );
}

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '50px 80px',
    borderRadius: 15,
    textAlign: 'center',
    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
    minWidth: 400,
    maxWidth: 600,
  },
};
