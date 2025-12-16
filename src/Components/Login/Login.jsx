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
    const [showTwoFactorLogin, setShowTwoFactorLogin] = useState(false)

    const [cloudflareCaptchaToken, setCloudflareCaptchaToken] = useState("");  // Cloudflare Captcha
    const [captchaKey, setCaptchaKey] = useState(0)


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
                console.log('loginData =>', loginData);

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
                console.log("errorMessage =>", errorMessage);
                console.log("error =>", err);

                if (status === 401 || status === 403) {
                    if (errorMessage.includes('TOTP code is required')) {
                        toast.error('ورود دو مرحله‌ای فعال است. لطفاً کد را وارد کنید.', { className: 'toast-center' });
                        setShowTwoFactorLogin(true)
                        // ریست کپچا
                        setCloudflareCaptchaToken('')
                        setCaptchaKey(prev => prev + 1)
                    }
                    else {
                        toast.error('نام کاربری یا رمز عبور اشتباه است', { className: 'toast-center' });
                        setUsername('')
                        setPassword('')
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
                /* فرم فراموشی رمز عبور */
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
                                <label htmlFor="phoneNumber" className="form-label">
                                    شماره تماس
                                </label>
                            </div>
                        </div>

                        <Captcha
                            key={captchaKey}
                            onVerify={(token) => setCloudflareCaptchaToken(token)}
                        />


                        <button className='button-modern' style={{ marginTop: '20px' }} onClick={handleForgetPass}>
                            ارسال
                        </button>

                        <p className='otp-footer-text' style={{ cursor: 'pointer' }} onClick={() => setShowForgetPass(false)}>
                            بازگشت
                        </p>
                    </div>
                </div>

            ) : showTwoFactorLogin ? (

                /* فرم ورود دومرحله‌ای */
                <div className='login-form-container'>
                    <div className="login wrap">
                        <div className="h1">ورود دومرحله‌ای</div>

                        <form onSubmit={loginHandler} style={{ width: '60%', margin: '0 auto' }}>
                            <div className="form-group">
                                <input type="text" className="form-control" placeholder=" " value={totpCode} maxLength={6} inputMode="numeric"
                                    onChange={(e) => {
                                        const value = e.target.value
                                        if (/^\d*$/.test(value)) setTotpCode(value)
                                    }}
                                />
                                <label className="form-label">
                                    کد ۶ رقمی 2FA
                                </label>
                            </div>

                            <button className='button-modern'>
                                ورود
                            </button>
                        </form>

                        <span
                            className="forgot-password"
                            onClick={() => setShowTwoFactorLogin(false)}
                        >
                            بازگشت
                        </span>
                    </div>
                </div>

            ) : (

                /* فرم ورود معمولی */
                <div className='login-form-container'>
                    <div className="login wrap">
                        <div className="h1">ورود به حساب</div>

                        <form onSubmit={loginHandler}>
                            <div className='register-inputs-wrapper'>
                                <div className="form-group">
                                    <input type="text" className="form-control" placeholder=" " value={username} onChange={(e) => setUsername(e.target.value)} />
                                    <label className="form-label">نام کاربری</label>
                                </div>

                                <div className="form-group">
                                    <input type="password" className="form-control" placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)} />
                                    <label className="form-label">رمز عبور</label>
                                </div>
                            </div>

                            <Captcha
                                key={captchaKey}
                                onVerify={(token) => setCloudflareCaptchaToken(token)}
                            />


                            <button className='button-modern'>
                                ورود
                            </button>
                        </form>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: "space-between" }}>
                            <span className="forgot-password" onClick={() => setShowForgetPass(true)} >
                                فراموشی رمز عبور
                            </span>

                            <span className="forgot-password" onClick={() => setShowTwoFactorLogin(true)} >
                                ورود دومرحله‌ای
                            </span>
                        </div>


                        <p className='login-footer-text'>
                            حساب کاربری ندارید؟ <Link to='/register'>ثبت نام کنید</Link>
                        </p>
                    </div>
                </div>
            )}
        </>
    )

}