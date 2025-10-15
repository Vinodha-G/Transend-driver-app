/**
 * errors.js - Error Handling Utility
 * 
 * This utility provides centralized error handling for the app.
 * It includes error types, recovery strategies, and error tracking.
 */

/**
 * Custom error types for different error scenarios
 */
export class NetworkError extends Error {
  constructor(message = 'Network error occurred', details = {}) {
    super(message);
    this.name = 'NetworkError';
    this.details = details;
    this.recoverable = true;
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Authentication failed', details = {}) {
    super(message);
    this.name = 'AuthenticationError';
    this.details = details;
    this.recoverable = true;
    this.requiresLogin = true;
  }
}

export class ValidationError extends Error {
  constructor(message = 'Validation failed', details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    this.recoverable = true;
  }
}

export class ApiError extends Error {
  constructor(message = 'API error occurred', details = {}, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.details = details;
    this.status = status;
    this.recoverable = status >= 500; // Server errors are potentially recoverable
  }
}

/**
 * Create an appropriate error instance based on the error type
 */
export const createError = (error) => {
  if (error.isAxiosError) {
    if (!error.response) {
      return new NetworkError('Network request failed', {
        config: error.config,
        message: error.message
      });
    }

    const status = error.response.status;
    const data = error.response.data;

    if (status === 401) {
      return new AuthenticationError('Authentication required', {
        status,
        data
      });
    }

    return new ApiError(
      data?.message || 'API request failed',
      {
        status,
        data,
        config: error.config
      },
      status
    );
  }

  if (error.name === 'ValidationError') {
    return new ValidationError(error.message, error.details);
  }

  return error;
};

/**
 * Handle errors based on their type and provide recovery strategies
 */
export const handleError = async (error, options = {}) => {
  const {
    silent = false,
    retryCount = 0,
    maxRetries = 3,
    onAuthError,
    onNetworkError,
    onApiError,
    onValidationError
  } = options;

  const typedError = createError(error);

  if (!silent && __DEV__) {
    console.error(`[${typedError.name}]`, typedError.message, typedError.details);
  }

  // Handle specific error types
  switch (typedError.constructor) {
    case NetworkError:
      if (retryCount < maxRetries && typedError.recoverable) {
        // Implement exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return onNetworkError?.(typedError, retryCount);
      }
      break;

    case AuthenticationError:
      // Clear authentication and redirect to login
      return onAuthError?.(typedError);

    case ValidationError:
      // Handle validation errors (e.g., show in form)
      return onValidationError?.(typedError);

    case ApiError:
      if (retryCount < maxRetries && typedError.recoverable) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return onApiError?.(typedError, retryCount);
      }
      break;
  }

  return Promise.reject(typedError);
};

/**
 * Format error message for display
 */
export const formatErrorMessage = (error) => {
  const typedError = createError(error);
  
  switch (typedError.constructor) {
    case NetworkError:
      return 'Network connection issue. Please check your internet connection and try again.';
    
    case AuthenticationError:
      return 'Your session has expired. Please log in again.';
    
    case ValidationError:
      return `Validation Error: ${typedError.message}`;
    
    case ApiError:
      if (typedError.status >= 500) {
        return 'Server error. Please try again later.';
      }
      return typedError.message;
    
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};