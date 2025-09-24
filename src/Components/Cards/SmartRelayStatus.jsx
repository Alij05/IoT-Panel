// LightBulbToggle.jsx
import React, { useState } from 'react';

export default function SmartRelayStatus({ isSmartRelayOn }) {
    const [isOn, setIsOn] = useState(isSmartRelayOn);

    return (
        <div style={{ textAlign: 'center', cursor: 'pointer' }} >
            <p style={{marginBottom: '20px'}}>{isOn ? 'متصل' : 'قطع'}</p>
            <img
                src={isOn ? 'svgs/smart-relay-on.svg' : 'svgs/smart-relay-off.svg'}
                alt={isOn ? 'متصل' : 'قطع'}
                style={{ width: '150px', transition: '0.3s ease-in-out' }}
            />
        </div>
    );
}
