import React, { useEffect, useState } from 'react'
import DeviceMoreInfo from '../DeviceMoreInfo/DeviceMoreInfo';

const url = process.env.REACT_APP_URL

function DoorCard({ product, isUserAdmin, deviceState, deviceInfo, deviceStatus, open_count }) {

    console.log('deviceState ==>', deviceState);


    const [isLock, setIsLock] = useState(deviceState ? 'on' : 'off')
    const [openCount, setOpenCount] = useState(open_count)
    const [isShowMoreInfo, setIsShowMoreInfo] = useState(false);

    const deviceType = product.deviceType || 'sensor';
    const deviceId = product.entity_id;


    useEffect(() => {
        setIsLock(deviceState ? 'on' : 'off')
    }, [deviceState])

    useEffect(() => {
        async function deviceInitState() {
            try {
                const res = await fetch(`${url}/api/status/${deviceType}/${deviceId}`);
                const data = await res.json();
                if (!res.ok) return;

                setOpenCount(data.extra.open_count)

            } catch (error) {

            }
        }

        deviceInitState()
    }, []);

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
                        isLock === 'off'
                            ? 'svgs/lock-open.svg'
                            : (isLock === 'off'
                                ? 'svgs/lock-open.svg'
                                : 'svgs/lock-close.svg')
                    }
                    alt={isLock === 'on' ? 'باز' : 'بسته'}
                    style={{ width: '85px', transition: '0.3s ease-in-out' }}
                />

                <p style={{ marginTop: '10px', textAlign: 'center', fontSize: '15px', color: 'var(--text-color)' }}>{isLock === 'off' ? 'باز' : 'بسته'}</p>
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
                                <tr><td>وضعیت :</td><td>{isLock === 'on' ? 'باز' : 'بسته'}</td></tr>
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