import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import "./Settings.css"

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
        if (loading) return;

        setLoading(true);
        try {
            const res = await axios.post(`${url}/api/user/2fa`, {
                enable2FA: !is2FAEnabled
            });

            if (res.status === 200) {
                setIs2FAEnabled(!is2FAEnabled);
                toast.success(is2FAEnabled ? '2FA با موفقیت غیرفعال شد' : '2FA با موفقیت فعال شد', { className: 'toast-center' });
            }

            setIs2FAEnabled(!is2FAEnabled);  // Test

        } catch (err) {
            toast.error('خطا در بروزرسانی وضعیت 2FA', { className: 'toast-center' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-main">
            <h1 className="users-title">تنظیمات حساب</h1>

            <div className="settings-form">
                <div className="settings-form-group">
                    <div className="toggle-switch-container">
                        <label className="settings-label">فعال‌سازی 2FA</label>
                        <button
                            type="button"
                            className={`toggle-switch ${is2FAEnabled ? 'active' : ''}`}
                            onClick={handle2FAToggle}
                            disabled={loading}
                        >
                            <span className="switch-circle"></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
