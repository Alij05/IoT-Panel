import React, { useEffect, useState } from 'react'
import './WaterCard.css'

export default function WaterCard({ product, isUserAdmin, deviceState }) {
    const [isWet, setIsWet] = useState(deviceState ? 'on' : 'off')

    useEffect(() => {
        setIsWet(deviceState ? 'on' : 'off')
    }, [deviceState])

    return (
        <div style={{ textAlign: 'center', cursor: 'pointer' }} className='home-box' >
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
                src={isWet === 'on' ? 'svgs/water-on.svg' : 'svgs/water-off.svg'}
                alt={isWet === 'on' ? 'خیس' : 'خشک'}
                style={{ width: '90px', transition: '0.3s ease-in-out' }}
            />

            <p style={{ marginTop: '10px', textAlign: 'center', fontSize: '15px', color: 'var(--text-color)' }}>{isWet === 'on' ? 'خیس' : 'خشک'}</p>
        </div>
    )
}
