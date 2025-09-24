import React from 'react';
import { Thermometer, Droplets } from 'lucide-react';
import './TempCard.css';

export default function TempCard({ product, isUserAdmin, deviceState }) {

    // console.log('deviceState', deviceState);


    return (
        <>
            <div className="sensor-wrapper home-box temp-wrapper">
                {isUserAdmin ? (
                    <div style={{ display: "flex", gap: "10px 12px", fontSize: "16px", color: "var(--text-color)", flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                        <span>مکان : {product.deviceLocationName}</span> |
                        <span>مالک : {product.user}</span>
                    </div>
                ) : (
                    <div style={{ display: "flex", gap: "10px 12px", fontSize: "16px", color: "var(--text-color)", flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                        <span>{product.deviceName} در {product.deviceLocationName}</span>
                    </div>
                )}

                <div className='sensor-cards-wrapper'>
                    <div className="sensor-card temperature-card">
                        <Thermometer size={40} />
                        <div className="sensor-info">
                            <h3>Temperature</h3>
                            <p>{product.temperature}°C</p>
                        </div>
                    </div>
                    <div className="sensor-card humidity-card">
                        <Droplets size={40} />
                        <div className="sensor-info">
                            <h3>Humidity</h3>
                            <p>% {product.humidity}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
