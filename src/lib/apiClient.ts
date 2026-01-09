/**
 * Axios API client with automatic token management and error handling
 */

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokenStorage';
import { ApiError, handleApiError } from './apiErrors';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});

/**
 * Request interceptor - Add auth token to requests
 */
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenStorage.getToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor - Handle errors globally
 */
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        // Handle 401 Unauthorized - clear token and redirect to login
        if (error.response?.status === 401) {
            tokenStorage.removeToken();
            // Could dispatch an event here to trigger login modal
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }

        // Create ApiError with user-friendly message
        const message = handleApiError(error);
        const apiError = new ApiError(
            message,
            error.response?.status,
            error.response?.data
        );

        return Promise.reject(apiError);
    }
);

export default apiClient;
