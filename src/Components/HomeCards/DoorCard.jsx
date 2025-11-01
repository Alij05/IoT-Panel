import React, { useEffect, useState } from 'react'
import DeviceMoreInfo from '../DeviceMoreInfo/DeviceMoreInfo';

function DoorCard({ product, isUserAdmin, deviceState, deviceInfo, deviceStatus, open_count }) {

    const [isWet, setIsWet] = useState(deviceState ? 'on' : 'off')
    const [openCount, setOpenCount] = useState(open_count)
    const [isShowMoreInfo, setIsShowMoreInfo] = useState(false);


    useEffect(() => {
        setIsWet(deviceState ? 'on' : 'off')
    }, [deviceState])

    useEffect(() => {
        setOpenCount(open_count)
    }, [open_count])

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
                                ? 'svgs/lock.svg'
                                : 'svgs/water-disable.svg')
                    }
                    alt={isWet === 'on' ? 'باز' : 'بسته'}
                    style={{ width: '85px', transition: '0.3s ease-in-out' }}
                />

                <p style={{ marginTop: '10px', textAlign: 'center', fontSize: '15px', color: 'var(--text-color)' }}>{isWet === 'on' ? 'باز' : 'بسته'}</p>
                <div
                    className='open-count'
                    style={{
                        marginTop: '12px',
                        padding: '6px 14px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        display: 'inline-block',
                        fontSize: '14px',
                        color: 'var(--text-color)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                >
                    تعداد دفعات باز شده : {openCount}
                </div>

            </div>

            {isShowMoreInfo && (
                <div className="overlay" onClick={() => setIsShowMoreInfo(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h4>جزئیات سنسور</h4>
                        <table className="info-table">
                            <tbody>
                                <tr><td>وضعیت :</td><td>{isWet === 'on' ? 'باز' : 'بسته'}</td></tr>
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


export default React.memo(DoorCard, (prevProps, nextProps) => {
    return (
        prevProps.deviceState === nextProps.deviceState &&
        prevProps.isUserAdmin === nextProps.isUserAdmin &&
        prevProps.product.entity_id === nextProps.product.entity_id &&
        prevProps.open_count === nextProps.open_count
    );
});
