import React, { useEffect, useState } from 'react'
import './MotionDetectionCard.css'

export default function MotionDetectionCard({ product, isUserAdmin, deviceState }) {
    const [motionStatus, setMotionStatus] = useState(deviceState === 'motion' ? 'on' : 'off')

    useEffect(() => {
        setMotionStatus(deviceState === 'motion' ? 'on' : 'off')
    }, [deviceState])
    return (
        <div
            style={{ textAlign: 'center' }}
            className='home-box motion-box'
        >
            {isUserAdmin ? (
                <div style={{ display: "flex", marginBottom: '15px', gap: "10px 12px", fontSize: "16px", color: "var(--text-color)", flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                    <span>مکان : {product.deviceLocationName}</span>
                    |
                    <span>مالک : {product.user}</span>
                </div>

            ) : (
                <div style={{ display: "flex", marginBottom: '15px', gap: "10px 12px", fontSize: "16px", color: "var(--text-color)", flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                    <span>{product.deviceName} در {product.deviceLocationName}</span>
                </div>
            )}
            <img
                src={motionStatus === 'on' ? 'svgs/motion-on.svg' : 'svgs/motion-off.svg'}
                alt={motionStatus === 'on' ? 'متصل' : 'قطع'}
                style={{ width: '130px', transition: '0.3s ease-in-out', transform: 'scale(1.15)', marginTop: '-15px' }}
            />
        </div>
    )
}
