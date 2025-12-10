import React, { useContext, useState } from "react";
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BuildIcon from '@mui/icons-material/Build';
import AddIcCallIcon from '@mui/icons-material/AddIcCall';
import EdgesensorHighIcon from '@mui/icons-material/EdgesensorHigh';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SecurityIcon from '@mui/icons-material/Security';
import "./Sidebar.css";
import { Link, NavLink } from "react-router-dom";
import { MobileMenuContext } from "../../Contexts/MobileMenuContext";
import { useAuth } from "../../Contexts/AuthContext";
import DeleteModal from "../DeleteModal/DeleteModal";

export default function Sidebar() {

  const { isShowSidebar, mobileMenuClickHandler } = useContext(MobileMenuContext)
  const [isShowDeleteModal, setIsShowDeleteModal] = useState(false)

  const { isUserAdmin, logout } = useAuth()

  const logoutHandler = () => {
    logout()
  }

  const closeDeleteModal = () => {
    setIsShowDeleteModal(false)
  }

  return (
    <>
      <div className={`sidebar ${isShowSidebar && 'sidebar-active'}`}>
        <div className={`sidebar-icon ${isShowSidebar && 'sidebar-icon-active'}`} onClick={mobileMenuClickHandler}>X</div>
        <h1 className="sidebar-title">به داشبورد خوش آمدید</h1>

        <ul className="sidebar-links">
          <li>
            <NavLink to="/home" className={({ isActive }) => isActive ? "link active" : "link"} onClick={() => {
              isShowSidebar && mobileMenuClickHandler()
            }}>
              <HomeRoundedIcon className="icon" />
              صفحه اصلی
            </NavLink>
          </li>
          {isUserAdmin &&
            <>
              <li>
                <NavLink to="/users" className={({ isActive }) => isActive ? "link active" : "link"} onClick={() => {
                  isShowSidebar && mobileMenuClickHandler()
                }}>
                  <PeopleAltIcon className="icon" />
                  کاربران
                </NavLink>
              </li>
              <li>
                <NavLink to="/add-user" className={({ isActive }) => isActive ? "link active" : "link"} onClick={() => {
                  isShowSidebar && mobileMenuClickHandler()
                }}>
                  <PersonAddAltRoundedIcon className="icon" />
                  افزودن کاربر
                </NavLink>
              </li>
            </>
          }
          <li>
            <NavLink to="/products" className={({ isActive }) => isActive ? "link active" : "link"} onClick={() => {
              isShowSidebar && mobileMenuClickHandler()
            }}>
              <EdgesensorHighIcon className="icon" />
              دستگاه ها
            </NavLink>
          </li>
          <li>
            <NavLink to="/add-phone" className={({ isActive }) => isActive ? "link active" : "link"} onClick={() => {
              isShowSidebar && mobileMenuClickHandler()
            }}>
              <AddIcCallIcon className="icon" />
              ثبت شماره
            </NavLink>
          </li>
          <li>
            <NavLink to="/add-product" className={({ isActive }) => isActive ? "link active" : "link"} onClick={() => {
              isShowSidebar && mobileMenuClickHandler()
            }}>
              <QrCodeScannerRoundedIcon className="icon" />
              ثبت دستگاه
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports" className={({ isActive }) => isActive ? "link active" : "link"} onClick={() => {
              isShowSidebar && mobileMenuClickHandler()
            }}>
              <AssessmentIcon className="icon" />
              گزارش ها
            </NavLink>
          </li>
          <li>
            <NavLink to="/notifs" className={({ isActive }) => isActive ? "link active" : "link"} onClick={() => {
              isShowSidebar && mobileMenuClickHandler()
            }}>
              <NotificationsNoneOutlinedIcon className="icon" />
              اعلان ها
            </NavLink>
          </li>
          <li>
            <NavLink to="/support" className={({ isActive }) => isActive ? "link active" : "link"} onClick={() => {
              isShowSidebar && mobileMenuClickHandler()
            }}>
              <SupportAgentIcon className="icon" />
              پشتیبانی
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className={({ isActive }) => isActive ? "link active" : "link"} onClick={() => {
              isShowSidebar && mobileMenuClickHandler()
            }}>
              <SecurityIcon className="icon" />
              تنظیمات امنیتی
            </NavLink>
          </li>
          <li>
            <div className="link" style={{ cursor: 'pointer' }} onClick={() => {
              setIsShowDeleteModal(true)
            }}>
              <LogoutIcon className="icon" />
              خروج
            </div>
          </li>
        </ul>
        <div className="sidebar-link-container">
          <img
            src="/images/pars-pardaz.png"
            alt="Pardaz Logo"
            style={{ width: '35px', height: '35px', display: 'block', borderRadius: '15px' }}
          />
          <a
            href="https://pars-pardaz.com/"
            className="sidebar-link"
            target="_blank"
          >
            شرکت پارس پرداز (v1.1.0)
          </a>
        </div>
      </div>

      {isShowDeleteModal && (<DeleteModal closeModal={closeDeleteModal} submitModal={logoutHandler} msg="آیا میخواهید از حساب خود خارج شوید؟" />)}
    </>
  );
}
