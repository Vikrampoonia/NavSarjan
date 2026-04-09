export const API_ROUTES = {
    auth: {
        login: "/api/login",
        register: "/api/register",
        registerFree: "/api/register/free",
        forgotPassword: "/api/forgot-password",
        resetPassword: "/api/reset-password",
        refresh: "/api/refresh",
        logout: "/api/logout",
    },
    data: {
        insert: "/api/insert",
        fetch: "/api/fetch",
        fetchOne: "/api/fetchone",
        replace: "/api/replace",
        invest: "/api/invest",
    },
    chat: {
        contacts: "/home/chat/contact",
        messages: "/home/chat/message",
        readStatus: "/home/chat/readStatus",
        notifications: "/home/notification",
        removeNotification: "/home/chat/removeNotify",
    },
};