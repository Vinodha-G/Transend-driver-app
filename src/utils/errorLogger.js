/**
 * Error Logger Utility
 * 
 * Centralized error logging system for production-ready error handling.
 * Provides structured logging, error categorization, and non-breaking error reporting.
 * 
 * Features:
 * - Structured error logging with context
 * - Error categorization (API, Navigation, Render, Network)
 * - Production-safe logging (no console spam)
 * - Error tracking and reporting
 * - User-friendly error messages
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

/**
 * Error Categories
 */
export const ERROR_CATEGORIES = {
  API: 'API_ERROR',
  NETWORK: 'NETWORK_ERROR',
  NAVIGATION: 'NAVIGATION_ERROR',
  RENDER: 'RENDER_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTH_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

/**
 * Error Severity Levels
 */
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * Error Log Entry Structure
 * 
 * @typedef {Object} ErrorLogEntry
 * @property {string} timestamp - ISO timestamp
 * @property {string} category - Error category
 * @property {string} severity - Error severity level
 * @property {string} message - Error message
 * @property {Error|string} [error] - Error object or message
 * @property {Object} [context] - Additional context
 * @property {string} [stack] - Error stack trace
 * @property {string} [userId] - User ID if available
 * @property {string} [screen] - Screen name where error occurred
 * @property {string} [action] - Action that triggered error
 */

/**
 * In-memory error log (for debugging)
 * In production, this could be sent to a logging service
 * @type {Array<Object>}
 */
const errorLog = [];
const MAX_LOG_SIZE = 100; // Keep last 100 errors

/**
 * Log Error
 * 
 * Logs an error with structured information for debugging and monitoring.
 * 
 * @param {string} category - Error category (ERROR_CATEGORIES)
 * @param {string} message - User-friendly error message
 * @param {Error|string} error - Error object or error message
 * @param {Object} context - Additional context (screen, action, API endpoint, etc.)
 * @param {string} severity - Error severity level (ERROR_SEVERITY)
 * @returns {Object} Error log entry
 */
export const logError = (
  category = ERROR_CATEGORIES.UNKNOWN,
  message = 'An error occurred',
  error = null,
  context = {},
  severity = ERROR_SEVERITY.MEDIUM
) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    category,
    severity,
    message,
    error: error instanceof Error ? error.message : String(error),
    context,
    stack: error instanceof Error ? error.stack : undefined,
  };

  // Add to log array
  errorLog.push(logEntry);
  if (errorLog.length > MAX_LOG_SIZE) {
    errorLog.shift(); // Remove oldest entry
  }

  // Log to console in development only
  if (__DEV__) {
    console.error(`[${category}] ${message}`, {
      error: logEntry.error,
      context: logEntry.context,
      stack: logEntry.stack,
    });
  }

  // In production, you could send to:
  // - Sentry
  // - Crashlytics
  // - Custom logging service
  // Example: Sentry.captureException(error, { extra: context });

  return logEntry;
};

/**
 * Log API Error
 * 
 * Specialized logging for API errors with request/response context.
 * 
 * @param {string} endpoint - API endpoint that failed
 * @param {Object} request - Request details (method, body, params)
 * @param {Object} response - Response details (status, data)
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 * @returns {Object} Error log entry
 */
export const logApiError = (
  endpoint,
  request = {},
  response = null,
  error = null,
  context = {}
) => {
  const status = response?.status || error?.response?.status || 0;
  let severity = ERROR_SEVERITY.MEDIUM;
  let message = 'API request failed';

  // Determine severity and message based on status code
  if (status === 401 || status === 403) {
    severity = ERROR_SEVERITY.HIGH;
    message = 'Authentication failed. Please login again.';
  } else if (status === 404) {
    severity = ERROR_SEVERITY.LOW;
    message = 'Resource not found.';
  } else if (status >= 500) {
    severity = ERROR_SEVERITY.HIGH;
    message = 'Server error. Please try again later.';
  } else if (status === 0 || !status) {
    severity = ERROR_SEVERITY.MEDIUM;
    message = 'Network error. Please check your connection.';
  } else if (status >= 400 && status < 500) {
    severity = ERROR_SEVERITY.MEDIUM;
    message = response?.data?.message || 'Request failed. Please check your input.';
  }

  return logError(
    ERROR_CATEGORIES.API,
    message,
    error,
    {
      endpoint,
      method: request.method || 'GET',
      status,
      requestBody: request.body,
      requestParams: request.params,
      responseData: response?.data,
      ...context,
    },
    severity
  );
};

