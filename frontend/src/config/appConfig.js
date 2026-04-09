export const APP_CONFIG = {
    backendUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:5001",
    socketUrl: process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5001",
    typebotId: process.env.REACT_APP_TYPEBOT_ID || "customer-support-5n1p09i",
};