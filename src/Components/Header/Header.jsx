import React, { useContext, useEffect, useRef, useState } from 'react'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import BedtimeOutlinedIcon from '@mui/icons-material/BedtimeOutlined';
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Search from '../Search/Search';
import './Header.css'
import { ThemeContext } from '../../Contexts/ThemeContexts';
import { useLocation } from 'react-router-dom';
import moment from "moment-jalaali";
import { MobileMenuContext } from '../../Contexts/MobileMenuContext';
import axios from 'axios';
import { useAuth } from '../../Contexts/AuthContext';
import { useSockets } from '../../Contexts/SocketProvider';

// const url = process.env.REACT_APP_HA_BASE_URL;
const url = process.env.REACT_APP_URL

export default function Header() {

    const { theme, toggleTheme } = useContext(ThemeContext)
    const { mobileMenuClickHandler } = useContext(MobileMenuContext)
    const { username, isUserAdmin } = useAuth()

    const params = useLocation()
    const isShowHeader = (params.pathname === '/users' || params.pathname === '/products')

    // ---------------- Notifications ----------------
    const [isOpen, setIsOpen] = useState(false);
    const notifRef = useRef(null);
    const [alerts, setAlerts] = useState([])
    const { sensorsAlert } = useSockets()


    // Persian Date
    moment.loadPersian({ dialect: "persian-modern", usePersianDigits: true });

    const today = moment(); // تاریخ امروز
    const dayName = today.format("dddd"); // نام روز هفته (مثلاً شنبه)
    const dateStr = today.format("jYYYY/jMM/jDD"); // تاریخ شمسی


    //!  بستن با کلیک بیرون  !//
    useEffect(() => {
        const handleClickOutside = (e) => {
            // بررسی کردیم آیا کلیک خارج از محدوده‌ی نوتیف بوده یا نه
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getInitAlerts = async () => {
        try {
            const res = await axios.get(`${url}/api/alerts`);
            const dbAlerts = Array.isArray(res.data.alerts) ? res.data.alerts.slice(0, 20) : [];

            console.log('Header', res);

            setAlerts(dbAlerts);
        } catch (err) {
            console.error("Error fetching alerts:", err);
        }
    };

    // Get first 20 Alerts on Mounting
    // useEffect(() => {
    //     getInitAlerts()
    // }, [])


    useEffect(() => {
        if (sensorsAlert.length > 0) {
            setAlerts(prev => {
                const newAlerts = sensorsAlert.filter(alert =>
                    !prev.some(a => a.timestamp === alert.timestamp && a.deviceId === alert.deviceId)
                );
                return [...newAlerts, ...prev];
            });
        }
    }, [sensorsAlert]);

    //* useEffect(() => {
    //*     if (sensorsAlert.length > 0) {
    //*         const latestSensorsAlert = sensorsAlert[sensorsAlert.length - 1];
    //*         setAlerts(prev => {
    //*             const exists = prev.some(a => a.timestamp === latestSensorsAlert.timestamp && a.deviceId === latestSensorsAlert.deviceId);
    //*             if (exists) return prev;
    //*             return [latestSensorsAlert, ...prev];
    //*         });
    //*     }
    //* }, [sensorsAlert]);



    return (
        <header className="header">
            {/* ---------- Hamburger Menu ---------- */}
            <div className="mobile-menu-wrapper" onClick={mobileMenuClickHandler}>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
            </div>

            {/* ---------- Admin Profile ---------- */}
            <div className="admin-profile">
                <img src="/images/user.webp" alt="Admin Profile" />
                <div>
                    <h1>{username}</h1>
                    <h3>{isUserAdmin ? "ادمین" : "کاربر"}</h3>
                </div>
            </div>

            {/* ---------- Left Section ---------- */}
            <div className="header-left-section">
                {/* ---------- Notifications ---------- */}
                <div className="notification-wrapper" ref={notifRef}>
                    <div
                        className="notification-icon"
                        onClick={() => setIsOpen(!isOpen)}
                        title="نوتیفیکیشن‌ها"
                    >
                        <NotificationsNoneOutlinedIcon
                            style={{
                                fontSize: "26px",
                                color: theme === "dark" ? "#fff" : "#333",
                            }}
                        />
                        {alerts.length > 0 && (
                            <span className="notification-badge">{alerts.length}</span>
                        )}
                    </div>

                    {isOpen && (
                        <div className="notification-box">
                            <div className="notification-header">نوتیفیکیشن‌ها</div>

                            {alerts.length > 0 ? (
                                <ul className="notification-list">
                                    {alerts.map((notif) => (
                                        <li
                                            key={notif._id}
                                            className={`notification-item ${notif.level === "Danger"
                                                ? "danger"
                                                : notif.level === "Warning"
                                                    ? "warning"
                                                    : "info"
                                                }`}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <div className="notif-icon">
                                                {notif.level === "Danger" ? (
                                                    <ErrorOutlineIcon style={{ color: "#ff4c4c" }} />
                                                ) : notif.level === "Warning" ? (
                                                    <WarningAmberIcon style={{ color: "#f8b84e" }} />
                                                ) : (
                                                    <InfoOutlinedIcon style={{ color: "#4ea3ff" }} />
                                                )}
                                            </div>

                                            <div className="notif-content">
                                                <p className="notif-message">{notif.message}</p>
                                                <div className="notif-details">
                                                    <p>دستگاه: {notif.deviceId}</p>
                                                    <p>
                                                        {moment(notif?.timestamp).format("jYYYY/jMM/jDD HH:mm:ss")}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="no-notifications">
                                    هیچ نوتیفیکیشنی وجود ندارد
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ---------- Search ---------- */}
                {isShowHeader && <Search />}

                {/* ---------- Date ---------- */}
                <div className="header-left-icon header-date">
                    <div style={{ padding: "10px", textAlign: "center", fontWeight: "bold", }}>
                        {dayName} , {dateStr}
                    </div>
                </div>

                {/* ---------- Theme Toggle ---------- */}
                <button className="header-left-icon header-theme" onClick={toggleTheme}>
                    {theme === "light" ? (
                        <BedtimeOutlinedIcon />
                    ) : (
                        <WbSunnyOutlinedIcon />
                    )}
                </button>
            </div>
        </header>
    );
}
