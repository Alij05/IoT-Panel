import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import DeviceMoreInfo from '../DeviceMoreInfo/DeviceMoreInfo';

const BASE_URL = process.env.REACT_APP_HA_BASE_URL;

function LightCard({ product, isUserAdmin, deviceState, deviceInfo, deviceStatus }) {
    const [lightStatus, setLightStatus] = useState(deviceState);
    const [isPending, setIsPending] = useState(false);
    const [isShowMoreInfo, setIsShowMoreInfo] = useState(false);


    const deviceType = product.deviceType || 'sensor';
    const deviceId = product.entity_id;

    const token = localStorage.getItem('token');

    useEffect(() => {
        setLightStatus(deviceState);
    }, [deviceState]);

    useEffect(() => {
        async function deviceInitState() {
            try {
                const res = await fetch(`${BASE_URL}/api/status/${deviceType}/${deviceId}`);
                const data = await res.json();
                if (res.ok) {
                    console.log('Device Init State', data.state);
                    setLightStatus(data.state);
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
            const res = await fetch(`${BASE_URL}/api/control`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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
            const res = await fetch(`${BASE_URL}/api/control`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ deviceType, deviceId, command: 'off' })
            });

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

    return (
        <>
            <div
                style={{ textAlign: 'center', cursor: lightStatus === 'unknown' ? 'auto' : 'pointer' }}
                className='home-box'
                onClick={lightStatus === 'unknown' ? undefined : handleToggle} >

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
                    <div style={{
                        display: "flex",
                        marginBottom: '15px',
                        gap: "10px 12px",
                        fontSize: "16px",
                        color: "var(--text-color)",
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span>مکان : {product.deviceLocationName}</span> |
                        <span>مالک : {product.user}</span>
                    </div>
                ) : (
                    <div style={{
                        display: "flex",
                        marginBottom: '15px',
                        gap: "10px 12px",
                        fontSize: "16px",
                        color: "var(--text-color)",
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span>{product.deviceName} در {product.deviceLocationName}</span>
                    </div>
                )}

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
        prevProps.product.entity_id === nextProps.product.entity_id
    );
});
