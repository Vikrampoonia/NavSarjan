import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAuthToken, getStoredUser } from "../utils/authSession";

const normalizeRole = (role) => String(role || "").trim().toLowerCase();

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const [token, setToken] = useState(getAuthToken());
    const [userRole, setUserRole] = useState(normalizeRole(getStoredUser()?.role));

    useEffect(() => {
        const handleStorageChange = () => {
            setToken(getAuthToken());
            setUserRole(normalizeRole(getStoredUser()?.role));
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    if (!token) {
        return <Navigate to="/sign-page" replace />;
    }

    if (allowedRoles.length > 0) {
        const normalizedAllowedRoles = allowedRoles.map(normalizeRole);
        if (!normalizedAllowedRoles.includes(userRole)) {
            return <Navigate to="/dashboard/projects" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
