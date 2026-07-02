/**
 * @file api.ts
 * @description Centralized Axios instance for communicating with the LifeLink Backend.
 */

import axios from 'axios';

// Create a configured Axios instance
const api = axios.create({
  // The backend URL is explicitly configured. In a real app, use import.meta.env.VITE_API_URL
  baseURL: 'http://localhost:5000/api/v1',
  
  // CRITICAL: This allows Axios to send and receive HTTP-Only cookies (our refresh token)
  // across different origins (e.g., frontend on port 5173, backend on port 5000).
  withCredentials: true,
  
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request Interceptor
 * 
 * Automatically attaches the Access Token to every outgoing request.
 * We store the access token in memory (or localStorage) after login.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * 
 * Automatically handles 401 Unauthorized errors by attempting to refresh the token.
 * If the refresh token is expired/invalid, it logs the user out.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't already retried this request
    // AND the request wasn't an attempt to login (we don't want to refresh on bad password)
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to hit the refresh endpoint. 
        // The HTTP-only cookie is sent automatically because of `withCredentials`.
        const response = await axios.post(
          'http://localhost:5000/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );

        // Success! Save the new access token
        const newAccessToken = response.data.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);

        // Update the failed request with the new token and retry it
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed (token expired or invalid). Log out entirely.
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        
        // Redirect to login (In React, you'd typically handle this via Context or events, 
        // but a hard reload to /login works as a simple fallback)
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
