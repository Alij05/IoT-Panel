import React, { useEffect, useState } from 'react'
import './MotionDetectionCard.css'
import DeviceMoreInfo from '../DeviceMoreInfo/DeviceMoreInfo';

function MotionDetectionCard({ product, isUserAdmin, deviceState, deviceInfo, deviceStatus }) {
    const [motionStatus, setMotionStatus] = useState(deviceState === 'motion' ? 'on' : 'off')
    const [isShowMoreInfo, setIsShowMoreInfo] = useState(false);


    useEffect(() => {
        setMotionStatus(deviceState === 'motion' ? 'on' : 'off')
    }, [deviceState])

    return (
        <>
            <div style={{ textAlign: 'center' }} className='home-box motion-box' >

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
                        motionStatus === 'on'
                            ? 'svgs/motion-on.svg'
                            : (motionStatus === 'off'
                                ? 'svgs/motion-off.svg'
                                : 'svgs/motion-disable.svg')
                    } alt={motionStatus === 'on' ? 'متصل' : 'قطع'}
                    style={{ width: '120px', transition: '0.3s ease-in-out', transform: 'scale(1.15)', marginTop: '-15px' }}
                />
            </div>


            {isShowMoreInfo && (
                <div className="overlay" onClick={() => setIsShowMoreInfo(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h4>جزئیات سنسور</h4>
                        <table className="info-table">
                            <tbody>
                                <tr><td>حرکت :</td><td>{motionStatus === 'on' ? 'روشن' : 'خاموش'}</td></tr>
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


export default React.memo(MotionDetectionCard, (prevProps, nextProps) => {
    return (
        prevProps.deviceState === nextProps.deviceState &&
        prevProps.isUserAdmin === nextProps.isUserAdmin &&
        prevProps.product.entity_id === nextProps.product.entity_id
    );
});
