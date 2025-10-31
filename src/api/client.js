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
import Constants from 'expo-constants';
import { logApiError, logNetworkError, getUserFriendlyMessage, ERROR_CATEGORIES } from '../utils/errorLogger';

/**
 * Environment Configuration
 * 
 * Configure different API endpoints for various environments.
 * Uses environment variables from Constants with fallback to defaults.
 */

const ENVIRONMENTS = {
  development: Constants.expoConfig?.extra?.apiBaseUrlDev || 'https://devtrans.transend.ca/api',
  staging: Constants.expoConfig?.extra?.apiBaseUrlStaging || 'https://stagingapi.transend.ca/api',
  production: Constants.expoConfig?.extra?.apiBaseUrlProd || 'https://api.transend.ca/api'
};

// Set current environment - uses Constants or defaults to development
const CURRENT_ENVIRONMENT = Constants.expoConfig?.extra?.currentEnvironment || 'development';

/**
 * API Client Instance
 * 
 * Creates the main Axios instance with base configuration.
 * All API calls throughout the app will use this configured client.
 */
const apiClient = axios.create({
  baseURL: ENVIRONMENTS[CURRENT_ENVIRONMENT],
  timeout: 60000, // 60 second timeout (increased for slower networks)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    // Add any required authentication headers if needed
  },
  maxContentLength: Infinity, // Allow large responses
  maxBodyLength: Infinity, // Allow large request bodies (for file uploads)
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
    
    // Don't set Content-Type for FormData - let React Native set it with boundary
    // This is critical for file uploads in React Native
    if (config.data instanceof FormData) {
      // Remove Content-Type header completely - React Native will set it with boundary
      delete config.headers['Content-Type'];
      delete config.headers['content-type']; // Also remove lowercase version
      
      // For file uploads, Accept header should allow any content type
      // Don't restrict to application/json as server may return different content types
      if (config.headers['Accept'] === 'application/json') {
        config.headers['Accept'] = '*/*'; // Allow any response type for file uploads
      }
      
      // For React Native, we rely on the platform to set Content-Type with boundary
      console.log('FormData detected - Content-Type removed, Accept set to */*');
    }

    // Log request in development
    if (__DEV__) {
      // For FormData, don't try to log the data as it's not serializable
      const logData = config.data instanceof FormData 
        ? `[FormData with ${config.data._parts?.length || 0} parts]`
        : config.data;
      
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        headers: {
          ...config.headers,
          Authorization: token ? 'Bearer [TOKEN]' : 'Not set', // Don't log actual token
        },
        data: logData,
        timeout: config.timeout,
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
    const url = error.config?.url || 'unknown';
    const method = error.config?.method?.toUpperCase() || 'GET';
    const request = {
      method,
      body: error.config?.data,
      params: error.config?.params,
    };

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Log API error with structured logging
      logApiError(
        url,
        request,
        { status, data },
        error,
        {
          timestamp: new Date().toISOString(),
        }
      );

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          clearAuthToken();
          break;
        case 403:
          // Forbidden
          break;
        case 404:
          // Not found
          break;
        case 500:
          // Server error
          break;
        default:
          // Other HTTP errors
          break;
      }

      // Return a consistent error format with user-friendly message
      return Promise.reject({
        status,
        message: getUserFriendlyMessage(data?.message || `HTTP Error ${status}`, `Request failed (${status})`),
        data: data?.data || null,
        originalError: error,
        category: ERROR_CATEGORIES.API,
      });
    } else if (error.request) {
      // Network error - no response received
      logNetworkError(url, error, {
        method,
        timeout: error.config?.timeout,
      });

      // Check if it's a timeout
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return Promise.reject({
          status: 0,
          message: getUserFriendlyMessage(error, 'Request timeout. The server is taking too long to respond.'),
          data: null,
          originalError: error,
          category: ERROR_CATEGORIES.NETWORK,
        });
      }
      
      // Return user-friendly network error message
      return Promise.reject({
        status: 0,
        message: getUserFriendlyMessage(error, 'Network error. Please check your internet connection.'),
        data: null,
        originalError: error,
        category: ERROR_CATEGORIES.NETWORK,
      });
    } else {
      // Something else happened
      logApiError(url, request, null, error, {
        type: 'request_setup_error',
      });

      return Promise.reject({
        status: -1,
        message: getUserFriendlyMessage(error, 'An unexpected error occurred'),
        data: null,
        originalError: error,
        category: ERROR_CATEGORIES.UNKNOWN,
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
    
    console.log('=== handleApiResponse - Processing ===');
    console.log('response.data:', JSON.stringify(data, null, 2));
    console.log('data.success:', data.success);
    console.log('data.data:', data.data);
    console.log('data.data type:', typeof data.data);
    console.log('data.data.counts:', data.data?.counts);
    console.log('data.data.counts type:', typeof data.data?.counts);
    console.log('data.data.counts keys:', data.data?.counts ? Object.keys(data.data.counts) : 'null');
    
    if (data.success) {
      const processed = {
        success: true,
        message: data.message,
        data: data.data,
      };
      console.log('=== handleApiResponse - Returning Success ===');
      console.log('processed:', JSON.stringify(processed, null, 2));
      console.log('processed.data.counts:', processed.data?.counts);
      console.log('=============================================');
      return processed;
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
