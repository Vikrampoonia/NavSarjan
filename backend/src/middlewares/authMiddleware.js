import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/messages.js";
import { ApiError } from "../utils/ApiError.js";

const extractTokenFromRequest = (req) => {
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    return headerToken || req.headers?.["x-access-token"] || req.query?.token || null;
};

const extractTokenFromSocket = (socket) => {
    const authToken = socket.handshake?.auth?.token;
    if (authToken) {
        return authToken;
    }

    const authHeader = socket.handshake?.headers?.authorization;
    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.slice(7);
    }

    return null;
};

export const buildAuthMiddleware = ({ authService }) => {
    const requireAuth = (req, _res, next) => {
        const token = extractTokenFromRequest(req);

        if (!token) {
            return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.AUTH.TOKEN_REQUIRED));
        }

        const verification = authService.verifyToken(token);
        if (!verification.ok) {
            return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.AUTH.INVALID_TOKEN));
        }

        req.user = verification.user;
        return next();
    };

    const requireSocketAuth = (socket, next) => {
        const token = extractTokenFromSocket(socket);

        if (!token) {
            return next(new Error(MESSAGES.AUTH.TOKEN_REQUIRED));
        }

        const verification = authService.verifyToken(token);
        if (!verification.ok) {
            return next(new Error(MESSAGES.AUTH.INVALID_TOKEN));
        }

        socket.user = verification.user;
        return next();
    };

    return {
        requireAuth,
        requireSocketAuth,
    };
};
