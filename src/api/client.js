/**
 * API Client Configuration
 * 
 * This file configures the Axios HTTP client for the Driver App.
 * It sets up base URLs, request/response interceptors, and error handling.
 * 
 * Features:
 * - Base URL configuration for different environments
 * - Request interceptors for authentication headers
 * - Response interceptors for error handling
 * - OAuth token management
 * - Centralized error handling
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Environment Configuration
 * 
 * Configure different API endpoints for various environments.
 * Change the current environment here to switch between dev/staging/prod.
 */
const ENVIRONMENTS = {
  development: 'https://devtrans.transend.ca/api',
  staging: 'https://stagingapi.transend.ca/api',
  production: 'https://api.transend.ca/api'
};

// Set current environment - change this for different builds
const CURRENT_ENVIRONMENT = 'development';

/**
 * API Client Instance
 * 
 * Creates the main Axios instance with base configuration.
 * All API calls throughout the app will use this configured client.
 */
const apiClient = axios.create({
  baseURL: ENVIRONMENTS[CURRENT_ENVIRONMENT],
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    // Add any required authentication headers if needed
  },
});

/**
 * Authentication Token Storage
 * 
 * Tokens are stored in AsyncStorage for persistence across app restarts.
 * The auth service manages token lifecycle and refresh.
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@access_token',
};

/**
 * Get stored authentication token
 * 
 * @returns {Promise<string|null>} Access token or null
 */
const getStoredToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Error getting stored token:', error);
    return null;
  }
};

/**
 * Set Authentication Token
 * 
 * Sets the authentication token that will be included in all API requests.
 * Call this after successful login to authenticate subsequent requests.
 * 
 * @param {string} token - JWT token from OAuth response
 */
export const setAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
};

/**
 * Clear Authentication Token
 * 
 * Removes the authentication token. Call this on logout.
 */
export const clearAuthToken = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
};

/**
 * Request Interceptor
 * 
 * Automatically adds authentication headers and other common headers
 * to all outgoing requests. Handles OAuth token authentication.
 */
apiClient.interceptors.request.use(
  async (config) => {
    // Add authentication token if available
    const token = await getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add any additional headers needed by the API
    config.headers['X-Requested-With'] = 'XMLHttpRequest';

    // Log request in development
    if (__DEV__) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        headers: {
          ...config.headers,
          Authorization: token ? 'Bearer [TOKEN]' : 'Not set', // Don't log actual token
        },
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * Handles responses and errors globally before they reach individual API calls.
 * Provides consistent error handling and response formatting.
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (__DEV__) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    // Log errors in development
    if (__DEV__) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          clearAuthToken();
          // In a real app, you might dispatch a logout action here
          console.warn('🔐 Authentication expired. Please log in again.');
          break;

        case 403:
          // Forbidden
          console.warn('🚫 Access denied. Insufficient permissions.');
          break;

        case 404:
          // Not found
          console.warn('📭 Resource not found.');
          break;

        case 500:
          // Server error
          console.error('🔧 Server error. Please try again later.');
          break;

        default:
          console.error(`🔴 HTTP Error ${status}:`, data?.message || error.message);
      }

      // Return a consistent error format
      return Promise.reject({
        status,
        message: data?.message || `HTTP Error ${status}`,
        data: data?.data || null,
        originalError: error,
      });
    } else if (error.request) {
      // Network error - no response received
      console.error('🌐 Network Error:', error.message);
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your internet connection.',
        data: null,
        originalError: error,
      });
    } else {
      // Something else happened
      console.error('⚠️ Request Setup Error:', error.message);
      return Promise.reject({
        status: -1,
        message: error.message || 'An unexpected error occurred',
        data: null,
        originalError: error,
      });
    }
  }
);

/**
 * API Response Helper
 * 
 * Standardizes API response handling across the app.
 * Extracts the data portion and handles the standard API response format.
 * 
 * @param {Promise} apiCall - The Axios promise to wrap
 * @returns {Promise<Object>} Standardized response object
 */
export const handleApiResponse = async (apiCall) => {
  try {
    const response = await apiCall;
    
    // Check if response data is HTML (indicates 404 or server error)
    if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
      console.warn('API returned HTML instead of JSON - endpoint may not exist');
      return {
        success: false,
        message: 'API endpoint not available',
        data: null,
        error: 'HTML_RESPONSE',
      };
    }
    
    // The API returns responses in format: { success: boolean, message: string, data: any }
    const { data } = response;
    
    if (data.success) {
      return {
        success: true,
        message: data.message,
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Operation failed',
        data: data.data || null,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || 'An error occurred',
      data: null,
      error: error,
    };
  }
};

/**
 * File Upload Helper
 * 
 * Creates a FormData object for file uploads.
 * Used by document upload APIs.
 * 
 * @param {Object} files - Object with file fields and their File objects
 * @param {Object} additionalData - Additional form fields to include
 * @returns {FormData} Ready-to-send FormData object
 */
export const createFormData = (files = {}, additionalData = {}) => {
  const formData = new FormData();
  
  // Add files
  Object.keys(files).forEach(key => {
    if (files[key]) {
      formData.append(key, files[key]);
    }
  });
  
  // Add additional data
  Object.keys(additionalData).forEach(key => {
    if (additionalData[key] !== null && additionalData[key] !== undefined) {
      formData.append(key, additionalData[key]);
    }
  });
  
  return formData;
};

export default apiClient;
