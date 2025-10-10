/**
 * API Endpoints Configuration
 * 
 * This file centralizes all API endpoint definitions for the Driver App.
 * It provides a single source of truth for all API URLs and makes it easy
 * to update endpoints across the entire application.
 * 
 * Usage:
 * import { ENDPOINTS } from './endpoints';
 * const url = ENDPOINTS.DRIVER.PROFILE;
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

/**
 * Base API Endpoints
 * 
 * All endpoints are organized by feature/module for better maintainability.
 */
export const ENDPOINTS = {
  /**
   * Driver-related endpoints
   * 
   * All APIs related to driver profile, documents, and status management.
   */
  DRIVER: {
    // Profile management
    PROFILE: '/driver/profile',                    // GET: Get driver profile
    PROFILE_UPDATE: '/driver/profile/update',      // POST: Update driver profile
    
    // Document management
    DOCUMENTS: '/driver/documents',                // GET: Get driver documents (with query params)
    DOCUMENTS_UPDATE: '/driver/documents/update',  // POST: Update driver documents
    
    // Dashboard and job data
    DASHBOARD: '/driver/dashboard',                // GET: Get dashboard data
    
    // Attendance management
    MARK_ABSENT: '/driver/mark-absent',           // POST: Mark driver as absent
  },

  /**
   * Job-related endpoints
   * 
   * APIs for job management, status updates, and job details.
   */
  JOBS: {
    // Job listing and details
    LIST: '/jobs',                                 // GET: Get job list
    DETAILS: '/jobs/{id}',                        // GET: Get job details
    
    // Job status management
    ACCEPT: '/jobs/{id}/accept',                  // POST: Accept a job
    PICKUP: '/jobs/{id}/pickup',                  // POST: Mark job as picked up
    DELIVER: '/jobs/{id}/deliver',                // POST: Mark job as delivered
    CANCEL: '/jobs/{id}/cancel',                  // POST: Cancel a job
  },

  /**
   * Authentication endpoints
   * 
   * APIs for login, logout, and token management.
   */
  AUTH: {
    LOGIN: '/auth/login',                         // POST: Driver login
    LOGOUT: '/auth/logout',                       // POST: Driver logout
    REFRESH: '/auth/refresh',                     // POST: Refresh auth token
    FORGOT_PASSWORD: '/auth/forgot-password',     // POST: Request password reset
    RESET_PASSWORD: '/auth/reset-password',       // POST: Reset password
  },

  /**
   * Notification endpoints
   * 
   * APIs for managing driver notifications.
   */
  NOTIFICATIONS: {
    LIST: '/notifications',                       // GET: Get notifications
    MARK_READ: '/notifications/{id}/read',        // POST: Mark notification as read
    MARK_ALL_READ: '/notifications/mark-all-read', // POST: Mark all as read
  },

  /**
   * Location and tracking endpoints
   * 
   * APIs for location tracking and route management.
   */
  LOCATION: {
    UPDATE: '/location/update',                   // POST: Update driver location
    TRACK_JOB: '/location/track/{jobId}',        // GET: Get job tracking info
  },

  /**
   * File upload endpoints
   * 
   * APIs for handling file uploads (documents, images, etc.)
   */
  UPLOAD: {
    DOCUMENT: '/upload/document',                 // POST: Upload document
    PROFILE_IMAGE: '/upload/profile-image',       // POST: Upload profile image
  },
};

/**
 * Build Dynamic Endpoint
 * 
 * Helper function to build endpoints with dynamic parameters.
 * Replaces placeholders like {id} with actual values.
 * 
 * @param {string} endpoint - Endpoint template with placeholders
 * @param {Object} params - Object with parameter values
 * @returns {string} Built endpoint with replaced parameters
 * 
 * @example
 * buildEndpoint('/jobs/{id}/accept', { id: 123 })
 * // Returns: '/jobs/123/accept'
 */
export const buildEndpoint = (endpoint, params = {}) => {
  let builtEndpoint = endpoint;
  
  Object.keys(params).forEach(key => {
    const placeholder = `{${key}}`;
    builtEndpoint = builtEndpoint.replace(placeholder, params[key]);
  });
  
  return builtEndpoint;
};

/**
 * HTTP Methods
 * 
 * Constants for HTTP methods to ensure consistency.
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

/**
 * API Response Status Codes
 * 
 * Common HTTP status codes used throughout the app.
 */
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * Content Types
 * 
 * Common content types for API requests.
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
};

export default ENDPOINTS;
