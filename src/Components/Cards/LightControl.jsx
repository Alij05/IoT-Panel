// LightBulbToggle.jsx
import React, { useState } from 'react';

export default function LightControl({ isSwitchOn }) {
    const [isOn, setIsOn] = useState(isSwitchOn);

    return (
        <div style={{ textAlign: 'center', cursor: 'pointer' }} >
            <p>{isOn ? 'روشن' : 'خاموش'}</p>
            <img
                src={isOn ? 'svgs/switch-light-on.svg' : 'svgs/switch-light-off.svg'}
                alt={isOn ? 'روشن' : 'خاموش'}
                style={{ width: '300px', transition: '0.3s ease-in-out' }}
            />
        </div>
    );
}
