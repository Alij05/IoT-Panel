import React, { useState } from 'react'
import './FanCard.css'
import { toast } from 'react-toastify';
import { turnOffFan, turnOnFan } from '../../Services/HomeAssistantConnection';
import axios from 'axios';
import useDeviceStatusStore from '../../Store/deviceStateStore';

const url = process.env.REACT_APP_URL

export default function FanCard({ product }) {
    const entityID = product.entity_id
    const [fanStatus, setFanStatus] = useState(product.state);
    const [isPending, setIsPending] = useState(false);


    async function fetchTurnOnFan() {
        try {
            setIsPending(true);
            setFanStatus('on');
            await turnOnFan(entityID);
            await axios.put(`${url}/api/devices/${entityID}`, { state: 'on' });
            toast.success('فن روشن شد', { className: 'toast-center' });
        } catch (err) {
            console.error(err);
            toast.error('روشن کردن فن با مشکل مواجه شد', { className: 'toast-center' });
        } finally {
            setIsPending(false);
        }
    }

    async function fetchTurnOffFan() {
        try {
            setIsPending(true);
            setFanStatus('off');
            await turnOffFan(entityID);
            await axios.put(`${url}/api/devices/${entityID}`, { state: 'off' }); toast.success('فن خاموش شد', { className: 'toast-center' });
        } catch (err) {
            console.error(err);
            toast.error('خاموش کردن فن با مشکل مواجه شد', { className: 'toast-center' });
        } finally {
            setIsPending(false);
        }
    }

    const handleToggle = () => {
        if (isPending) return; // جلوگیری از کلیک‌های پشت سر هم
        if (fanStatus === 'on') {
            fetchTurnOffFan();
        } else {
            fetchTurnOnFan();
        }
    };

    return (
        <div
            style={{ textAlign: 'center', cursor: isPending ? 'not-allowed' : 'pointer' }}
            className='home-box'
            onClick={handleToggle}
        >
            <div style={{ display: "flex", gap: "15px 20px", fontSize: "18px", color: "var(--text-color)", flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                <span>مکان : {product.deviceLocationName}</span>
                |
                <span>مالک : {product.user}</span>
            </div>
            <img
                src={fanStatus === 'on' ? 'svgs/fan-on.svg' : 'svgs/fan-off.svg'}
                alt={fanStatus === 'on' ? 'روشن' : 'خاموش'}
                style={{ width: '110px', transition: '0.3s ease-in-out', marginTop: '15px' }}
            />
        </div>
    )
}
