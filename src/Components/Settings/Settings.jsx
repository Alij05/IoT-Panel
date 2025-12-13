import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
// *** اصلاح شد: استفاده از QRCodeCanvas که به صورت نام‌گذاری شده (Named Export) است ***
import { QRCodeCanvas } from 'qrcode.react';
import "./Settings.css"

const url = process.env.REACT_APP_URL;

function Settings() {
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- Stateهای جدید برای مدیریت فعال‌سازی TOTP ---
    // 0: Initial/Disabled | 1: QR Code Generated | 2: Verification Pending
    const [setupStep, setSetupStep] = useState(0);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    useEffect(() => {
        const fetch2FAStatus = async () => {
            try {
                // فرض می‌کنیم این API وضعیت فعلی 2FA را برمی‌گرداند.
                const res = await axios.get(`${url}/api/user/2fa/status`, { withCredentials: true });
                if (res.status === 200) {
                    setIs2FAEnabled(res.data.is2FAEnabled);
                    // اگر 2FA فعال است، مرحله فعال‌سازی را صفر قرار می‌دهیم.
                    if (res.data.is2FAEnabled) {
                        setSetupStep(0);
                    }
                }
            } catch (err) {
                console.error('خطا در دریافت وضعیت 2FA:', err);
                toast.error('خطا در دریافت وضعیت 2FA', { className: 'toast-center' });
            }
        };

        fetch2FAStatus();
    }, []);

    // --- ۱. شروع فعال‌سازی و دریافت QR Code ---
    const startTOTPSetup = async () => {
        setLoading(true);
        try {
            // POST: /api/auth/totp/enable (کوکی‌ها لازم است)
            const res = await axios.post(`${url}/api/auth/totp/enable`, {}, { withCredentials: true });

            if (res.status === 200) {
                const { qrCode, secret } = res.data;
                setQrCodeUrl(qrCode);
                setSecret(secret);
                setSetupStep(1); // رفتن به مرحله نمایش QR Code و فرم تایید
                toast.info('QR Code تولید شد. لطفا برای تایید نهایی، کد را وارد کنید.', { className: 'toast-center' });
            }
        } catch (err) {
            toast.error('خطا در شروع فعال‌سازی 2FA', { className: 'toast-center' });
        } finally {
            setLoading(false);
        }
    };

    // --- ۲. تایید نهایی کد TOTP توسط کاربر ---
    const verifyTOTP = async (event) => {
        event.preventDefault();
        if (loading) return;

        if (verificationCode.length !== 6) {
            toast.warn('لطفاً کد ۶ رقمی را وارد کنید.', { className: 'toast-center' });
            return;
        }

        setLoading(true);
        try {
            // POST: /api/auth/totp/verify
            const res = await axios.post(`${url}/api/auth/totp/verify`, {
                code: verificationCode.trim()
            }, { withCredentials: true });

            if (res.status === 200) {
                setIs2FAEnabled(true); // 2FA فعال شد
                setSetupStep(0); // بازگشت به حالت اولیه
                setVerificationCode('');
                setQrCodeUrl('');
                setSecret('');
                toast.success('ورود دو مرحله‌ای با موفقیت فعال شد!', { className: 'toast-center' });
            }
        } catch (err) {
            setVerificationCode(''); // پاک کردن کد اشتباه
            toast.error('کد وارد شده صحیح نیست. لطفا دوباره امتحان کنید.', { className: 'toast-center' });
        } finally {
            setLoading(false);
        }
    };

    // --- ۳. غیرفعال‌سازی (از API موجود شما استفاده می‌کند) ---
    const disable2FA = async () => {
        if (loading) return;

        setLoading(true);
        try {
            // POST: /api/user/2fa با enable2FA: false
            const res = await axios.post(`${url}/api/user/2fa`, {
                enable2FA: false
            }, { withCredentials: true });

            if (res.status === 200) {
                setIs2FAEnabled(false);
                toast.success('2FA با موفقیت غیرفعال شد', { className: 'toast-center' });
            }

        } catch (err) {
            toast.error('خطا در غیرفعال‌سازی 2FA', { className: 'toast-center' });
        } finally {
            setLoading(false);
        }
    };

    // --- مدیریت کلید (Toggle) ---
    const handle2FAToggle = () => {
        if (is2FAEnabled) {
            // اگر فعال است، غیرفعال کن
            disable2FA();
        } else if (setupStep === 0) {
            // اگر غیرفعال است و در مرحله شروع هستیم، فرآیند فعال‌سازی را شروع کن
            startTOTPSetup();
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
                            disabled={loading || setupStep === 1} // در حین تنظیم، دکمه اصلی را غیرفعال می‌کنیم
                        >
                            <span className="switch-circle"></span>
                        </button>
                    </div>
                </div>

                {/* --- بخش فعال‌سازی TOTP (مرحله ۱: نمایش QR Code و تایید) --- */}
                {setupStep === 1 && !is2FAEnabled && (
                    <div className="totp-setup-box" style={{
                        marginTop: '20px',
                        padding: '20px',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h2>گام نهایی: اسکن و تایید کد</h2>
                        <p>لطفاً کد زیر را با اپلیکیشن Authenticator اسکن کنید و کد ۶ رقمی تولید شده را در کادر زیر وارد نمایید:</p>

                        <div style={{ margin: '20px auto', width: '256px' }}>
                            {qrCodeUrl ? (
                                <QRCodeCanvas value={qrCodeUrl} size={256} level="H" />
                            ) : (
                                <p>در حال تولید QR Code...</p>
                            )}
                        </div>

                        <p>کد دستی: <code style={{ overflowWrap: 'break-word', fontWeight: 'bold' }}>{secret}</code></p>

                        <form onSubmit={verifyTOTP} style={{ marginTop: '20px' }}>
                            <div className="form-group" style={{ maxWidth: '300px', margin: '15px auto' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder=" "
                                    id="verificationCode"
                                    value={verificationCode}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*$/.test(value) && value.length <= 6) {
                                            setVerificationCode(value);
                                        }
                                    }}
                                    maxLength={6}
                                    inputMode="numeric"
                                />
                                <label htmlFor="verificationCode" className="form-label">کد تایید (۶ رقمی)</label>
                            </div>
                            <button type="submit" className='button-modern' disabled={loading || verificationCode.length !== 6}>
                                {loading ? 'در حال تایید...' : 'تایید و تکمیل فعال‌سازی'}
                            </button>
                            <button
                                type="button"
                                className='button-outline'
                                onClick={() => setSetupStep(0)}
                                disabled={loading}
                                style={{ marginRight: '10px' }}
                            >
                                انصراف
                            </button>
                        </form>
                    </div>
                )}
                {/* --- پایان بخش فعال‌سازی TOTP --- */}

            </div>
        </div>
    );
}

export default Settings;