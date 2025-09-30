import React, { useEffect, useState, useRef } from 'react';
import { useSockets } from '../../Contexts/SocketProvider';


export default function FlameAlert() {
  const { flamesData } = useSockets();
  const [flameDetected, setFlameDetected] = useState(false);

  useEffect(() => {
    // console.log('flamesData[deviceId]', flamesData);
    for (const deviceId in flamesData) {
      if (flamesData[deviceId].state === true) {
        setFlameDetected(true)
      }
    }
  }, [flamesData])


  const audioRef = useRef(null);

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
            <h1 style={{ marginBottom: 40, fontSize: '2.5rem', color: 'var(--text-color)' }}>🚨 هشدار 🚨</h1>            <p style={{ fontSize: '2rem' }}>شعله تشخیص داده شد!</p>
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
