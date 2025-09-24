import React from 'react'
import './WaterCard.css'

export default function WaterCard({ isWet, owner, deviceName, deviceLocation }) {
    return (
        <div style={{ textAlign: 'center', cursor: 'pointer' }} className='home-box' >
            <div style={{ display: "flex", gap: "15px 20px", fontSize: "18px", color: "black", flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                {/* <span>دستگاه: {deviceName}</span> */}
                <span>مکان : {deviceLocation}</span>
                |
                <span>مالک : {owner}</span>
            </div>            <img
                src={isWet ? 'svgs/water-on.svg' : 'svgs/water-off.svg'}
                alt={isWet ? 'خیس' : 'خشک'}
                style={{ width: '220px', transition: '0.3s ease-in-out' }}
            />
        </div>
    )
}
