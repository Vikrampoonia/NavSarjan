import axios from "axios";
import { APP_CONFIG } from "../config/appConfig";
import { API_ROUTES } from "../constants/apiRoutes";

const buildUrl = (path) => `${APP_CONFIG.backendUrl}${path}`;

const unwrap = (response) => response.data;

export const loginUser = async ({ email, password }) => unwrap(await axios.post(buildUrl(API_ROUTES.auth.login), { email, password }));

export const registerUser = async (payload) => unwrap(await axios.post(buildUrl(API_ROUTES.auth.register), payload));

export const registerFreeAccount = async (payload) => unwrap(await axios.post(buildUrl(API_ROUTES.auth.registerFree), payload));

export const forgotPassword = async (email) => unwrap(await axios.post(buildUrl(API_ROUTES.auth.forgotPassword), { email }));

export const resetPassword = async ({ email, resetToken, newPassword }) =>
    unwrap(await axios.post(buildUrl(API_ROUTES.auth.resetPassword), { email, resetToken, newPassword }));

export const refreshAuthToken = async (refreshToken) => unwrap(await axios.post(buildUrl(API_ROUTES.auth.refresh), { refreshToken }));

export const logoutUser = async (refreshToken) => unwrap(await axios.post(buildUrl(API_ROUTES.auth.logout), { refreshToken }));

export const insertDocument = async ({ collectionName, data }) => unwrap(await axios.post(buildUrl(API_ROUTES.data.insert), { collectionName, data }));

export const fetchDocuments = async ({
    collectionName,
    condition = {},
    projection = {},
    searchText = "",
    filters = {},
    metrics = {},
    page,
    pageSize,
}) =>
    unwrap(await axios.post(buildUrl(API_ROUTES.data.fetch), {
        collectionName,
        condition,
        projection,
        searchText,
        filters,
        metrics,
        page,
        pageSize,
    }));

export const fetchDocument = async ({ collectionName, condition = {}, projection = {} }) => unwrap(await axios.post(buildUrl(API_ROUTES.data.fetchOne), { collectionName, condition, projection }));

export const replaceDocument = async ({ collectionName, condition, data }) => unwrap(await axios.post(buildUrl(API_ROUTES.data.replace), { collectionName, condition, data }));

export const investInEntity = async ({ collectionName, entityId, amount }) =>
    unwrap(await axios.post(buildUrl(API_ROUTES.data.invest), { collectionName, entityId, amount }));

export const getChatContacts = async (user) => unwrap(await axios.get(buildUrl(API_ROUTES.chat.contacts), { params: { user } }));

export const getChatMessages = async ({ from, to }) => unwrap(await axios.get(buildUrl(API_ROUTES.chat.messages), { params: { from, to } }));

export const markChatReadStatus = async (contact) => unwrap(await axios.post(buildUrl(API_ROUTES.chat.readStatus), { params: { contact } }));

export const getNotifications = async (user) => unwrap(await axios.get(buildUrl(API_ROUTES.chat.notifications), { params: { user } }));

export const removeNotification = async ({ source, priority, user }) => unwrap(await axios.post(buildUrl(API_ROUTES.chat.removeNotification), { params: { source, priority, user } }));