import React, { useContext, useEffect, useState } from 'react'
import './UsersTable.css'
import DeleteModal from '../DeleteModal/DeleteModal'
import EditModal from '../EditModal/EditModal'
import ErrorBox from '../ErrorBox/ErrorBox'
import TextFieldsIcon from '@mui/icons-material/TextFields';
import PhoneEnabledIcon from '@mui/icons-material/PhoneEnabled';
import LockIcon from '@mui/icons-material/Lock';
import axios from 'axios'
import { SearchContext } from '../../Contexts/SearchContext'
import { toast } from 'react-toastify';
import useUsersStore from '../../Store/usersStore'
import { useAuth } from '../../Contexts/AuthContext'

const url = process.env.REACT_APP_URL



export default function UsersTable() {

    const contextData = useContext(SearchContext)
    const { isUserAdmin } = useAuth();


    const [users, setUsers] = useState([])
    const [id, setId] = useState('')
    const [newUsername, setNewUsername] = useState('')
    const [newPhone, setNewPhone] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [isShowDeleteModal, setIsShowDeleteModal] = useState(false)
    const [isShowEditModal, setIsShowEditModal] = useState(false)
    const [isPending, setIsPending] = useState(true)


    const getData = () => {
        axios.get(`${url}/api/auth/users`)
            .then(res => {
                setUsers(res.data)
                setIsPending(false)
                contextData.setSearchSourceData(res.data)
            })
    }

    useEffect(() => {
        if (isUserAdmin) {
            getData()
        }
    }, [])

    useEffect(() => {
        setUsers(contextData.filteredDatas)
    }, [contextData.filteredDatas])


    const closeDeleteModal = () => {
        setIsShowDeleteModal(false)
    }

    const closeEditModal = () => {
        setIsShowEditModal(false)
    }

    const deleteUserHandler = () => {
        axios.delete(`${url}/api/auth/${newUsername}`)
            .then(res => {
                if (res.status === 200) {
                    toast.success('کاربر با موفقیت حذف شد', { className: 'toast-center' })
                    getData()
                }
            })
            .catch(err => {
                if (err.response) {
                    if (err.response.status === 400) {
                        toast.success('کاربر با موفقیت حذف شد', { className: 'toast-center' })
                    } else {
                        toast.error('عملیات حذف کاربر با مشکل مواجه شد', { className: 'toast-center' });
                    }
                } else {
                    toast.error('خطای اتصال به سرور یا شبکه', { className: 'toast-center' });
                }
            })
        closeDeleteModal()
    }

    const newUserHandler = (event) => {
        event.preventDefault()

        if (newUsername && newPhone && newPassword) {
            if (newPhone.length !== 11) {
                toast.error('شماره تماس باید 11 رقم باشد', { className: 'toast-center' })
            } else {
                axios.put(`${url}/api/auth/${id}`, {
                    username: newUsername,
                    password: newPassword,
                    phone: newPhone
                }).then(res => {
                    if (res.status === 200) {
                        toast.success('کاربر با موفقیت ویرایش شد', { className: 'toast-center' })
                        getData()
                        closeEditModal()
                    } else {
                        toast.error('عملیات تغییر کاربر با مشکل مواجه شد', { className: 'toast-center' })
                    }
                })
            }
        } else {
            toast.warn('لطفا همه فیلدها را پر کنید', { className: 'toast-center' })
        }
    }

    return (
        <>
            <h1 className='users-title'>لیست کاربران</h1>
            {isPending ? (
                <div className='pending-wrapper'>
                    <div className="dot-spinner">
                        <div className="dot-spinner__dot"></div>
                        <div className="dot-spinner__dot"></div>
                        <div className="dot-spinner__dot"></div>
                        <div className="dot-spinner__dot"></div>
                        <div className="dot-spinner__dot"></div>
                        <div className="dot-spinner__dot"></div>
                        <div className="dot-spinner__dot"></div>
                        <div className="dot-spinner__dot"></div>
                    </div>
                </div>
            ) : (
                users.length ? (
                    <table className='users-table'>
                        <thead>
                            <tr>
                                {/* <th>id</th> */}
                                <th>نام کاربری</th>
                                <th className='national-id-active'>کد ملی</th>
                                <th>شماره تماس</th>
                                <th>عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <>
                                    {
                                        user.id !== 'ADMIN' && (
                                            <tr key={user.username}>
                                                {/* <td>{user.id}</td> */}
                                                <td>{user.username}</td>
                                                <td className='national-id-active'>{user.national_id}</td>
                                                <td>{user.phone}</td>
                                                <td className="btn-cell">
                                                    <button
                                                        className='users-table-btn'
                                                        onClick={() => {
                                                            setIsShowDeleteModal(true)
                                                            setId(user.id)
                                                            setNewUsername(user.username)
                                                            setNewPhone(user.phone)
                                                        }}
                                                    >
                                                        حذف
                                                    </button>

                                                    <button
                                                        className='users-table-btn'
                                                        onClick={() => {
                                                            setIsShowEditModal(true)
                                                            setId(user.id)
                                                            setNewUsername(user.username)
                                                            setNewPhone(user.phone)
                                                        }}
                                                    >
                                                        ویرایش
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    }
                                </>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <ErrorBox msg="هیچ کاربری یافت نشد" />
                )
            )}


            {isShowDeleteModal && < DeleteModal closeModal={closeDeleteModal} submitModal={deleteUserHandler} />}
            {isShowEditModal && <EditModal closeModal={closeEditModal} submitModal={newUserHandler}>
                <div className="edit_form_wrapper">
                    <div className='add-products-form-group'>
                        <TextFieldsIcon className='input-icon' />
                        <input defaultValue={newUsername} type="text" placeholder='نام جدید' className='add-products-input' onChange={(e) => setNewUsername(e.target.value)} />
                    </div>
                    <div className='add-products-form-group'>
                        <LockIcon className='input-icon' />
                        <input type="password" placeholder='رمز عبور جدید' className='add-products-input' onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                    <div className='add-products-form-group'>
                        <PhoneEnabledIcon className='input-icon' />
                        <input
                            defaultValue={newPhone}
                            maxLength='11'
                            inputMode="numeric"
                            type="text"
                            placeholder='شماره تماس جدید'
                            className='add-products-input'
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) {
                                    setNewPhone(value);
                                }
                            }}
                            onKeyDown={(e) => {
                                const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
                                if (
                                    !/^\d$/.test(e.key) &&
                                    !allowedKeys.includes(e.key)
                                ) {
                                    e.preventDefault();
                                }
                            }}
                            onPaste={(e) => {
                                const paste = e.clipboardData.getData('text');
                                if (!/^\d+$/.test(paste)) {
                                    e.preventDefault();
                                }
                            }}
                        />
                    </div>

                </div>
            </EditModal>}

        </>
    )
}