/**
 * Log Network Error
 * 
 * Specialized logging for network-related errors.
 * 
 * @param {string} endpoint - API endpoint that failed
 * @param {Error} error - Network error object
 * @param {Object} context - Additional context
 */
export const logNetworkError = (endpoint, error, context = {}) => {
  let message = 'Network error. Please check your internet connection.';
  
  if (error?.message?.includes('timeout')) {
    message = 'Request timed out. Please try again.';
  } else if (error?.message?.includes('Network Error')) {
    message = 'Unable to connect to the server. Please check your connection.';
  }

  return logError(
    ERROR_CATEGORIES.NETWORK,
    message,
    error,
    {
      endpoint,
      ...context,
    },
    ERROR_SEVERITY.MEDIUM
  );
};

/**
 * Log Navigation Error
 * 
 * Specialized logging for navigation-related errors.
 * 
 * @param {string} route - Route that failed to navigate
 * @param {Error} error - Navigation error
 * @param {Object} context - Additional context
 */
export const logNavigationError = (route, error, context = {}) => {
  return logError(
    ERROR_CATEGORIES.NAVIGATION,
    `Failed to navigate to ${route}`,
    error,
    {
      route,
      ...context,
    },
    ERROR_SEVERITY.LOW
  );
};

/**
 * Log Render Error
 * 
 * Specialized logging for rendering errors (caught by ErrorBoundary).
 * 
 * @param {string} component - Component that failed to render
 * @param {Error} error - Render error
 * @param {Object} errorInfo - React error info
 * @param {Object} context - Additional context
 */
export const logRenderError = (component, error, errorInfo = {}, context = {}) => {
  return logError(
    ERROR_CATEGORIES.RENDER,
    `Failed to render ${component}`,
    error,
    {
      component,
      componentStack: errorInfo.componentStack,
      ...context,
    },
    ERROR_SEVERITY.HIGH
  );
};

/**
 * Get Error Logs
 * 
 * Returns the current error log for debugging.
 * 
 * @param {number} limit - Maximum number of logs to return
 * @returns {Array} Array of error log entries
 */
export const getErrorLogs = (limit = 50) => {
  return errorLog.slice(-limit);
};

/**
 * Clear Error Logs
 * 
 * Clears the error log (useful for testing).
 */
export const clearErrorLogs = () => {
  errorLog.length = 0;
};

/**
 * Get User-Friendly Error Message
 * 
 * Converts technical errors into user-friendly messages.
 * 
 * @param {Error|string} error - Error object or message
 * @param {string} defaultMessage - Default message if error can't be parsed
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyMessage = (error, defaultMessage = 'Something went wrong. Please try again.') => {
  if (!error) return defaultMessage;

  // If it's already a user-friendly string, return it
  if (typeof error === 'string') {
    return error;
  }

  // If it's an Error object, extract message
  if (error instanceof Error) {
    const message = error.message;

    // Map common error messages to user-friendly ones
    if (message.includes('Network Error') || message.includes('timeout')) {
      return 'Network error. Please check your internet connection.';
    }
    if (message.includes('401') || message.includes('Authentication')) {
      return 'Authentication failed. Please login again.';
    }
    if (message.includes('403') || message.includes('Forbidden')) {
      return 'Access denied. You don\'t have permission to perform this action.';
    }
    if (message.includes('404') || message.includes('Not Found')) {
      return 'Resource not found.';
    }
    if (message.includes('500') || message.includes('Server Error')) {
      return 'Server error. Please try again later.';
    }
    if (message.includes('422') || message.includes('Validation')) {
      return 'Invalid input. Please check your data and try again.';
    }

    return message || defaultMessage;
  }

  return defaultMessage;
};

export default {
  logError,
  logApiError,
  logNetworkError,
  logNavigationError,
  logRenderError,
  getErrorLogs,
  clearErrorLogs,
  getUserFriendlyMessage,
  ERROR_CATEGORIES,
  ERROR_SEVERITY,
};

