import React, { useEffect, useState } from 'react'
import './FlameCard.css'

export default function FlameCard({ product, isUserAdmin, deviceState }) {
    const [flameStatus, setFlameStatus] = useState(deviceState ? 'on' : 'off')

    useEffect(() => {
        setFlameStatus(deviceState ? 'on' : 'off')
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
                src={flameStatus === 'on' ? 'svgs/fire-on.svg' : 'svgs/fire-off.svg'}
                alt={flameStatus === 'on' ? 'فعال' : 'غیرفعال'}
                style={{ width: '90px', transition: '0.3s ease-in-out' }}
            />
        </div>
    )
}

