import React, { useEffect, useState } from 'react'
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
    const [phone, setPhone] = useState('')
    const [showForgetPass, setShowForgetPass] = useState(false)
    const [showOtp, setShowOtp] = useState(false) // برای OTP مرحله دوم
    const [otp, setOtp] = useState('')
    const [timer, setTimer] = useState(60)
    const [showResend, setShowResend] = useState(false)
    const [captchaToken, setCaptchaToken] = useState(null);
    const [cloudflareCaptchaToken, setCloudflareCaptchaToken] = useState("");  // Cloudflare Captcha
    const navigate = useNavigate()

    useEffect(() => {
        let interval
        if (showOtp && timer > 0) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000)
        } else if (timer === 0) {
            setShowResend(true)
        }
        return () => clearInterval(interval)
    }, [showOtp, timer])

    if (isUserLoggedIn) {
        document.body.classList.remove('auth-body')
        return <Navigate to="/home" replace />
    }

    const loginHandler = async (event) => {
        event.preventDefault()
        if (username && password) {
            try {
                const res = await axios.post(`${url}/api/auth/login`, {
                    username,
                    password,
                    captchaToken: cloudflareCaptchaToken
                })
                if (res.status === 200) {
                    if (res.data.requires2FA) {
                        // if User active 2FA
                        setShowOtp(true)
                        toast.info('کد تایید 2FA ارسال شد', { className: 'toast-center' })
                    } else {
                        login(res.data.token)
                        toast.success('به پنل کاربری خود وارد شدید', { className: 'toast-center' })
                        document.body.classList.remove('auth-body')
                        setUsername('')
                        setPassword('')
                    }
                }
            } catch (err) {
                if (err.response?.status === 401) {
                    toast.error('نام کاربری یا رمز عبور اشتباه است', { className: 'toast-center' });
                    setPassword('')
                    setUsername('')
                } else if (err.response?.status === 400) {
                    toast.error('کاربری با این اطلاعات یافت نشد', { className: 'toast-center' });
                    setPassword('')
                    setUsername('')
                } else {
                    toast.error('خطای اتصال به سرور یا شبکه', { className: 'toast-center' });
                }
            }
        } else {
            toast.warn('لطفا همه فیلدها را پر کنید', { className: 'toast-center' })
        }
    }

    const OTPHandler = async () => {
        if (otp.length === 6) {
            try {
                const res = await axios.post(`${url}/api/auth/2fa-verify`, { otp }, { withCredentials: true })
                if (res.status === 200) {
                    login(res.data.token)
                    toast.success('ورود موفقیت‌آمیز!', { className: 'toast-center' })
                    document.body.classList.remove('auth-body')
                    setShowOtp(false)
                    setOtp('')
                }
            } catch (err) {
                toast.error('کد اشتباه یا منقضی شده است', { className: 'toast-center' })
                setOtp('')
            }
        } else {
            toast.warn('کد ۶ رقمی را وارد کنید', { className: 'toast-center' })
        }
    }

    const reSendOTPHandler = async () => {
        try {
            await axios.post(`${url}/api/auth/resendotp`, {}, { withCredentials: true })
            toast.success('کد تایید مجدد ارسال شد', { className: 'toast-center' })
            setShowResend(false)
            setTimer(60)
        } catch (err) {
            toast.error('ارسال مجدد کد تایید با مشکل مواجه شد', { className: 'toast-center' })
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
            const res = await axios.post(`${url}/api/auth/forget-password`, {
                phone,
                // cloudflareCaptchaToken,
            })

            toast.success("کد بازیابی ارسال شد", { className: 'toast-center' })
            setShowForgetPass(false)
            setShowOtp(true)
            setTimer(60)

        } catch (err) {
            toast.error("خطا در ارسال درخواست", { className: 'toast-center' })
        }
    }

    return (
        <>
            {showForgetPass ? (
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
            ) : showOtp ? (
                <div className='login-form-container'>
                    <div className="login wrap">
                        <div className="h1">کد 2FA</div>
                        <div className='otp-inputs-wrapper'>
                            <div className="form-group" id="otpNumber">
                                <input type="text" className="form-control" placeholder="" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} />
                                <label htmlFor="passwordNumber" className="form-label">کد</label>
                            </div>
                        </div>
                        <button className='button-modern' style={{ marginTop: '20px' }} onClick={OTPHandler}>ارسال</button>
                        <div className='timer-wrapper'>
                            {showResend ? (
                                <button className="button-outline-cool" onClick={reSendOTPHandler}>ارسال مجدد</button>
                            ) : (
                                <div>{timer} ثانیه</div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
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
