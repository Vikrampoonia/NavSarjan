import { APP_CONFIG } from "../config/appConfig";
import { logoutUser } from "../services/backendApi";
const TOKEN_KEY = "navsarjan_token";
const REFRESH_TOKEN_KEY = "navsarjan_refresh_token";
const USER_KEY = "navsarjan_user";

const BACKEND_BASE_URL = APP_CONFIG.backendUrl;

export const setAuthSession = ({ token, refreshToken, user }) => {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    }

    if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
};

export const clearAuthSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const getStoredUser = () => {
    const rawUser = localStorage.getItem(USER_KEY);
    if (!rawUser) {
        return {};
    }

    try {
        return JSON.parse(rawUser);
    } catch (_error) {
        return {};
    }
};

export const performLogout = async () => {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
        try {
            await logoutUser(refreshToken);
        } catch (_error) {
            // Ignore network/logout errors and always clear local session.
        }
    }

    clearAuthSession();
};
