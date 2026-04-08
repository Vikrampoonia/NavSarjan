import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAuthToken } from "../utils/authSession";

const ProtectedRoute = ({ children }) => {
    const [token, setToken] = useState(getAuthToken());

    useEffect(() => {
        const handleStorageChange = () => {
            setToken(getAuthToken());
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    if (!token) {
        return <Navigate to="/sign-page" replace />;
    }

    return children;
};

export default ProtectedRoute;
