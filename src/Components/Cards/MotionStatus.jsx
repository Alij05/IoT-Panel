// LightBulbToggle.jsx
import React, { useEffect, useState } from 'react';

export default function MotionStatus({ product, deviceState }) {
    const [motionStatus, setMotionStatus] = useState(deviceState === 'motion' ? true : false);

    useEffect(() => {
        setMotionStatus(deviceState === 'motion' ? true : false)
    }, [deviceState])

    return (
        <div style={{ textAlign: 'center', cursor: 'pointer' }} >
            <p style={{ marginBottom: '20px' }}>{motionStatus ? 'روشن' : 'خاموش'}</p>
            <img
                src={motionStatus ? 'svgs/motion-on.svg' : 'svgs/motion-off.svg'}
                alt={motionStatus ? 'روشن' : 'خاموش'}
                style={{ width: '180px', transition: '0.3s ease-in-out' }}
            />
        </div>
    );
}
