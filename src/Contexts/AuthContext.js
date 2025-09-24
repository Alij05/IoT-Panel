import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const url = process.env.REACT_APP_URL

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [username, setUsername] = useState(null);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [isUserAdmin, setIsUserAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkLogin = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setUsername(null);
            setIsUserLoggedIn(false);
            setLoading(false);
            return;
        }
        try {
            const res = await axios.post(
                `${url}/api/auth/homescreen`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data?.isLogin) {
                setUsername(res.data.username); 
                setIsUserLoggedIn(true);
                setIsUserAdmin(res.data.isAdmin)
            } else {
                setUsername(null);
                setIsUserLoggedIn(false);
            }
        } catch (err) {
            setUsername(null);
            setIsUserLoggedIn(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkLogin();
    }, []);

    const login = (token) => {
        localStorage.setItem("token", token);
        checkLogin();
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUsername(null);
        setIsUserLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ username, loading, login, logout, isUserLoggedIn, isUserAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
