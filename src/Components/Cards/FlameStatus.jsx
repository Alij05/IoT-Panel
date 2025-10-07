// LightBulbToggle.jsx
import React, { useEffect, useState } from 'react';

export default function FlameStatus({ product, deviceState }) {
    const [flameStatus, setFlameStatus] = useState(deviceState === 'on' ? true : false);

    useEffect(() => {
        setFlameStatus(deviceState === 'on' ? true : false)
    }, [deviceState])

    return (
        <div style={{ textAlign: 'center', cursor: 'pointer', color: 'var(--text-color)' }} >
            <p style={{ marginBottom: '20px' }}>{flameStatus ? 'روشن' : 'خاموش'}</p>
            <img
                src={flameStatus ? 'svgs/flame-on.svg' : 'svgs/flame-off.svg'}
                alt={flameStatus ? 'روشن' : 'خاموش'}
                style={{ width: '150px', transition: '0.3s ease-in-out' }}
            />
        </div>
    );
}
