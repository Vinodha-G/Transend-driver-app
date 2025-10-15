/**
 * constants.js - Application Constants and Configuration
 * 
 * Centralized location for all application constants, enums, and configuration values.
 * Provides type-safe constants for consistent usage across the application and 
 * reduces the risk of typos and inconsistencies in string literals.
 * 
 * Constants Include:
 * - API configuration and endpoints
 * - Screen navigation names for React Navigation
 * - Job status workflow constants
 * - Job type classifications
 * - Notification type categories
 * 
 * Usage Benefits:
 * - Centralized configuration management
 * - Type safety and IDE autocompletion
 * - Easy maintenance and updates
 * - Consistent naming across the application
 * - Reduced magic strings in codebase
 * 
 * Import Examples:
 * - import { SCREEN_NAMES, JOB_STATUS } from '../utils/constants';
 * - import constants from '../utils/constants';
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

/**
 * API Configuration
 * 
 * Base URL for all API endpoints. Update this value when deploying to different environments
 * (development, staging, production). Consider using environment variables for different builds.
 */
export const API_BASE_URL = 'https://your-api-domain.com/api';

/**
 * Screen Names for React Navigation
 * 
 * Centralized screen names used throughout the navigation system.
 * These constants ensure consistent navigation calls and prevent typos.
 * 
 * Usage: navigation.navigate(SCREEN_NAMES.HOME)
 */
export const SCREEN_NAMES = {
  HOME: 'Home',                               // Main dashboard screen
  CURRENT_JOB: 'CurrentJob',                  // Active job management screen
  MY_RIDES: 'MyRides',                        // Job history and completed rides
  SETTINGS: 'Settings',                       // User settings and preferences
  NOTIFICATION: 'Notification',               // Notification center
  PROFILE_SETTING: 'ProfileSetting',          // Profile editing screen
  JOB_DETAILS: 'JobDetails',                  // Detailed job information
};

/**
 * Job Status Workflow Constants
 * 
 * Defines the complete lifecycle of a job from creation to completion.
 * Used for status tracking, UI state management, and workflow logic.
 * 
 * Workflow: new → accepted → pickedup → delivered
 * Alternative: new → cancelled (if job is rejected/cancelled)
 */
export const JOB_STATUS = {
  NEW: 'new',                                 // Newly created job, available for acceptance
  ACCEPTED: 'accepted',                       // Driver has accepted the job
  PICKEDUP: 'pickedup',                       // Package/cargo has been picked up
  DELIVERED: 'delivered',                     // Job completed successfully
  CANCELLED: 'cancelled',                     // Job was cancelled or rejected
};

/**
 * Job Type Classifications
 * 
 * Different types of delivery jobs supported by the application.
 * Used for job categorization, pricing, and specialized handling requirements.
 */
export const JOB_TYPES = {
  LTL: 'LTL',                                 // Less Than Truckload - partial truck loads
  FTL: 'FTL',                                 // Full Truckload - complete truck capacity
  EXPRESS: 'Express',                         // Time-sensitive urgent deliveries
};

/**
 * Notification Type Categories
 * 
 * Classification system for different types of notifications.
 * Used for notification filtering, styling, and handling logic.
 */
export const NOTIFICATION_TYPES = {
  NEW_JOB: 'new_job',                         // New job opportunities available
  JOB_UPDATE: 'job_update',                   // Updates to existing jobs
  SYSTEM: 'system',                           // System announcements and maintenance
};

/**
 * Default Export
 * 
 * Combines all constants into a single object for convenient importing.
 * Use individual named exports for specific constants or default export for all.
 * 
 * Usage: 
 * - import constants from '../utils/constants'; 
 * - constants.SCREEN_NAMES.HOME
 */
export default {
  API_BASE_URL,
  SCREEN_NAMES,
  JOB_STATUS,
  JOB_TYPES,
  NOTIFICATION_TYPES,
};
