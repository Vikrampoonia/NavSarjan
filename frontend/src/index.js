import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Bubble } from '@typebot.io/react';
import { clearAuthSession, getAuthToken, getRefreshToken, setAuthSession } from './utils/authSession';

const BACKEND_BASE_URL = 'http://localhost:5001';

const isBackendRequest = (url = '') => url.includes('localhost:5001');
const isAuthBootstrapEndpoint = (url = '') =>
  url.includes('/api/login') ||
  url.includes('/api/register') ||
  url.includes('/api/refresh');

let refreshPromise = null;

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  const response = await axios.post(`${BACKEND_BASE_URL}/api/refresh`, { refreshToken });

  if (!response?.data?.success || !response?.data?.token) {
    throw new Error('Failed to refresh token');
  }

  setAuthSession({
    token: response.data.token,
    refreshToken: response.data.refreshToken,
    user: response.data.data,
  });

  return response.data.token;
};

axios.interceptors.request.use((config) => {
  const token = getAuthToken();
  const requestUrl = config?.url || '';
  const backendRequest = isBackendRequest(requestUrl);

  if (token && backendRequest) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;
    const requestUrl = originalRequest?.url || '';

    if (!originalRequest || status !== 401 || originalRequest._retry || !isBackendRequest(requestUrl) || isAuthBootstrapEndpoint(requestUrl)) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken();
      }

      const nextAccessToken = await refreshPromise;
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      return axios(originalRequest);
    } catch (refreshError) {
      clearAuthSession();
      window.location.assign('/sign-page');
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Bubble
      typebot="customer-support-5n1p09i"
      theme={{ button: { backgroundColor: "#0042DA" } }}
    />
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
