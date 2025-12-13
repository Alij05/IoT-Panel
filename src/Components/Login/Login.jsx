import React, { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import './Login.css'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useAuth } from '../../Contexts/AuthContext'
import Captcha from './../Captcha/Captcha'

const url = process.env.REACT_APP_URL

export default function Login() {
    const { isUserLoggedIn, login } = useAuth()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [totpCode, setTotpCode] = useState('')  // 2FA
    const [phone, setPhone] = useState('')
    const [showForgetPass, setShowForgetPass] = useState(false)

    // States مربوط به OTP مرحله دوم حذف شده‌اند.

    const [captchaToken, setCaptchaToken] = useState(null);
    const [cloudflareCaptchaToken, setCloudflareCaptchaToken] = useState("");  // Cloudflare Captcha
    const navigate = useNavigate()

    if (isUserLoggedIn) {
        document.body.classList.remove('auth-body')
        return <Navigate to="/home" replace />
    }

    const loginHandler = async (event) => {
        event.preventDefault()
        if (username && password) {
            try {
                const loginData = {
                    username,
                    password,
                    captchaToken: cloudflareCaptchaToken
                };

                if (totpCode.trim().length > 0 && totpCode.trim().length <= 6) {
                    loginData.totpCode = totpCode.trim();
                }

                const res = await axios.post(`${url}/api/auth/login`, loginData)
                console.log('Login Response =>', res);

                if (res.status === 200) {
                    login(res.data.token)
                    toast.success('به پنل کاربری خود وارد شدید', { className: 'toast-center' })
                    document.body.classList.remove('auth-body')
                    setUsername('')
                    setPassword('')
                    setTotpCode('')
                }
            } catch (err) {
                const status = err.response?.status;
                const errorMessage = err.response?.data?.message || '';
                console.log("errorMessage =>", errorMessage
                );

                if (status === 401 || status === 403) {

                    if (errorMessage.includes('2FA is required') || errorMessage.includes('TOTP is required') || errorMessage.includes('Invalid TOTP')) {
                        if (totpCode.trim().length > 0) {
                            toast.error('کد 2FA وارد شده اشتباه است.', { className: 'toast-center' });
                        } else {
                            toast.error('ورود دو مرحله‌ای فعال است. لطفاً کد 2FA را وارد کنید.', { className: 'toast-center' });
                        }
                        setPassword('')
                        setTotpCode('')
                    }
                    // خطای عمومی نام کاربری/رمز عبور
                    else {
                        toast.error('نام کاربری یا رمز عبور اشتباه است', { className: 'toast-center' });
                        setPassword('')
                        setUsername('')
                        setTotpCode('')
                    }

                } else if (status === 400) {
                    toast.error('کاربری با این اطلاعات یافت نشد', { className: 'toast-center' });
                    setPassword('')
                    setUsername('')
                    setTotpCode('')
                } else {
                    toast.error('خطای اتصال به سرور یا شبکه', { className: 'toast-center' });
                }
            }
        } else {
            toast.warn('لطفا نام کاربری و رمز عبور را پر کنید', { className: 'toast-center' })
        }
    }

    const handleForgetPass = async () => {
        if (!phone) {
            toast.warn("شماره تماس را وارد کنید", { className: "toast-center" })
            return
        }

        if (!cloudflareCaptchaToken) {
            toast.warn("لطفاً کپچا را تکمیل کنید", { className: 'toast-center' })
            return
        }

        try {
            await axios.post(`${url}/api/auth/forget-password`, {
                phone,
                // cloudflareCaptchaToken,
            })

            toast.success("کد بازیابی ارسال شد. لطفاً صندوق ورودی خود را چک کنید.", { className: 'toast-center' })
            setShowForgetPass(false)

        } catch (err) {
            toast.error("خطا در ارسال درخواست", { className: 'toast-center' })
        }
    }

    return (
        <>
            {showForgetPass ? (
                // نمایش فرم فراموشی رمز عبور
                <div className='login-form-container'>
                    <div className="login wrap">
                        <div className="h1">فراموشی رمز عبور</div>
                        <div className='otp-inputs-wrapper'>
                            <div className="form-group" style={{ width: '70%', margin: '0 auto' }}>
                                <input type="text" className="form-control" id="phoneNumber" placeholder=" " value={phone} maxLength="11" inputMode="numeric"
                                    onChange={(e) => {
                                        const value = e.target.value
                                        if (/^\d*$/.test(value)) setPhone(value)
                                    }}
                                />
                                <label htmlFor="phoneNumber" className="form-label">شماره تماس</label>
                            </div>
                        </div>

                        {/* Captcha Component */}
                        <Captcha onVerify={(token) => setCloudflareCaptchaToken(token)} />

                        <button className='button-modern' style={{ marginTop: '20px' }} onClick={handleForgetPass}>ارسال</button>
                        <div className='timer-wrapper'>
                            <p className='otp-footer-text' style={{ cursor: 'pointer' }}><Link onClick={(event) => {
                                event.preventDefault()
                                setShowForgetPass(false)
                            }}>بازگشت</Link></p>
                        </div>
                    </div>
                </div>
            ) : (
                // فرم ورود اصلی (حالت پیش فرض)
                <div className='login-form-container'>
                    <div className="login wrap">
                        <div className="h1">ورود به حساب</div>
                        <form onSubmit={loginHandler}>
                            <div className='register-inputs-wrapper' >
                                <div className="form-group">
                                    <input type="text" className="form-control" placeholder=" " id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                                    <label htmlFor="username" className="form-label">نام کاربری</label>
                                </div>
                                <div className="form-group">
                                    <input type="password" className="form-control" placeholder=" " id="passwordNumber" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    <label htmlFor="passwordNumber" className="form-label">رمز عبور</label>
                                </div>
                                {/* فیلد ورود 2FA جدید در فرم اصلی */}
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder=" "
                                        id="totpCode"
                                        value={totpCode}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // اجازه ورود فقط اعداد تا حداکثر 6 کاراکتر
                                            if (/^\d*$/.test(value) && value.length <= 6) {
                                                setTotpCode(value);
                                            }
                                        }}
                                        maxLength={6}
                                        inputMode="numeric"
                                    />
                                    <label htmlFor="totpCode" className="form-label">2FA (کد ۶ رقمی)</label>
                                </div>
                            </div>

                            <Captcha onVerify={(token) => setCloudflareCaptchaToken(token)} />

                            <button className='button-modern'>ورود</button>
                        </form>
                        <span className="forgot-password" onClick={() => setShowForgetPass(true)}>فراموشی رمز عبور</span>
                        <p className='login-footer-text'>حساب کاربری ندارید؟ <Link to='/register'>ثبت نام کنید</Link></p>
                    </div>
                </div>
            )}
        </>
    )
}