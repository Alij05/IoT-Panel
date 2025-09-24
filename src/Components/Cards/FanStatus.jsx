// LightBulbToggle.jsx
import React, { useState } from 'react';

export default function FanStatus({ isFanOn }) {
    console.log(isFanOn);
    
    return (
        <div style={{ textAlign: 'center', cursor: 'pointer' }} >
            <p style={{marginBottom: '20px'}}>{isFanOn ? 'روشن' : 'خاموش'}</p>
            <img
                src={isFanOn ? 'svgs/fan-on.svg' : 'svgs/fan-off.svg'}
                alt={isFanOn ? 'روشن' : 'خاموش'}
                style={{ width: '300px', transition: '0.3s ease-in-out' }}
            />
        </div>
    );
}
