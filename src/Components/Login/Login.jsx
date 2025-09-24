import React, { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import './Login.css'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useAuth } from '../../Contexts/AuthContext'

const url = process.env.REACT_APP_URL

export default function Login() {
    const { isUserLoggedIn, login } = useAuth() // گرفتن وضعیت لاگین و متد login
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [phone, setPhone] = useState('')
    const [showForgetPass, setShowForgetPass] = useState(false)
    const navigate = useNavigate()

    // اگر کاربر قبلا لاگین کرده، مستقیم ریدایرکت به /home
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
                    password
                })
                if (res.status === 200) {
                    login(res.data.token) // آپدیت کردن AuthContext
                    toast.success('به پنل کاربری خود وارد شدید', { className: 'toast-center' })
                    document.body.classList.remove('auth-body')
                    setPassword('')
                    setUsername('')
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
                }
                else {
                    toast.error('خطای اتصال به سرور یا شبکه', { className: 'toast-center' });
                }
            }

        } else {
            toast.warn('لطفا همه فیلدها را پر کنید', { className: 'toast-center' })
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
                                        const value = e.target.value;
                                        if (/^\d*$/.test(value)) {
                                            setPhone(e.target.value)
                                        }
                                    }}
                                />
                                <label htmlFor="phoneNumber" className="form-label">شماره تماس</label>
                            </div>
                        </div>
                        <button className='button-modern' style={{ marginTop: '20px' }} >ارسال</button>
                        <div className='timer-wrapper'>
                            <p className='otp-footer-text' style={{ cursor: 'pointer' }}><Link onClick={(event) => {
                                event.preventDefault()
                                setShowForgetPass(false)
                            }
                            }>بازگشت</Link></p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='login-form-container'>
                    <div className="login wrap">
                        <div className="h1">ورود به حساب</div>

                        <div className='register-inputs-wrapper'>
                            <div className="form-group">
                                <input type="text" className="form-control" placeholder=" " id="username" value={username} onChange={(e) => {
                                    setUsername(e.target.value)
                                }} />
                                <label htmlFor="username" className="form-label">نام کاربری</label>
                            </div>

                            <div className="form-group">
                                <input type="password" className="form-control" placeholder=" " id="passwordNumber" value={password} onChange={(e) => {
                                    setPassword(e.target.value)
                                }} />
                                <label htmlFor="passwordNumber" className="form-label">رمز عبور</label>
                            </div>
                        </div>
                        <button className='button-modern' onClick={loginHandler}>ورود</button>

                        <span className="forgot-password" onClick={() => {
                            setShowForgetPass(true)
                        }}>
                            فراموشی رمز عبور
                        </span>

                        <p className='login-footer-text'>حساب کاربری ندارید؟ <Link to='/register'>ثبت نام کنید</Link></p>
                    </div>

                </div>
            )}
        </>
    )
}
