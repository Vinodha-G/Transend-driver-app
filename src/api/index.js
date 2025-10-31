/**
 * API Index - Central Export Point
 * 
 * This file serves as the main entry point for all API-related functionality.
 * It exports all services, utilities, and configurations in a clean, organized way.
 * 
 * Usage:
 * import { driverService, apiClient, ENDPOINTS } from '../api';
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

// Core API client and configuration
export { default as apiClient, setAuthToken, clearAuthToken, handleApiResponse, createFormData } from './client';

// API endpoints configuration
export { ENDPOINTS, buildEndpoint, HTTP_METHODS, STATUS_CODES, CONTENT_TYPES } from './endpoints';

// Authentication service
export { default as authService } from './auth';

// API services
export { driverService, jobService, notificationService, locationService } from './services';

// Default export with all services grouped
export { default as apiServices } from './services';
