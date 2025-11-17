import React, { useEffect, useState } from 'react'
import './WaterCard.css'
import DeviceMoreInfo from '../DeviceMoreInfo/DeviceMoreInfo';

function WaterCard({ product, isUserAdmin, deviceState, deviceInfo, deviceStatus, sensorsData }) {
    const [isWet, setIsWet] = useState(deviceState ? 'on' : 'off')
    const [isShowMoreInfo, setIsShowMoreInfo] = useState(false);

    console.log("sensorsData", sensorsData);



    useEffect(() => {
        setIsWet(deviceState ? 'on' : 'off')
    }, [deviceState])

    return (
        <>
            <div style={{ textAlign: 'center' }} className='home-box' >

                <div className='more-info' onClick={() => setIsShowMoreInfo(true)}>
                    ...
                </div>

                <div
                    className={`status-dot ${deviceStatus?.includes('Sensor status publish OK') || deviceStatus?.includes('Heartbeat - device online')
                        ? 'online'
                        : 'offline'
                        }`}
                ></div>

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
                    src={
                        isWet === 'on'
                            ? 'svgs/water-on.svg'
                            : (isWet === 'off'
                                ? 'svgs/water-off.svg'
                                : 'svgs/water-disable.svg')
                    }
                    alt={isWet === 'on' ? 'خیس' : 'خشک'}
                    style={{ width: '85px', transition: '0.3s ease-in-out' }}
                />

                <p style={{ marginTop: '10px', textAlign: 'center', fontSize: '15px', color: 'var(--text-color)' }}>{isWet === 'on' ? 'خیس' : 'خشک'}</p>
                <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '15px', color: 'var(--text-color)' }}>درصد رطوبت خاک : {sensorsData?.moisture_pct}</p>

            </div>

            {isShowMoreInfo && (
                <div className="overlay" onClick={() => setIsShowMoreInfo(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h4>جزئیات سنسور</h4>
                        <table className="info-table">
                            <tbody>
                                <tr><td>وضعیت :</td><td>{isWet === 'on' ? 'خیس' : 'خشک'}</td></tr>
                                <DeviceMoreInfo deviceInfo={deviceInfo} product={product} />
                            </tbody>
                        </table>
                        <button className="close-btn" onClick={() => setIsShowMoreInfo(false)}>بستن</button>
                    </div>
                </div>
            )}
        </>
    )
}


export default React.memo(WaterCard, (prevProps, nextProps) => {
    return (
        prevProps.deviceState === nextProps.deviceState &&
        prevProps.isUserAdmin === nextProps.isUserAdmin &&
        prevProps.product.entity_id === nextProps.product.entity_id
    );
});
