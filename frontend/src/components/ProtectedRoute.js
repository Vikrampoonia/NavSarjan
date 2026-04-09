import React from "react";
import { Navigate } from "react-router-dom";
import { getAuthToken, getStoredUser } from "../utils/authSession";

const normalizeRole = (role) => String(role || "").trim().toLowerCase();

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    // Always read latest auth state to avoid stale role checks after same-tab login/logout.
    const token = getAuthToken();
    const userRole = normalizeRole(getStoredUser()?.role);

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
