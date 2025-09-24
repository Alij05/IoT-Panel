import { Outlet, useLocation } from 'react-router-dom'
import Login from '../Components/Login/Login'
import Register from '../Components/Register/Register'
import { useEffect } from 'react'

export default function AuthLayout() {
    let location = useLocation()

    useEffect(() => {
        document.body.className = 'auth-body';
    }, [])

    return (
        <>
            {/* {location.pathname === '/login' ? (<Login />) : (<Register />)} */}
            <Outlet />
        </>
    )
}
