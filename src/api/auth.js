/**
 * Authentication Service
 * 
 * Handles OAuth token authentication for the driver app.
 * Manages login, token storage, and automatic token refresh.
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Constants from 'expo-constants';

// Create separate client for auth endpoints (no /api prefix)
// Uses environment variables with fallback to defaults
const authBaseURL = Constants.expoConfig?.extra?.oauthBaseUrl || 'https://devtrans.transend.ca';

const authClient = axios.create({
  baseURL: authBaseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

const AUTH_ENDPOINTS = {
  TOKEN: '/oauth/token',
};

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@access_token',
  REFRESH_TOKEN: '@refresh_token', 
  TOKEN_EXPIRY: '@token_expiry',
};

const AUTH_CONFIG = {
  CLIENT_ID: Constants.expoConfig?.extra?.oauthClientId || '3',
  CLIENT_SECRET: Constants.expoConfig?.extra?.oauthClientSecret || 'AB4am1uiyOlqxwfy87LeArGcvezXQe8um2TR2a31',
  DEFAULT_USERNAME: Constants.expoConfig?.extra?.defaultUsername || 'driver@transend.ca',
  DEFAULT_PASSWORD: Constants.expoConfig?.extra?.defaultPassword || 'driver@123',
  SCOPE: '*',
};

/**
 * Authentication Service Class
 */
export const authService = {
  /**
   * Login with username and password
   * 
   * @param {string} username - Driver username
   * @param {string} password - Driver password
   * @returns {Promise<Object>} Authentication response
   */
  login: async function(username = AUTH_CONFIG.DEFAULT_USERNAME, password = AUTH_CONFIG.DEFAULT_PASSWORD) {
    try {
      const response = await authClient.post(AUTH_ENDPOINTS.TOKEN, {
        grant_type: 'password',
        client_id: AUTH_CONFIG.CLIENT_ID,
        client_secret: AUTH_CONFIG.CLIENT_SECRET,
        username,
        password,
        scope: AUTH_CONFIG.SCOPE,
      });

      if (response.data.access_token) {
        const { access_token, refresh_token, expires_in } = response.data;
        
        // Calculate expiry time
        const expiryTime = Date.now() + (expires_in * 1000);
        
        // Store tokens
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token),
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token),
          AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString()),
        ]);

        return {
          success: true,
          message: 'Login successful',
          data: {
            access_token,
            refresh_token,
            expires_in,
          },
        };
      }

      return {
        success: false,
        message: 'Invalid response from server',
        data: null,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        data: null,
      };
    }
  },

  /**
   * Get stored access token
   * 
   * @returns {Promise<string|null>} Access token or null
   */
  getAccessToken: async function() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const expiryTime = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

      if (!token || !expiryTime) {
        return null;
      }

      // Check if token is expired
      if (Date.now() >= parseInt(expiryTime)) {
        console.log('Token expired, attempting refresh...');
        const refreshResult = await authService.refreshToken();
        if (refreshResult.success) {
          return refreshResult.data.access_token;
        }
        return null;
      }

      return token;
    } catch (error) {
      console.error('Get access token error:', error);
      return null;
    }
  },

  /**
   * Refresh access token using refresh token
   * 
   * @returns {Promise<Object>} Refresh response
   */
  refreshToken: async function() {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) {
        return {
          success: false,
          message: 'No refresh token available',
          data: null,
        };
      }

      const response = await authClient.post(AUTH_ENDPOINTS.TOKEN, {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: AUTH_CONFIG.CLIENT_ID,
        client_secret: AUTH_CONFIG.CLIENT_SECRET,
        scope: AUTH_CONFIG.SCOPE,
      });

      if (response.data.access_token) {
        const { access_token, refresh_token, expires_in } = response.data;
        
        // Calculate expiry time
        const expiryTime = Date.now() + (expires_in * 1000);
        
        // Store new tokens
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token),
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token),
          AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString()),
        ]);

        return {
          success: true,
          message: 'Token refreshed successfully',
          data: {
            access_token,
            refresh_token,
            expires_in,
          },
        };
      }

      return {
        success: false,
        message: 'Invalid refresh response',
        data: null,
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      // Clear stored tokens if refresh fails
      await authService.logout();
      return {
        success: false,
        message: error.response?.data?.message || 'Token refresh failed',
        data: null,
      };
    }
  },

  /**
   * Logout and clear stored tokens
   * 
   * @returns {Promise<void>}
   */
  logout: async function() {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY),
      ]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  /**
   * Check if user is authenticated
   * 
   * @returns {Promise<boolean>} Authentication status
   */
  isAuthenticated: async function() {
    const token = await this.getAccessToken();
    return !!token;
  },

  /**
   * Auto-login on app start
   * 
   * @returns {Promise<boolean>} Success status
   */
  autoLogin: async function() {
    try {
      // Check if we have valid tokens
      const isAuth = await this.isAuthenticated();
      
      if (isAuth) {
        console.log('User already authenticated');
        return true;
      }

      // Attempt login with default credentials
      console.log('Attempting auto-login...');
      const loginResult = await this.login();
      
      if (loginResult.success) {
        console.log('Auto-login successful');
        return true;
      }

      console.log('Auto-login failed:', loginResult.message);
      return false;
    } catch (error) {
      console.error('Auto-login error:', error);
      return false;
    }
  },
};

export default authService;