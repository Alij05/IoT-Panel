import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import { isAdmin } from '../../Utils';

export default function PrivateRoute({ children, adminOnly = false }) {
    const { isUserLoggedIn, loading, isUserAdmin } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div
                style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5", fontSize: "32px", fontWeight: "bold", color: "var(--blue)", zIndex: 9999, flexDirection: "column", }}>
                <div style={{ width: "60px", height: "60px", border: "6px solid #ccc", borderTop: "6px solid #26c6da", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "20px", }}></div>
                در حال بررسی ورود...
                <style>
                    {`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
                }
                `}
                </style>
            </div>
        )

    }

    if (!isUserLoggedIn) {
        return <Navigate to='/login' state={{ from: location }} replace />;
    }

    if (adminOnly && !isUserAdmin) {
        return (
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", zIndex: 9999, }}>
                <img src="./images/forbidden.png" alt="forbidden" style={{ width: 120, height: 120, marginBottom: 20 }} />
                <h1 style={{ color: "red", fontSize: "36px", margin: 0 }}>
                    دسترسی غیر مجاز
                </h1>
            </div>

        );
    }

    return children;
}
