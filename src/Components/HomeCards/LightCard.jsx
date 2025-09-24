import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const BASE_URL = process.env.REACT_APP_HA_BASE_URL;

export default function LightCard({ product, isUserAdmin, deviceState }) {
    const [lightStatus, setLightStatus] = useState(deviceState);
    const [isPending, setIsPending] = useState(false);

    const deviceType = product.deviceType || 'sensor'
    const deviceId = product.entity_id

    const token = localStorage.getItem('token');

    useEffect(() => {
        setLightStatus(deviceState);
    }, [deviceState]);

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
        if (isPending) return; // جلوگیری از کلیک‌های پشت سر هم
        if (lightStatus === 'on') {
            turnOffLight();
        } else {
            turnOnLight();
        }
    };

    return (
        <div
            style={{ textAlign: 'center', cursor: 'pointer' }}
            className='home-box'
            onClick={handleToggle}
        >
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

            <img
                src={lightStatus === 'on' ? 'svgs/light-on.svg' : 'svgs/light-off.svg'}
                alt={lightStatus === 'on' ? 'روشن' : 'خاموش'}
                style={{ width: '120px', transition: '0.3s ease-in-out' }}
            />
        </div>
    );
}
