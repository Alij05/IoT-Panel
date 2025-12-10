import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import { toast } from 'react-toastify';

const url = process.env.REACT_APP_URL;

function Settings() {
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetch2FAStatus = async () => {
            try {
                const res = await axios.get(`${url}/api/user/2fa/status`);
                if (res.status === 200) {
                    setIs2FAEnabled(res.data.is2FAEnabled);
                }
            } catch (err) {
                console.error('خطا در دریافت وضعیت 2FA:', err);
            }
        };

        fetch2FAStatus();
    }, []);

    const handle2FAToggle = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${url}/api/user/2fa`, {
                enable2FA: !is2FAEnabled
            });

            if (res.status === 200) {
                setIs2FAEnabled(!is2FAEnabled);
                toast.success('2FA با موفقیت فعال شد', { className: 'toast-center' });
            }

        } catch (err) {
            toast.error('خطا در بروزرسانی وضعیت 2FA', { className: 'toast-center' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-main">
            <h1 className="settings-title">تنظیمات حساب</h1>

            <div className="settings-form">
                <div className="settings-form-group">
                    {is2FAEnabled ? <ToggleOnIcon className="input-icon" /> : <ToggleOffIcon className="input-icon" />}
                    <div className="input-wrapper">
                        <label className="settings-label">فعال‌سازی 2FA</label>
                        <button
                            type="button"
                            className="fancy-button"
                            onClick={handle2FAToggle}
                            disabled={loading}
                        >
                            <span className="shadow"></span>
                            <span className="edge"></span>
                            <span className="front text">{is2FAEnabled ? 'غیرفعال کردن' : 'فعال کردن'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
