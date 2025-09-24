import React, { useContext, useEffect } from 'react'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import BedtimeOutlinedIcon from '@mui/icons-material/BedtimeOutlined';
import Search from '../Search/Search';
import './Header.css'
import { ThemeContext } from '../../Contexts/ThemeContexts';
import { useLocation } from 'react-router-dom';
import moment from "moment-jalaali";
import { MobileMenuContext } from '../../Contexts/MobileMenuContext';
import axios from 'axios';
import { useAuth } from '../../Contexts/AuthContext';

const url = process.env.REACT_APP_URL

export default function Header() {

    const { theme, toggleTheme } = useContext(ThemeContext)
    const { mobileMenuClickHandler } = useContext(MobileMenuContext)
    const {username, isUserAdmin} = useAuth()

    const params = useLocation()
    const isShowHeader = (params.pathname === '/users' || params.pathname === '/products')

    // Persian Date
    moment.loadPersian({ dialect: "persian-modern", usePersianDigits: true });

    const today = moment(); // تاریخ امروز
    const dayName = today.format("dddd"); // نام روز هفته (مثلاً شنبه)
    const dateStr = today.format("jYYYY/jMM/jDD"); // تاریخ شمسی
    const token = localStorage.getItem('token')


    async function getHomeScreenUser() {
        try {
            const res = await axios.post(`${url}/api/auth/homescreen`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    }


    useEffect(() => {
        getHomeScreenUser()
    }, [])


    return (
        <header className='header'>

            {/* Hamburger Menu */}
            <div className="mobile-menu-wrapper" onClick={mobileMenuClickHandler}>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
            </div>

            <div className="admin-profile">
                <img src="/images/user.webp" alt="Admin Profile" />
                <div>
                    <h1>{username}</h1>
                    <h3>{isUserAdmin ? 'ادمین' : 'کاربر'}</h3>
                </div>
            </div>

            <div className='header-left-section'>
                <div className=''>
                    {isShowHeader && <Search />}
                </div>
                <div className='header-left-icon header-date'>
                    <div style={{ padding: "10px", textAlign: "center", fontWeight: "bold" }}>
                        {dateStr} , {dayName}
                    </div>
                </div>
                <button className='header-left-icon header-theme' onClick={toggleTheme}>
                    {theme === 'light' ? (
                        <BedtimeOutlinedIcon />
                    ) : (
                        <WbSunnyOutlinedIcon />
                    )}
                </button>
            </div>

        </header>
    )
}
