import React, { useEffect, useState } from 'react'
import './FlameCard.css'
import DeviceMoreInfo from '../DeviceMoreInfo/DeviceMoreInfo';

function FlameCard({ product, isUserAdmin, deviceState, deviceInfo, deviceStatus }) {
    const [flameStatus, setFlameStatus] = useState(deviceState ? 'on' : 'off')
    const [isShowMoreInfo, setIsShowMoreInfo] = useState(false);


    useEffect(() => {
        setFlameStatus(deviceState ? 'on' : 'off')
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
                        flameStatus === 'on'
                            ? 'svgs/fire-on.svg'
                            : (flameStatus === 'off'
                                ? 'svgs/fire-off.svg'
                                : 'svgs/fire-disable.svg')
                    } alt={flameStatus === 'on' ? 'فعال' : 'غیرفعال'}
                    style={{ width: '90px', transition: '0.3s ease-in-out' }}
                />
            </div>

            {
                isShowMoreInfo && (
                    <div className="overlay" onClick={() => setIsShowMoreInfo(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <h4>جزئیات سنسور</h4>
                            <table className="info-table">
                                <tbody>
                                    <tr><td>تشخیص شعله :</td><td>{flameStatus === 'on' ? 'فعال' : 'غیرفعال'}</td></tr>
                                    <DeviceMoreInfo deviceInfo={deviceInfo} product={product} />
                                </tbody>
                            </table>
                            <button className="close-btn" onClick={() => setIsShowMoreInfo(false)}>بستن</button>
                        </div>
                    </div>
                )
            }
        </>
    )
}


export default React.memo(FlameCard, (prevProps, nextProps) => {
    return (
        prevProps.deviceState === nextProps.deviceState &&
        prevProps.isUserAdmin === nextProps.isUserAdmin &&
        prevProps.product.entity_id === nextProps.product.entity_id
    );
});
