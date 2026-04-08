export const MESSAGES = {
    VALIDATION: {
        EMAIL_PASSWORD_REQUIRED: "Email and password are required",
        ALL_FIELDS_REQUIRED: "All fields are required",
        COLLECTION_REQUIRED: "Collection name is required",
        MISSING_COLLECTION_OR_DATA: "Missing collection name or data",
        INVALID_INPUT: "Invalid input.",
    },
    AUTH: {
        LOGIN_SUCCESS: "Login successful",
        USER_NOT_FOUND: "User not found",
        INVALID_PASSWORD: "Invalid password",
        EMAIL_EXISTS: "Email already exists",
        ACCOUNT_CREATED: "Account created successfully!",
        TOKEN_REQUIRED: "Authentication token is required",
        INVALID_TOKEN: "Authentication token is invalid or expired",
        REFRESH_SUCCESS: "Token refreshed successfully",
        LOGOUT_SUCCESS: "Logged out successfully",
        REFRESH_TOKEN_REQUIRED: "Refresh token is required",
    },
    CRUD: {
        INSERT_SUCCESS: "Data inserted successfully",
        FETCH_FAILED: "Failed to fetch data",
        INSERT_FAILED: "Failed to insert data",
        REPLACE_SUCCESS: "Document replaced successfully.",
        NOT_FOUND: "Document not found.",
    },
    GENERAL: {
        INTERNAL_SERVER_ERROR: "Internal server error",
        SERVER_ERROR: "Server error.",
        API_RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later.",
        AUTH_RATE_LIMIT_EXCEEDED: "Too many authentication attempts. Please try again later.",
    },
};
