import React, { useEffect, useState } from 'react'
import './AddNewUser.css'
import CreateRoundedIcon from '@mui/icons-material/CreateRounded';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import PhoneEnabledIcon from '@mui/icons-material/PhoneEnabled';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';

import LockResetIcon from '@mui/icons-material/LockReset';

import { toast } from 'react-toastify';
import axios from 'axios';

const url = process.env.REACT_APP_URL

export default function AddNewUser() {

    // const [id, setId] = useState('')
    const [username, setUsername] = useState('')
    const [nationalId, setNationalId] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [repeatedPassword, setRepeatedPassword] = useState('')
    const [isShowPassword, setIsShowPassword] = useState(false)


    const addNewUserHandler = (event) => {
        event.preventDefault()
        if (username && nationalId && phone && password && repeatedPassword) {
            if (nationalId.length !== 10) {
                toast.error('کد ملی باید 10 رقم باشد', { className: 'toast-center' })
            }
            else if (phone.length !== 11) {
                toast.error('شماره تماس باید 11 رقم باشد', { className: 'toast-center' })
            } else if (password !== repeatedPassword) {
                toast.error('رمز عبور اشتباه است', { className: 'toast-center' })

            } else {
                // Check National Id with Phone by Shahkar API
                axios.post(`${url}/api/auth/idverify`, {
                    nationalCode: nationalId,
                    phone
                }).then(response => {
                    if (response.status === 200) {
                        console.log('Shahkar OK', response);
                        // Ok! Send Request 
                        axios.post(`${url}/api/auth/adduser`, {
                            // id,
                            username,
                            password,
                            national_id: nationalId,
                            phone,
                        }).then(res => {
                            if (res.status === 200) {
                                toast.success('کاربر جدید با موفقیت اضافه شد', { className: 'toast-center' })
                                clearInput()
                            }

                        }).catch(err => {
                            if (err.response) {
                                if (err.response.status === 400) {
                                    toast.error('کاربری با این نام کاربری وجود دارد', { className: 'toast-center' });
                                    clearInput();
                                } else {
                                    toast.error('عملیات افزودن کاربر با مشکل مواجه شد', { className: 'toast-center' });
                                }
                            } else {
                                toast.error('خطای اتصال به سرور یا شبکه', { className: 'toast-center' });
                            }
                        })
                    }

                }).catch(error => {
                    if (error.response) {
                        // Shahkar API Error
                        if (error.response.status === 401) {
                            toast.error('کد ملی با شماره تماس تطابق ندارد', { className: 'toast-center' });
                            setPhone('')
                            setNationalId('')
                        } else {
                            toast.error('Error !', { className: 'toast-center' });
                        }
                    } else {
                        toast.error('خطای اتصال به سرور یا شبکه', { className: 'toast-center' });
                    }
                })

            }
        } else {
            toast.warn('لطفا همه فیلدها را پر کنید', { className: 'toast-center' })
        }
    }


    const clearInput = () => {
        // setId('')
        setUsername('')
        setNationalId('')
        setPhone('')
        setPassword('')
        setRepeatedPassword('')
    }


    return (
        <>
            <div className='users-main'>
                <h1 className='users-title'>افزودن کاربر جدید</h1>

                <form action="#" className='add-users-form' >
                    <div className='add-users-form-wrap'>
                        {/* <div className='add-users-form-group'>
                            <PersonIcon className='input-icon' />
                            <div className="input-wrapper">
                                <input value={id} type="text" required id="name" className="add-users-input" autoComplete="off" onChange={(e) => setId(e.target.value)} />
                                <label htmlFor="name">آیدی</label>
                            </div>
                        </div> */}

                        <div className='add-users-form-group'>
                            <CreateRoundedIcon className='input-icon' />
                            <div className="input-wrapper">
                                <input value={username} type="text" required id="name" className="add-users-input" autoComplete="off" onChange={(e) => setUsername(e.target.value)} />
                                <label htmlFor="name">نام کاربری</label>
                            </div>
                        </div>

                        <div className='add-users-form-group'>
                            <BadgeIcon className='input-icon' />
                            <div className="input-wrapper">
                                <input type="text" inputMode="numeric" maxLength='10' required id="phone" value={nationalId} className="add-users-input" onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        setNationalId(value);
                                    }
                                }}
                                    onPaste={(e) => {
                                        const paste = e.clipboardData.getData('text');
                                        if (!/^\d+$/.test(paste)) {
                                            e.preventDefault();
                                        }
                                    }} />
                                <label htmlFor="name">کد ملی</label>
                            </div>
                        </div>

                        <div className='add-users-form-group'>
                            <PhoneEnabledIcon className='input-icon' />
                            <div className="input-wrapper">
                                <input type="text" inputMode="numeric" maxLength='11' required id="phone" value={phone} className="add-users-input" onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        setPhone(value);
                                    }
                                }}
                                    onPaste={(e) => {
                                        const paste = e.clipboardData.getData('text');
                                        if (!/^\d+$/.test(paste)) {
                                            e.preventDefault();
                                        }
                                    }} />
                                <label htmlFor="phone">شماره تماس</label>
                            </div>
                        </div>

                        <div className='add-users-form-group'>
                            <LockIcon className='input-icon' />
                            <div className="input-wrapper">
                                <input value={password} type={`${isShowPassword ? 'text' : 'password'}`} required id="password" className="add-users-input" autoComplete="new-password" onChange={(e) => setPassword(e.target.value)} />
                                <label htmlFor="password">رمز عبور</label>
                            </div>
                            {isShowPassword ? (<VisibilityOffIcon className='input-icon' style={{ cursor: 'pointer' }} onClick={() => setIsShowPassword(prev => !prev)} />) : <VisibilityIcon className='input-icon' style={{ cursor: 'pointer' }} onClick={() => setIsShowPassword(prev => !prev)} />}
                        </div>

                        <div className='add-users-form-group'>
                            <LockResetIcon className='input-icon' />
                            <div className="input-wrapper">
                                <input value={repeatedPassword} type="password" required id="confirm-password" className="add-users-input" autoComplete="new-password" onChange={(e) => setRepeatedPassword(e.target.value)} />
                                <label htmlFor="confirm-password">رمز عبور مجدد</label>
                            </div>
                        </div>
                    </div>

                    <button className='add-users-submit' onClick={addNewUserHandler}>
                        <span className="shadow"></span>
                        <span className="edge"></span>
                        <span className="front text">ثبت کاربر</span>
                    </button>

                </form>
            </div>


        </>
    )
}
