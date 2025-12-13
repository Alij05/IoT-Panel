import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import DeviceMoreInfo from '../DeviceMoreInfo/DeviceMoreInfo';

const url = process.env.REACT_APP_URL;

function LightCard({ product, isUserAdmin, deviceState, deviceInfo, deviceStatus, deiviceAutoStatus }) {
    const [lightStatus, setLightStatus] = useState(deviceState);
    const [lightAutoStatus, setLightAutoStatus] = useState(deiviceAutoStatus);
    const [isPending, setIsPending] = useState(false);
    const [isShowMoreInfo, setIsShowMoreInfo] = useState(false);

    const deviceType = product.deviceType || 'sensor';
    const deviceId = product.entity_id;

    // const token = localStorage.getItem('token');

    useEffect(() => {
        setLightStatus(deviceState);
    }, [deviceState]);

    useEffect(() => {
        setLightAutoStatus(deiviceAutoStatus)
    }, [deiviceAutoStatus])

    useEffect(() => {
        async function deviceInitState() {
            try {
                const res = await fetch(`${url}/mqtt/api/status/${deviceType}/${deviceId}`);
                const data = await res.json();

                if (res.ok) {
                    console.log('Device Init State', data.state);
                    setLightStatus(data.state);
                    setLightAutoStatus(data.extra.auto_enabled);
                }
            } catch (error) {
                console.log(`❌ Get status failed: ${error.message}`, 'error');
            }
        }

        deviceInitState();
    }, [deviceType, deviceId]);

    const turnOnLight = async () => {
        try {
            setIsPending(true);
            const res = await fetch(`${url}/mqtt/api/control`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ deviceType, deviceId, command: 'on' })
            });

            if (res.status === 200) {
                setLightStatus('on');
                toast.success('لامپ روشن شد', { className: 'toast-center' });
            }
        } catch (error) {
            console.error("Failed to turn on light:", error.response || error);
            if (error.response && error.response.status === 403) {
                toast.error('دسترسی غیرمجاز. لطفاً وارد شوید', { className: 'toast-center' });
            } else {
                toast.error('روشن کردن لامپ با مشکل مواجه شد', { className: 'toast-center' });
            }
        } finally {
            setIsPending(false);
        }
    };

    const turnOffLight = async () => {
        try {
            setIsPending(true);
            const res = await fetch(`${url}/mqtt/api/control`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ deviceType, deviceId, command: 'off' })
            });

            console.log('res ======', res);


            if (res.status === 200) {
                setLightStatus('off');
                toast.success('لامپ خاموش شد', { className: 'toast-center' });
            }
        } catch (error) {
            console.error("Failed to turn off light:", error.response || error);
            if (error.response && error.response.status === 403) {
                toast.error('دسترسی غیرمجاز. لطفاً وارد شوید', { className: 'toast-center' });
            } else {
                toast.error('خاموش کردن لامپ با مشکل مواجه شد', { className: 'toast-center' });
            }
        } finally {
            setIsPending(false);
        }
    };

    const handleToggle = () => {
        if (isPending) return;
        if (lightStatus === 'on') {
            turnOffLight();
        } else {
            turnOnLight();
        }
    };


    // ===== Auto Toggle Functions =====
    const turnOnAuto = async () => {
        if (isPending) return;
        try {
            setIsPending(true);
            const res = await fetch(`${url}/mqtt/api/control`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ deviceType, deviceId, command: 'AUTOON' })
            });

            if (res.status === 200) {
                setLightAutoStatus(true);
                toast.success('حالت اتوماتیک فعال شد', { className: 'toast-center' });
            }
        } catch (error) {
            console.error("Failed to turn on Auto:", error.response || error);
            toast.error('فعال سازی حالت اتوماتیک با مشکل مواجه شد', { className: 'toast-center' });
        } finally {
            setIsPending(false);
        }
    };

    const turnOffAuto = async () => {
        if (isPending) return;
        try {
            setIsPending(true);
            const res = await fetch(`${url}/mqtt/api/control`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ deviceType, deviceId, command: 'AUTOOFF' })
            });

            if (res.status === 200) {
                setLightAutoStatus(false);
                toast.success('حالت اتوماتیک غیرفعال شد', { className: 'toast-center' });
            }
        } catch (error) {
            console.error("Failed to turn off Auto:", error.response || error);
            toast.error('غیرفعال سازی حالت اتوماتیک با مشکل مواجه شد', { className: 'toast-center' });
        } finally {
            setIsPending(false);
        }
    };

    const handleAutoToggle = () => {
        if (lightAutoStatus) {
            turnOffAuto();
        } else {
            turnOnAuto();
        }
    };

    return (
        <>
            <div
                style={{ textAlign: 'center', cursor: lightStatus === 'unknown' ? 'auto' : 'pointer' }}
                className='home-box'
                onClick={lightStatus === 'unknown' ? undefined : handleToggle} >

                <div className='more-info' onClick={(event) => {
                    event.stopPropagation(); // Prevent the click event from bubbling up to the parent div
                    setIsShowMoreInfo(true)
                }}>
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
                        <span>مکان : {product.deviceLocationName}</span> |
                        <span>مالک : {product.user}</span>
                    </div>
                ) : (
                    <div style={{ display: "flex", marginBottom: '15px', gap: "10px 12px", fontSize: "16px", color: "var(--text-color)", flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                        <span>{product.deviceName} در {product.deviceLocationName}</span>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    <img
                        src={
                            lightStatus === 'on'
                                ? 'svgs/light-on.svg'
                                : (lightStatus === 'off'
                                    ? 'svgs/light-off.svg'
                                    : 'svgs/light-disable.svg')
                        }
                        alt={lightStatus === 'on' ? 'روشن' : 'خاموش'}
                        style={{ width: '110px', transition: '0.3s ease-in-out' }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                        <p style={{ color: 'var(--text-color)' }}>حالت اتوماتیک</p>
                        <div
                            className={`auto-toggle-switch ${lightAutoStatus ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isPending || lightStatus === 'unknown') return;
                                handleAutoToggle();
                            }}
                        >
                            <div className="switch-circle"></div>
                        </div>

                    </div>

                </div>
            </div>



            {
                isShowMoreInfo && (
                    <div className="overlay" onClick={() => setIsShowMoreInfo(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <h4>جزئیات سنسور</h4>
                            <table className="info-table">
                                <tbody>
                                    <tr><td>حرکت :</td><td>{lightStatus === 'on' ? 'روشن' : 'خاموش'}</td></tr>
                                    <DeviceMoreInfo deviceInfo={deviceInfo} product={product} />
                                </tbody>
                            </table>
                            <button className="close-btn" onClick={() => setIsShowMoreInfo(false)}>بستن</button>
                        </div>
                    </div>
                )
            }
        </>
    );
}

export default React.memo(LightCard, (prevProps, nextProps) => {
    return (
        prevProps.deviceState === nextProps.deviceState &&
        prevProps.isUserAdmin === nextProps.isUserAdmin &&
        prevProps.product.entity_id === nextProps.product.entity_id &&
        prevProps.deiviceAutoStatus === nextProps.deiviceAutoStatus
    );
});
