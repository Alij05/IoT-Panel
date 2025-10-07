// LightBulbToggle.jsx
import React, { useEffect, useState } from 'react';

export default function LightControl({ deviceState }) {
    const [lightStatus, setLightStatus] = useState(deviceState === 'on' ? true : false);
    console.log(deviceState);
    

    useEffect(() => {
        setLightStatus(deviceState === 'on' ? true : false)
    }, [deviceState])

    return (
        <div style={{ textAlign: 'center', cursor: 'pointer', color: 'var(--text-color)' }} >
            <p>{lightStatus ? 'روشن' : 'خاموش'}</p>
            <img
                src={lightStatus ? 'svgs/switch-light-on.svg' : 'svgs/switch-light-off.svg'}
                alt={lightStatus ? 'روشن' : 'خاموش'}
                style={{ width: '180px', transition: '0.3s ease-in-out' }}
            />
        </div>
    );
}
