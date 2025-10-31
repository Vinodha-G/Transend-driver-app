/**
 * AppContext.js - Global State Management with API Integration
 * 
 * This file implements the global state management system for the Driver App using React Context API.
 * It provides centralized state for user data, job management, and notifications across all components.
 * Now integrated with real API services for data fetching and updates.
 * 
 * State Management Features:
 * - User profile data with image management
 * - Job listing with real-time status updates
 * - Notification system with read/unread tracking
 * - Computed statistics for dashboard display
 * - Form validation and error handling
 * - API integration for all data operations
 * - Loading and error state management
 * 
 * Context Consumers:
 * - All screen components for data access
 * - Common components for display logic
 * - Form components for data updates
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { driverService, jobService, notificationService, locationService } from '../api';
import authService from '../api/auth';
import * as Location from 'expo-location';
import { getUserFriendlyMessage, logError, ERROR_CATEGORIES } from '../utils/errorLogger';

/**
 * App Context Instance
 * 
 * Creates the React context that will hold the global state.
 * This context is consumed by all components that need access to shared data.
 */
const AppContext = createContext();

/**
 * Custom Hook: useApp
 * 
 * Provides easy access to the app context from any component.
 * Throws an error if used outside of AppProvider to prevent runtime errors.
 * 
 * @returns {Object} Complete context object with state and functions
 * @throws {Error} If used outside of AppProvider
 * 
 * @example
 * const { user, updateUserProfile, jobs } = useApp();
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

/**
 * AppProvider Component
 * 
 * Wraps the entire application and provides global state to all child components.
 * Manages user data, job listings, notifications, and application-wide state.
 * Now includes API integration, loading states, and error handling.
 * 
 * State Structure:
 * - user: Complete user profile with personal information
 * - jobs: Array of all jobs with various statuses and details
 * - notifications: Array of notifications with read/unread status
 * - loading: Loading states for different operations
 * - errors: Error states for different operations
 * - dashboardData: Real-time dashboard statistics from API
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {JSX.Element} Context provider wrapping children
 */
export const AppProvider = ({ children }) => {
  /**
   * User Profile State
   * 
   * Manages complete user profile information from API.
   * Initial state will be replaced with real data from driver profile API.
   */
  const [user, setUser] = useState(null);

  /**
   * Loading States
   * 
   * Tracks loading status for different operations throughout the app.
   */
  const [loading, setLoading] = useState({
    profile: false,
    dashboard: false,
    jobs: false,
    currentJobs: false,
    jobDetails: false,
    notifications: false,
    documents: false,
    profileUpdate: false,
    documentUpdate: false,
    markAbsent: false,
    // Dynamic loading states for rides, e.g., rides_accepted, rides_delivered
  });

  /**
   * Error States
   * 
   * Tracks error messages for different operations.
   */
  const [errors, setErrors] = useState({
    profile: null,
    dashboard: null,
    jobs: null,
    currentJobs: null,
    jobDetails: null,
    notifications: null,
    documents: null,
    profileUpdate: null,
    documentUpdate: null,
  });

  /**
   * Dashboard Data State
   * 
   * Stores real-time dashboard data from the API including job counts, new jobs, and meta information.
   */
  const [dashboardData, setDashboardData] = useState({
    counts: {
      new_order: 0,
      accepted: 0,
      picked_up: 0,
      delivered: 0,
      cancelled: 0,
    },
    new_jobs: [],
    meta: {
      ip_address: null,
      device_id: null,
      device_model: null,
    },
  });
  
  // Debug: Log initial dashboardData state
  console.log('=== Initial dashboardData State ===');
  console.log('dashboardData:', dashboardData);
  console.log('dashboardData.counts:', dashboardData.counts);
  console.log('===================================');

  /**
   * Documents State
   * 
   * Stores driver document information and upload status.
   */
  const [documents, setDocuments] = useState({
    driver_license_front: null,
    driver_license_back: null,
    insurance: null,
    mv1_report: null,
    incident_report: null,
    cuse_logbook: null,
  });

  /**
   * Notifications State
   * 
   * Array of all notifications. Will be populated from API.
   */
  const [notifications, setNotifications] = useState([]);

  /**
   * Jobs State
   * 
   * Array of all jobs. Will be populated from dashboard API and job service.
   */
  const [jobs, setJobs] = useState([]);

  /**
   * Current Jobs State
   * 
   * Array of current (active/ongoing) jobs assigned to the driver.
   * Will be populated from /driver/current-jobs API.
   */
  const [currentJobs, setCurrentJobs] = useState([]);

  /**
   * Job Details State
   * 
   * Stores detailed information for a specific job/parcel.
   * Will be populated from /driver/job-details API.
   */
  const [jobDetails, setJobDetails] = useState(null);

  /**
   * Rides State
   * 
   * Stores rides data by status. Structure: { [status]: [...rides] }
   * Will be populated from my-rides API when user switches tabs.
   */
  const [rides, setRides] = useState({});

  /**
   * Location Tracking State
   * 
   * Manages real-time location tracking for driver.
   */
  const [isLocationTracking, setIsLocationTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState(null);
  
  // Refs for location tracking
  const locationSubscriptionRef = useRef(null);
  const locationIntervalRef = useRef(null);

  /**
   * Set Loading State Helper
   * 
   * Updates loading state for a specific operation.
   * 
   * @param {string} operation - The operation name (profile, dashboard, etc.)
   * @param {boolean} isLoading - Loading status
   */
  const setLoadingState = (operation, isLoading) => {
    setLoading(prev => ({
      ...prev,
      [operation]: isLoading,
    }));
  };

  /**
   * Set Error State Helper
   * 
   * Updates error state for a specific operation.
   * 
   * @param {string} operation - The operation name
   * @param {string|null} error - Error message or null to clear
   */
  const setErrorState = (operation, error) => {
    setErrors(prev => ({
      ...prev,
      [operation]: error,
    }));
  };

  /**
   * Load Driver Profile from API
   * 
   * Fetches the authenticated driver profile from the API and updates the user state.
   * API: GET /driver/profile with body {driver_id: 1}
   * Response: { success: true, message: "Delivery Man", data: { user: {...}, meta: {...} } }
   */
  const loadDriverProfile = async (driverId) => {
    setLoadingState('profile', true);
    setErrorState('profile', null);

    try {
      // Use provided driverId or default to 1 (for initial login)
      const targetDriverId = driverId || 1;
      
      console.log('=== Profile Driver ID Debug ===');
      console.log('Loading profile for driver_id:', targetDriverId);
      console.log('================================');
      
      // Call API with driver ID
      const response = await driverService.getProfile(targetDriverId);
      
      if (response.success && response.data) {
        // Log the API response structure for debugging
        console.log('Profile API data structure:', {
          hasData: !!response.data,
          hasUser: !!response.data.user,
          dataKeys: response.data ? Object.keys(response.data) : [],
          hasMeta: !!response.data.meta,
        });
        
        if (!response.data.user) {
          const errorMsg = 'Profile API response missing user data';
          setErrorState('profile', errorMsg);
          console.error('Profile API response error:', response);
          return;
        }
        
        const apiUser = response.data.user;
        const metaData = response.data.meta || {}; // Extract meta data if available
        
        // Map API response to expected user schema
        // All data comes dynamically from the API response
        const mappedUser = {
          id: String(apiUser.id),
          name: `${apiUser.first_name || ''} ${apiUser.last_name || ''}`.trim() || 'Driver',
          first_name: apiUser.first_name || '',
          last_name: apiUser.last_name || '',
          email: apiUser.email || '',
          phone: apiUser.phone || '',
          address: apiUser.address || null,
          image: apiUser.image || null,
          profileImage: apiUser.image || null,
          user_type: apiUser.user_type || '0',
          status: apiUser.status || '',
          statusName: apiUser.statusName || '',
          created_at: apiUser.created_at || null,
          updated_at: apiUser.updated_at || null,
          // Meta information from API response
          meta: {
            ip_address: metaData.ip_address || null,
            device_id: metaData.device_id || null,
            device_model: metaData.device_model || null,
          },
          // Default values for fields not provided by API
          rating: 4.5, // Default rating as API doesn't provide this
          activeStatus: apiUser.status === 'active' || true, // Default to active
          vehicleDetails: {
            type: 'Delivery Van', // Default values as API doesn't provide vehicle details
            plateNumber: 'N/A',
            make: 'Ford',
            model: 'Transit',
            year: '2023',
          },
        };
        
        console.log('Profile loaded successfully:', {
          id: mappedUser.id,
          name: mappedUser.name,
          email: mappedUser.email,
          phone: mappedUser.phone,
        });
        
        setUser(mappedUser);
        
        // Dashboard always uses driver_id: 1, so no need to reload after profile loads
        console.log('✅ Profile loaded successfully');
      } else {
        const errorMsg = response.message || 'Failed to load profile';
        setErrorState('profile', errorMsg);
        console.error('Profile API response error:', response);
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to load profile. Please try again.';
      setErrorState('profile', errorMsg);
      console.error('Load profile error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });
      
      // Set default user to prevent UI errors
      setUser({
        id: '0',
        name: 'Driver',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: null,
        image: null,
        profileImage: null,
        rating: 0,
        activeStatus: false,
      });
    } finally {
      setLoadingState('profile', false);
    }
  };

  /**
   * Load All Jobs from API
   * 
   * Fetches all jobs for the driver with different statuses.
   */
  const loadAllJobs = async (driverId = 1) => {
    setLoadingState('jobs', true);
    setErrorState('jobs', null);

    try {
      const response = await jobService.getJobs({ driver_id: driverId });
      
      if (response.success) {
        const jobsWithIds = response.data.map(job => ({
          ...job,
          id: job.tracking_id || job.id || Math.random().toString(),
        }));
        setJobs(jobsWithIds);
      } else {
        setErrorState('jobs', response.message);
      }
    } catch (error) {
      setErrorState('jobs', 'Failed to load jobs. Please try again.');
      console.error('Load jobs error:', error);
    } finally {
      setLoadingState('jobs', false);
    }
  };

  /**
   * Load Dashboard Data from API
   * 
   * Fetches authenticated dashboard data including job counts, new jobs, and meta information.
   * API: GET /driver/dashboard with body {driver_id: 1}
   * Response: { success: true, message: "Delivery Man", data: { counts: {...}, new_jobs: [...], meta: {...} } }
   */
  const loadDashboardData = async (driverId) => {
    setLoadingState('dashboard', true);
    setErrorState('dashboard', null);

    try {
      // Always use driver_id: 1 for dashboard
      // Use provided driverId if explicitly passed, otherwise default to 1
      const targetDriverId = driverId || 1;
      
      console.log('=== Dashboard Driver ID Debug ===');
      console.log('Provided driverId parameter:', driverId);
      console.log('Final targetDriverId being used:', targetDriverId, '(always using driver_id: 1)');
      console.log('================================');
      
      // Call API with actual driver ID
      const response = await driverService.getDashboard(targetDriverId);
      
      // Debug: Log the raw response structure
      console.log('=== AppContext - Raw Dashboard Response ===');
      console.log('Full response object:', JSON.stringify(response, null, 2));
      console.log('response.success:', response.success);
      console.log('response.data:', response.data);
      console.log('response.data type:', typeof response.data);
      console.log('response.data keys:', response.data ? Object.keys(response.data) : 'null');
      console.log('response.data.counts:', response.data?.counts);
      console.log('response.data.counts type:', typeof response.data?.counts);
      console.log('response.data.counts keys:', response.data?.counts ? Object.keys(response.data.counts) : 'null');
      console.log('============================================');
      
      if (response.success && response.data) {
        const apiData = response.data;
        console.log('=== AppContext - Processing apiData ===');
        console.log('apiData:', JSON.stringify(apiData, null, 2));
        console.log('apiData.counts:', apiData.counts);
        console.log('apiData.counts type:', typeof apiData.counts);
        console.log('apiData.counts is object?', typeof apiData.counts === 'object' && apiData.counts !== null);
        console.log('========================================');
        
        const metaData = apiData.meta || {}; // Extract meta data if available
        
        // Log the full API response structure for debugging
        console.log('=== Dashboard API Response Debug ===');
        console.log('Full response.data:', JSON.stringify(apiData, null, 2));
        console.log('apiData.counts:', apiData.counts);
        console.log('apiData.counts type:', typeof apiData.counts);
        console.log('apiData.counts keys:', apiData.counts ? Object.keys(apiData.counts) : 'null');
        console.log('apiData.new_jobs:', apiData.new_jobs);
        console.log('apiData.new_jobs length:', apiData.new_jobs?.length || 0);
        console.log('apiData.meta:', apiData.meta);
        
        // Extract counts - API returns counts object directly in response.data
        // Based on API response: { success: true, data: { counts: { new_order: 1, accepted: 1, ... } } }
        let counts = {};
        if (apiData.counts && typeof apiData.counts === 'object') {
          // API returns counts object directly - extract values and ensure they're numbers
          // Use nullish coalescing (??) to correctly handle 0 values
          // Don't use || because 0 is falsy and would be replaced with 0 anyway, but we want to preserve 0
          counts = {
            new_order: apiData.counts.new_order != null ? Number(apiData.counts.new_order) : 0,
            accepted: apiData.counts.accepted != null ? Number(apiData.counts.accepted) : 0,
            picked_up: apiData.counts.picked_up != null ? Number(apiData.counts.picked_up) : 0,
            delivered: apiData.counts.delivered != null ? Number(apiData.counts.delivered) : 0,
            cancelled: apiData.counts.cancelled != null ? Number(apiData.counts.cancelled) : 0,
          };
        } else {
          // Fallback: counts might be at root level or missing
          console.warn('Counts object not found in expected format, using defaults');
          counts = {
            new_order: 0,
            accepted: 0,
            picked_up: 0,
            delivered: 0,
            cancelled: 0,
          };
        }
        
        console.log('Extracted counts (as numbers):', counts);
        console.log('Counts values:', {
          new_order: counts.new_order,
          accepted: counts.accepted,
          picked_up: counts.picked_up,
          delivered: counts.delivered,
          cancelled: counts.cancelled,
        });
        
        // Store dashboard data with counts, new_jobs, and meta
        // All data comes dynamically from the API response
        const dashboardUpdate = {
          counts: counts,
          new_jobs: Array.isArray(apiData.new_jobs) ? apiData.new_jobs : [],
          meta: {
            ip_address: metaData.ip_address || null,
            device_id: metaData.device_id || null,
            device_model: metaData.device_model || null,
          },
        };
        
        console.log('Setting dashboard data:', JSON.stringify(dashboardUpdate, null, 2));
        setDashboardData(dashboardUpdate);
        
        // Verify the state was set correctly
        console.log('Dashboard data set successfully. Counts:', counts);
        console.log('Dashboard counts breakdown:', {
          new_order: counts.new_order,
          accepted: counts.accepted,
          picked_up: counts.picked_up,
          delivered: counts.delivered,
          cancelled: counts.cancelled,
        });
        
        // Map new_jobs from API response to app job format
        // All new jobs come dynamically from the API - no hardcoded data
        if (apiData.new_jobs && Array.isArray(apiData.new_jobs)) {
          const mappedNewJobs = apiData.new_jobs.map(job => ({
            id: job.tracking_id || Math.random().toString(),
            tracking_id: job.tracking_id || '',
            status: 'new', // All jobs from new_jobs array have 'new' status
            // Map API field names to JobCard expected format
            companyName: job.customer_name || 'Unknown Company',
            orderId: job.tracking_id || 'N/A',
            type: 'LTL', // Default type (can be updated if API provides it)
            dateTime: job.shipment_date || 'TBD',
            pickupLocation: job.from_address_text || 'TBD',
            dropoffLocation: job.to_address_text || 'TBD',
            profileImage: null, // No profile image from API
            // Keep original API fields for reference
            customer_name: job.customer_name,
            shipment_date: job.shipment_date,
            from_address_text: job.from_address_text,
            to_address_text: job.to_address_text,
          }));
          
          // Update jobs array: preserve existing jobs with non-'new' statuses, replace 'new' jobs with API data
          setJobs(prevJobs => {
            // Keep jobs that are not 'new' status (accepted, pickedup, delivered, cancelled)
            const existingNonNewJobs = prevJobs.filter(job => job.status && job.status.toLowerCase() !== 'new');
            // Combine existing non-new jobs with new jobs from API
            return [...existingNonNewJobs, ...mappedNewJobs];
          });
          
        console.log('Dashboard loaded successfully:', {
          newOrders: counts.new_order,
          accepted: counts.accepted,
          pickedUp: counts.picked_up,
          delivered: counts.delivered,
          cancelled: counts.cancelled,
          newJobsCount: mappedNewJobs.length,
        });
        
        // Verify counts are being set correctly
        console.log('Final dashboardData.counts:', counts);
        } else {
          // If no new_jobs array, preserve existing jobs but remove 'new' status jobs
          setJobs(prevJobs => prevJobs.filter(job => job.status && job.status.toLowerCase() !== 'new'));
        }
      } else {
        const errorMsg = response.message || 'Failed to load dashboard data';
        setErrorState('dashboard', errorMsg);
        console.error('Dashboard API response error:', response);
      }
    } catch (error) {
      // Extract user-friendly error message
      const errorMsg = error?.message || getUserFriendlyMessage(error, 'Failed to load dashboard data. Please try again.');
      
      setErrorState('dashboard', errorMsg);
      
      // Log error for debugging
      if (__DEV__) {
        console.error('Load dashboard error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          stack: error.stack,
        });
      }
      
      // Set default values to prevent UI errors
      // Don't reset counts if they were previously loaded successfully
      setDashboardData(prev => ({
        counts: prev.counts || {
          new_order: 0,
          accepted: 0,
          picked_up: 0,
          delivered: 0,
          cancelled: 0,
        },
        new_jobs: prev.new_jobs || [],
        meta: prev.meta || {
          ip_address: null,
          device_id: null,
          device_model: null,
        },
      }));
    } finally {
      setLoadingState('dashboard', false);
    }
  };

  /**
   * Load Driver Documents from API
   * 
   * Fetches the authenticated driver's uploaded documents.
   */
  const loadDriverDocuments = async () => {
    setLoadingState('documents', true);
    setErrorState('documents', null);

    try {
      const response = await driverService.getDocuments();
      
      if (response.success && response.data && response.data.documents) {
        console.log('Documents loaded successfully:', response.data.documents);
        setDocuments(response.data.documents);
      } else {
        setErrorState('documents', response.message || 'Failed to load documents');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to load documents. Please try again.';
      setErrorState('documents', errorMessage);
      console.error('Load documents error:', error);
    } finally {
      setLoadingState('documents', false);
    }
  };

  /**
   * Load Notifications from API
   * 
   * Fetches the driver's notifications.
   */
  const loadNotifications = async () => {
    setLoadingState('notifications', true);
    setErrorState('notifications', null);

    try {
      const response = await notificationService.getNotifications();
      
      if (response.success) {
        setNotifications(response.data);
      } else {
        setErrorState('notifications', response.message);
      }
    } catch (error) {
      setErrorState('notifications', 'Failed to load notifications. Please try again.');
      console.error('Load notifications error:', error);
    } finally {
      setLoadingState('notifications', false);
    }
  };

  /**
   * Update Driver Profile
   * 
   * Updates driver profile information via API and refreshes local state.
   * API: POST /driver/profile/update
   * Response: { success: true, message: "Profile updated successfully", data: { user: {...}, meta: {...} } }
   * 
   * @param {Object} updates - Profile data to update
   * @param {string} updates.first_name - Driver's first name (required)
   * @param {string} updates.last_name - Driver's last name (required)
   * @param {string} updates.phone - Driver's phone number (required)
   * @param {string} [updates.email] - Driver's email (optional)
   * @param {string} [updates.address] - Driver's address (optional)
   * @param {number} [updates.driver_id] - Driver ID (optional, uses current user ID if not provided)
   * @returns {Promise<boolean>} Success status
   */
  const updateUserProfile = async (updates) => {
    setLoadingState('profileUpdate', true);
    setErrorState('profileUpdate', null);

    try {
      // Include driver_id from current user if not provided
      const updateData = {
        ...updates,
        driver_id: updates.driver_id || (user?.id ? parseInt(user.id) : 1),
      };
      
      const response = await driverService.updateProfile(updateData);
      
      if (response.success && response.data && response.data.user) {
        console.log('Profile updated successfully:', response.data.user);
        
        // Map the updated API response to user schema (similar to loadDriverProfile)
        const apiUser = response.data.user;
        const metaData = response.data.meta || {}; // Extract meta data if available
        
        const updatedUser = {
          id: String(apiUser.id),
          name: `${apiUser.first_name || ''} ${apiUser.last_name || ''}`.trim() || 'Driver',
          first_name: apiUser.first_name || '',
          last_name: apiUser.last_name || '',
          email: apiUser.email || '',
          phone: apiUser.phone || '',
          address: apiUser.address || null,
          image: apiUser.image || null,
          profileImage: apiUser.image || null,
          user_type: apiUser.user_type || '0',
          status: apiUser.status || '',
          statusName: apiUser.statusName || '',
          created_at: apiUser.created_at || null,
          updated_at: apiUser.updated_at || null,
          // Meta information from API response
          meta: {
            ip_address: metaData.ip_address || null,
            device_id: metaData.device_id || null,
            device_model: metaData.device_model || null,
          },
          // Preserve existing values for fields not in API response
          rating: user?.rating || 4.5,
          activeStatus: apiUser.status === 'active' || true,
          vehicleDetails: user?.vehicleDetails || {
            type: 'Delivery Van',
            plateNumber: 'N/A',
            make: 'Ford',
            model: 'Transit',
            year: '2023',
          },
        };
        
        // Update local state with fresh data from server
        setUser(updatedUser);
        
        // Success - profile updated successfully
        console.log('Profile update completed:', {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
        });
        
        return true;
      } else {
        const errorMsg = response.message || 'Update failed';
        setErrorState('profileUpdate', errorMsg);
        console.error('Profile API response error:', response);
        return false;
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to update profile. Please try again.';
      setErrorState('profileUpdate', errorMessage);
      console.error('Update profile error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return false;
    } finally {
      setLoadingState('profileUpdate', false);
    }
  };

  /**
   * Update Driver Documents
   * 
   * Uploads/updates driver documents via API using multipart/form-data.
   * API: POST /driver/documents/update
   * Response: { success: true, message: "Documents updated successfully", data: { documents: {...}, meta: {...} } }
   * 
   * @param {Object} documentFiles - Files to upload
   * @param {number} [documentFiles.driver_id] - Driver ID (optional, uses current user ID if not provided)
   * @param {Object} [documentFiles.driver_license_front] - Front license file { uri, type, name }
   * @param {Object} [documentFiles.driver_license_back] - Back license file { uri, type, name }
   * @param {Object} [documentFiles.insurance] - Insurance file { uri, type, name }
   * @param {Object} [documentFiles.mv1_report] - MV1 report file { uri, type, name }
   * @param {Object} [documentFiles.incident_report] - Incident report file { uri, type, name }
   * @param {Object} [documentFiles.cuse_logbook] - CUSE logbook file { uri, type, name }
   * @returns {Promise<boolean>} Success status
   */
  const updateDriverDocuments = async (documentFiles) => {
    setLoadingState('documentUpdate', true);
    setErrorState('documentUpdate', null);

    try {
      // Include driver_id from current user if not provided
      const updateData = {
        ...documentFiles,
        driver_id: documentFiles.driver_id || (user?.id ? parseInt(user.id) : 1),
      };
      
      const response = await driverService.updateDocuments(updateData);
      
      if (response.success && response.data) {
        // Update local documents state with new document URLs
        if (response.data.documents) {
          setDocuments(response.data.documents);
        }
        
        // Log success with meta data if available
        const metaData = response.data.meta || {};
        console.log('Documents updated successfully:', {
          documents: response.data.documents,
          meta: metaData,
        });
        
        return true;
      } else {
        const errorMsg = response.message || 'Update failed';
        setErrorState('documentUpdate', errorMsg);
        console.error('Documents API response error:', response);
        return false;
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to update documents. Please try again.';
      setErrorState('documentUpdate', errorMessage);
      console.error('Update documents error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return false;
    } finally {
      setLoadingState('documentUpdate', false);
    }
  };

  /**
   * Load Current Jobs
   * 
   * Fetches the list of current (active/ongoing) delivery jobs assigned to the driver.
   * 
   * API: POST /driver/current-jobs
   * Request Body: { driver_id: number }
   * Response: { success: true, message: "dashboard.current_jobs", data: { jobs: [...], meta: {...} } }
   * 
   * @param {number} [driverId] - Driver ID (optional, uses current user ID if not provided)
   * @returns {Promise<boolean>} Success status
   */
  const loadCurrentJobs = async (driverId) => {
    setLoadingState('currentJobs', true);
    setErrorState('currentJobs', null);

    try {
      const targetDriverId = driverId || (user?.id ? parseInt(user.id) : 1);

      console.log('Loading current jobs:', {
        driver_id: targetDriverId,
      });

      const response = await driverService.getCurrentJobs(targetDriverId);

      if (response.success && response.data) {
        const jobsData = response.data.jobs || [];
        const metaData = response.data.meta || {};

        console.log(`Loaded ${jobsData.length} current jobs`);
        
        // Log first job structure for debugging
        if (jobsData.length > 0) {
          console.log('Sample job data structure:', JSON.stringify(jobsData[0], null, 2));
        }

        // Map API job fields to UI format if needed
        const mappedJobs = jobsData.map((job, index) => {
          // Log raw job data for debugging
          console.log(`Raw job ${index + 1} data:`, JSON.stringify(job, null, 2));
          console.log(`Job ${index + 1} available keys:`, Object.keys(job));
          
          // Try multiple possible field names for each property (expanded list)
          const trackingId = job.tracking_id || job.trackingId || job.tracking_number || job.trackingNumber || 
                            job.order_id || job.orderId || job.order_number || job.orderNumber || 
                            job.id || job.parcel_id || job.parcelId || job.parcel_number || 
                            `JOB-${index + 1}`;
          
          const orderId = job.order_id || job.orderId || job.order_number || job.orderNumber || 
                         job.order_no || job.orderNo || job.orderId || job.order_number || 
                         trackingId || `ORD-${index + 1}`;
          
          const customerName = job.customer_name || job.customerName || job.customer || 
                              job.company_name || job.companyName || job.client_name || 
                              job.clientName || job.name || 'Unknown Company';
          
          const jobType = job.type || job.job_type || job.jobType || job.delivery_type || 
                         job.deliveryType || job.service_type || job.serviceType || 'LTL';
          
          const shipmentDate = job.shipment_date || job.shipmentDate || job.delivery_date || 
                             job.deliveryDate || job.created_at || job.createdAt || 
                             job.date || job.created_date || job.createdDate || 
                             new Date().toLocaleDateString();
          
          const pickupAddress = job.from_address_text || job.from_address || job.fromAddress || 
                               job.pickup_address || job.pickupAddress || job.origin_address || 
                               job.originAddress || job.origin || job.pickup || 
                               job.pickup_location || job.pickupLocation ||
                               'Address not available';
          
          const dropoffAddress = job.to_address_text || job.to_address || job.toAddress || 
                                job.dropoff_address || job.dropoffAddress || job.destination_address || 
                                job.destinationAddress || job.destination || job.dropoff || 
                                job.delivery_location || job.deliveryLocation ||
                                'Address not available';
          
          const profileImg = job.profile_image || job.profileImage || job.customer_image || 
                            job.customerImage || job.image || job.avatar || job.logo || null;
          
          const jobStatus = job.status || job.job_status || job.jobStatus || job.state || 'new';

          console.log(`Job ${index + 1} mapped values:`, {
            trackingId,
            orderId,
            customerName,
            pickupAddress,
            dropoffAddress,
            status: jobStatus,
            profileImg: profileImg ? 'Present' : 'Missing',
          });

          return {
            id: job.id || trackingId || Math.random().toString(),
            tracking_id: trackingId,
            order_id: orderId,
            companyName: customerName,
            orderId: orderId, // For display
            type: jobType,
            dateTime: shipmentDate,
            pickupLocation: pickupAddress,
            dropoffLocation: dropoffAddress,
            profileImage: profileImg,
            status: jobStatus,
            // Preserve all original fields
            customer_name: customerName,
            shipment_date: shipmentDate,
            from_address: job.from_address || job.pickup_address || null,
            from_address_text: pickupAddress,
            to_address: job.to_address || job.dropoff_address || null,
            to_address_text: dropoffAddress,
            booking_details: job.booking_details || job.bookingDetails || {},
            ...job, // Include all other fields for backward compatibility
          };
        });

        setCurrentJobs(mappedJobs);
        return true;
      } else {
        const errorMsg = response.message || 'Failed to load current jobs';
        setErrorState('currentJobs', errorMsg);
        console.error('Load current jobs error:', errorMsg);
        
        setCurrentJobs([]);
        return false;
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to load current jobs. Please try again.';
      setErrorState('currentJobs', errorMessage);
      console.error('Load current jobs error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      setCurrentJobs([]);
      return false;
    } finally {
      setLoadingState('currentJobs', false);
    }
  };

  /**
   * Load Job Details
   * 
   * Fetches detailed information about a specific delivery job or parcel.
   * 
   * API: POST /driver/job-details
   * Request Body: { driver_id: number, parcel_id: number }
   * Response: { success: true, message: "dashboard.job_details", data: { job: {...}, meta: {...} } }
   * 
   * @param {number} parcelId - Parcel/Job ID (required)
   * @param {number} [driverId] - Driver ID (optional, uses current user ID if not provided)
   * @returns {Promise<boolean>} Success status
   */
  const loadJobDetails = async (parcelId, driverId) => {
    setLoadingState('jobDetails', true);
    setErrorState('jobDetails', null);

    try {
      const targetDriverId = driverId || (user?.id ? parseInt(user.id) : 1);
      
      // Parse parcel ID - try multiple field formats
      let targetParcelId = parcelId;
      if (typeof parcelId === 'object' && parcelId !== null) {
        // If parcelId is actually a job object, extract the ID
        targetParcelId = parcelId.order_id || parcelId.parcel_id || parcelId.id || parcelId.tracking_id || null;
      }
      
      if (!targetParcelId) {
        throw new Error('Parcel ID is required');
      }

      // Ensure parcel ID is a number
      targetParcelId = parseInt(targetParcelId);

      console.log('Loading job details:', {
        driver_id: targetDriverId,
        parcel_id: targetParcelId,
      });

      const response = await driverService.getJobDetails(targetDriverId, targetParcelId);

      if (response.success && response.data) {
        const jobData = response.data.job || {};
        const metaData = response.data.meta || {};

        console.log('Loaded job details successfully');

        // Map API job fields to UI format
        const mappedJobDetails = {
          order_id: jobData.order_id || jobData.orderId || targetParcelId,
          tracking_id: jobData.tracking_id || jobData.trackingId || 'N/A',
          shipment_date: jobData.shipment_date || jobData.shipmentDate || jobData.delivery_date || 'N/A',
          customer_name: jobData.customer_name || jobData.customerName || 'Unknown Customer',
          from_address: jobData.from_address || jobData.fromAddress || 'Address not available',
          to_address: jobData.to_address || jobData.toAddress || 'Address not available',
          booking_details: jobData.booking_details || jobData.bookingDetails || {},
          // Preserve all original fields
          ...jobData,
        };

        setJobDetails(mappedJobDetails);
        return true;
      } else {
        const errorMsg = response.message || 'Failed to load job details';
        setErrorState('jobDetails', errorMsg);
        console.error('Load job details error:', errorMsg);
        
        setJobDetails(null);
        return false;
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to load job details. Please try again.';
      setErrorState('jobDetails', errorMessage);
      console.error('Load job details error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      setJobDetails(null);
      return false;
    } finally {
      setLoadingState('jobDetails', false);
    }
  };

  /**
   * Load Driver Rides by Status
   * 
   * Fetches driver rides filtered by status from the API.
   * 
   * API: POST /driver/my-rides
   * Request Body: { driver_id: number, status: string }
   * Response: { success: true, message: "dashboard.my_rides", data: { rides: [...], meta: {...} } }
   * 
   * @param {string} status - Ride status filter (e.g., "delivered", "accepted", "picked_up", "cancelled")
   * @param {number} [driverId] - Driver ID (optional, uses current user ID if not provided)
   * @returns {Promise<boolean>} Success status
   */
  const loadDriverRides = async (status, driverId) => {
    const operationKey = `rides_${status}`;
    setLoadingState(operationKey, true);
    setErrorState(operationKey, null);

    try {
      // Always use driver_id: 1 for rides (or provided driverId)
      const targetDriverId = driverId || 1;
      
      // Validate status
      if (!status || typeof status !== 'string') {
        throw new Error('Invalid status parameter');
      }

      // Map UI status to API status format
      // API expects: "delivered", "accepted", "picked_up", "cancelled", "in_progress"
      // UI uses: "accepted", "pickedup", "delivered", "cancelled"
      const statusMap = {
        'accepted': 'accepted',
        'pickedup': 'picked_up',  // UI uses "pickedup", API expects "picked_up"
        'delivered': 'delivered',
        'cancelled': 'cancelled',
        'in_progress': 'in_progress',  // For future use if needed
      };
      
      const apiStatus = statusMap[status] || status;

      console.log('Loading driver rides:', {
        driver_id: targetDriverId,
        status: apiStatus,
      });

      const response = await driverService.getDriverRides(targetDriverId, apiStatus);

      if (response.success && response.data) {
        // Null-safe extraction of rides data
        const ridesData = Array.isArray(response.data.rides) ? response.data.rides : [];
        const metaData = response.data.meta || {};

        console.log(`✅ Loaded ${ridesData.length} rides for status: ${apiStatus} (driver_id: ${targetDriverId})`);
        if (ridesData.length > 0) {
          console.log('Sample ride data:', JSON.stringify(ridesData[0], null, 2));
        } else {
          console.log('No rides found for status:', apiStatus);
        }

        // Store rides by status in state with null safety
        // API returns rides array directly - no additional mapping needed
        setRides(prev => ({
          ...prev,
          [status]: ridesData, // Store API rides directly (always an array)
        }));

        return true;
      } else {
        const errorMsg = response.message || 'Failed to load rides';
        setErrorState(operationKey, errorMsg);
        console.error('❌ Load rides API error:', {
          status: apiStatus,
          driver_id: targetDriverId,
          message: errorMsg,
        });
        
        // Set empty array for this status on error to prevent crashes
        setRides(prev => ({
          ...prev,
          [status]: [],
        }));
        
        return false;
      }
    } catch (error) {
      // Enhanced error handling with detailed logging
      let errorMessage = 'Failed to load rides. Please try again.';
      
      // Handle validation errors (422)
      if (error.response?.status === 422) {
        const validationErrors = error.response?.data?.data;
        if (validationErrors && typeof validationErrors === 'object') {
          const errorMessages = Object.values(validationErrors).flat();
          errorMessage = errorMessages.join(', ') || 'Validation failed. Please check your input.';
        } else {
          errorMessage = error.response?.data?.message || 'Validation failed. Please check your input.';
        }
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please login again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Rides not found.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrorState(operationKey, errorMessage);
      console.error('❌ Load rides error:', {
        status: apiStatus,
        driver_id: targetDriverId,
        message: error.message,
        response: error.response?.data,
        httpStatus: error.response?.status,
        stack: error.stack,
      });
      
      // Set empty array for this status on error to prevent crashes
      setRides(prev => ({
        ...prev,
        [status]: [],
      }));
      
      return false;
    } finally {
      setLoadingState(operationKey, false);
    }
  };

  /**
   * Mark Driver as Absent
   * 
   * Marks the driver as absent via API and updates parcel assignments.
   * 
   * API: POST /driver/mark-absent
   * Request Body: { driver_id: number, absent_date: "YYYY-MM-DD" }
   * Response: { success: true, message: "Driver marked absent and parcels updated successfully.", data: { meta: {...} } }
   * 
   * @param {number} [driverId] - Driver ID (optional, uses current user ID if not provided)
   * @param {string} [absentDate] - Absence date in YYYY-MM-DD format (optional, defaults to today)
   * @returns {Promise<boolean>} Success status
   */
  const markDriverAbsent = async (driverId, absentDate) => {
    setLoadingState('markAbsent', true);
    setErrorState('markAbsent', null);

    try {
      // Use provided driver ID or get from current user
      const targetDriverId = driverId || (user?.id ? parseInt(user.id) : 1);
      
      // Use provided date or default to today in YYYY-MM-DD format
      let targetDate = absentDate;
      if (!targetDate) {
        const today = new Date();
        targetDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      }

      console.log('Marking driver as absent:', {
        driver_id: targetDriverId,
        absent_date: targetDate,
      });

      const response = await driverService.markAbsent(targetDriverId, targetDate);
      
      if (response.success) {
        console.log('Driver marked absent successfully:', response.message);
        
        // Refresh dashboard data after marking absent to reflect updated parcel assignments
        await loadDashboardData();
        
        return true;
      } else {
        const errorMsg = response.message || 'Failed to mark driver as absent';
        setErrorState('markAbsent', errorMsg);
        console.error('Mark absent error:', errorMsg);
        return false;
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to mark driver as absent. Please try again.';
      setErrorState('markAbsent', errorMessage);
      console.error('Mark absent error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return false;
    } finally {
      setLoadingState('markAbsent', false);
    }
  };

  /**
   * Start Location Tracking
   * 
   * Starts continuous location tracking and sends updates to backend every 10-15 seconds.
   * Publishes location to Kafka topic for real-time tracking dashboard.
   * 
   * @param {number} [driverId] - Driver ID (optional, uses current user ID if not provided)
   * @param {number} [intervalSeconds] - Update interval in seconds (default: 12 seconds)
   * @returns {Promise<boolean>} Success status
   */
  const startLocationTracking = async (driverId, intervalSeconds = 12) => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionStatus(status);

      if (status !== 'granted') {
        console.warn('Location permission denied. Cannot start tracking.');
        return false;
      }

      // Get driver ID
      const targetDriverId = driverId || (user?.id ? parseInt(user.id) : 1);

      // Start watching location changes
      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: intervalSeconds * 1000, // Convert to milliseconds
          distanceInterval: 10, // Update if moved 10 meters
        },
        async (location) => {
          const { latitude, longitude } = location.coords;
          const timestamp = new Date().toISOString();

          // Update current location state
          setCurrentLocation({ latitude, longitude, timestamp });

          // Send location to backend
          try {
            await locationService.updateLocation(targetDriverId, latitude, longitude, timestamp);
            console.log('Location sent successfully:', { latitude, longitude, timestamp });
          } catch (error) {
            console.error('Failed to send location update:', error.message);
            // Don't stop tracking on API errors - continue trying
          }
        }
      );

      setIsLocationTracking(true);
      console.log('Location tracking started for driver:', targetDriverId);
      return true;
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      setIsLocationTracking(false);
      return false;
    }
  };

  /**
   * Stop Location Tracking
   * 
   * Stops the continuous location tracking service.
   */
  const stopLocationTracking = () => {
    try {
      // Stop location subscription
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
      }

      // Clear interval if exists
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }

      setIsLocationTracking(false);
      console.log('Location tracking stopped');
    } catch (error) {
      console.error('Error stopping location tracking:', error);
    }
  };

  /**
   * Update Location Manually
   * 
   * Manually sends current location to backend (useful for one-time updates).
   * 
   * @param {number} [driverId] - Driver ID (optional, uses current user ID if not provided)
   * @returns {Promise<boolean>} Success status
   */
  const updateLocationManually = async (driverId) => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('Location permission denied.');
        return false;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      const timestamp = new Date().toISOString();

      // Update current location state
      setCurrentLocation({ latitude, longitude, timestamp });

      // Get driver ID
      const targetDriverId = driverId || (user?.id ? parseInt(user.id) : 1);

      // Send location to backend
      const response = await locationService.updateLocation(targetDriverId, latitude, longitude, timestamp);
      
      if (response.success) {
        console.log('Location updated successfully:', response.message);
        return true;
      } else {
        console.error('Location update failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Failed to update location manually:', error);
      return false;
    }
  };

  /**
   * Mark Notification as Read
   * 
   * Updates a specific notification's read status via API.
   * 
   * @param {number} id - The notification ID to mark as read
   */
  const markNotificationAsRead = async (id) => {
    try {
      const response = await notificationService.markAsRead(id);
      
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Mark notification read error:', error);
    }
  };

  /**
   * Accept Job
   * 
   * Accepts a job and updates the job status.
   * Automatically starts location tracking when job is accepted.
   * 
   * @param {number} jobId - The ID of the job to accept
   * @returns {Promise<boolean>} Success status
   */
  const acceptJob = async (jobId) => {
    try {
      const response = await jobService.acceptJob(jobId);
      
      if (response.success) {
        // Refresh dashboard data to get updated job statuses
        await loadDashboardData();
        
        // Start location tracking when job is accepted (driver is now on duty)
        if (!isLocationTracking) {
          console.log('Starting location tracking after job acceptance...');
          await startLocationTracking().catch(err => {
            console.error('Failed to start location tracking:', err);
            // Don't fail job acceptance if location tracking fails
          });
        }
        
        return true;
      } else if (response.error === 'HTML_RESPONSE') {
        // API endpoint not available - use local update as fallback
        console.log('Job acceptance API not available, updating locally');
        
        // Update local state - mark job as accepted
        setJobs(prevJobs => {
          if (!prevJobs || !Array.isArray(prevJobs)) return prevJobs || [];
          return prevJobs.map(job => 
            job && job.id === jobId ? { ...job, status: 'accepted' } : job
          );
        });
        
        // Refresh dashboard data to reflect the local change
        await loadDashboardData();
        
        // Start location tracking when job is accepted (driver is now on duty)
        if (!isLocationTracking) {
          console.log('Starting location tracking after job acceptance...');
          await startLocationTracking().catch(err => {
            console.error('Failed to start location tracking:', err);
            // Don't fail job acceptance if location tracking fails
          });
        }
        
        return true; // Return success for graceful fallback
      } else {
        console.error('Accept job error:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Accept job error:', error);
      return false;
    }
  };

  /**
   * Update Job Status
   * 
   * Updates the status of a specific job locally and via API.
   * Automatically starts location tracking when job is accepted.
   * 
   * @param {number} jobId - The ID of the job to update
   * @param {string} newStatus - New status: 'new', 'accepted', 'pickedup', 'delivered'
   */
  const updateJobStatus = async (jobId, newStatus) => {
    try {
      let response;
      
      switch (newStatus) {
        case 'accepted':
          response = await jobService.acceptJob(jobId);
          break;
        case 'pickedup':
          response = await jobService.pickupJob(jobId);
          break;
        case 'delivered':
          response = await jobService.deliverJob(jobId);
          break;
        default:
          console.warn('Unknown job status:', newStatus);
          return false;
      }
      
      if (response.success) {
        // Update local state
        setJobs(prev => {
          if (!prev || !Array.isArray(prev)) return prev || [];
          return prev.map(job => 
            job && job.id === jobId 
              ? { ...job, status: newStatus }
              : job
          );
        });
        
        // Refresh dashboard data for updated counts
        await loadDashboardData();
        
        // Start location tracking when job is accepted (driver is now on duty)
        if (newStatus === 'accepted' && !isLocationTracking) {
          console.log('Starting location tracking after job acceptance...');
          await startLocationTracking().catch(err => {
            console.error('Failed to start location tracking:', err);
            // Don't fail job status update if location tracking fails
          });
        }
        
        return true;
      } else {
        console.error('Update job status error:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Update job status error:', error);
      return false;
    }
  };

  /**
   * Refresh All Data
   * 
   * Refreshes all data from APIs. Useful for pull-to-refresh functionality.
   */
  const refreshAllData = async () => {
    // Load all data in parallel - dashboard always uses driver_id: 1
    await Promise.all([
      loadDriverProfile(),
      loadDashboardData(),
      loadCurrentJobs(),
      loadDriverDocuments(),
      loadNotifications(),
    ]);
  };

  /**
   * Initial Data Load
   * 
   * Authenticate user and load essential data when the app starts.
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // First, try to authenticate the user
        console.log('Initializing app...');
        const isAuthenticated = await authService.autoLogin();
        
        if (isAuthenticated) {
          console.log('User authenticated, loading data...');
          // Load all data in parallel - dashboard always uses driver_id: 1
          await Promise.all([
            loadDriverProfile().catch(err => console.error('Profile load error:', err)),
            loadDashboardData().catch(err => console.error('Dashboard load error:', err)),
            loadCurrentJobs().catch(err => console.error('Current jobs load error:', err)),
            loadDriverDocuments().catch(err => console.error('Documents load error:', err)),
          ]);
        } else {
          console.log('Authentication failed');
          setErrorState('profile', 'Authentication failed. Please check your connection.');
        }
      } catch (error) {
        console.error('App initialization error:', error);
        setErrorState('profile', 'Failed to initialize app. Please restart.');
      }
    };

    initializeApp();
  }, []); // Empty dependency array - only run on mount

  /**
   * Debug: Log dashboardData changes
   * This helps verify that state is updating correctly
   */
  useEffect(() => {
    console.log('=== dashboardData State Changed ===');
    console.log('dashboardData:', JSON.stringify(dashboardData, null, 2));
    console.log('dashboardData.counts:', dashboardData?.counts);
    console.log('dashboardData.counts type:', typeof dashboardData?.counts);
    console.log('dashboardData.counts keys:', dashboardData?.counts ? Object.keys(dashboardData.counts) : 'null');
    console.log('dashboardData.counts.new_order:', dashboardData?.counts?.new_order);
    console.log('dashboardData.counts.accepted:', dashboardData?.counts?.accepted);
    console.log('dashboardData.counts.picked_up:', dashboardData?.counts?.picked_up);
    console.log('dashboardData.counts.delivered:', dashboardData?.counts?.delivered);
    console.log('Computed jobStats would be:', {
      newOrders: dashboardData?.counts?.new_order ?? 0,
      accepted: dashboardData?.counts?.accepted ?? 0,
      pickedup: dashboardData?.counts?.picked_up ?? 0,
      delivered: dashboardData?.counts?.delivered ?? 0,
      cancelled: dashboardData?.counts?.cancelled ?? 0,
    });
    console.log('================================');
  }, [dashboardData]);

  /**
   * Cleanup Location Tracking on Unmount
   * 
   * Ensures location tracking is stopped when app unmounts.
   */
  useEffect(() => {
    return () => {
      // Cleanup location tracking on unmount
      stopLocationTracking();
    };
  }, []); // Empty dependency array - only run on unmount

  /**
   * Job Statistics - Computed from dashboardData
   * 
   * Provides real-time counts from the API dashboard data.
   * Uses useMemo to recompute when dashboardData changes.
   * Explicitly converts to numbers to ensure proper display.
   */
  const jobStats = useMemo(() => {
    const counts = dashboardData?.counts || {};
    
    // Extract and convert to numbers explicitly
    const stats = {
      newOrders: counts.new_order != null ? Number(counts.new_order) : 0,
      accepted: counts.accepted != null ? Number(counts.accepted) : 0,
      pickedup: counts.picked_up != null ? Number(counts.picked_up) : 0,
      delivered: counts.delivered != null ? Number(counts.delivered) : 0,
      cancelled: counts.cancelled != null ? Number(counts.cancelled) : 0,
    };
    
    // Debug logging in development
    if (__DEV__) {
      console.log('=== Computing jobStats (useMemo) ===');
      console.log('dashboardData:', dashboardData);
      console.log('dashboardData.counts:', dashboardData?.counts);
      console.log('Extracted counts object:', counts);
      console.log('counts.new_order:', counts.new_order, 'type:', typeof counts.new_order);
      console.log('counts.accepted:', counts.accepted, 'type:', typeof counts.accepted);
      console.log('counts.picked_up:', counts.picked_up, 'type:', typeof counts.picked_up);
      console.log('counts.delivered:', counts.delivered, 'type:', typeof counts.delivered);
      console.log('Final computed stats:', stats);
      console.log('====================================');
    }
    
    return stats;
  }, [dashboardData]);

  /**
   * Context Value Object
   * 
   * Contains all state values and functions that will be available
   * to components consuming this context.
   */
  const value = {
    // Core state data
    user,                                  // Complete user profile from API
    notifications,                         // All notifications array
    jobs,                                  // All jobs array from dashboard
    currentJobs,                           // Current (active/ongoing) jobs array
    jobDetails,                            // Detailed job/parcel information
    rides,                                 // Rides data by status { [status]: [...rides] }
    documents,                             // Driver documents
    dashboardData,                         // Real-time dashboard data
    loading,                               // Loading states object
    errors,                                // Error states object
    
    // Data loading functions
    loadDriverProfile,                     // Load profile from API
    loadDashboardData,                     // Load dashboard data from API
    loadAllJobs,                           // Load all jobs from API
    loadCurrentJobs,                       // Load current (active) jobs from API
    loadDriverRides,                      // Load rides by status from API
    loadDriverDocuments,                   // Load documents from API
    loadNotifications,                     // Load notifications from API
    refreshAllData,                        // Refresh all data
    
    // State update functions
    updateUserProfile,                     // Update profile via API
    updateDriverDocuments,                 // Update documents via API
    markNotificationAsRead,                // Mark notification as read via API
    updateJobStatus,                       // Update job status via API
    acceptJob,                             // Accept job via API
    markDriverAbsent,                      // Mark driver absent via API
    
    // Location tracking functions
    startLocationTracking,                 // Start continuous location tracking
    stopLocationTracking,                  // Stop location tracking
    updateLocationManually,                // Send location update manually
    isLocationTracking,                    // Location tracking status
    currentLocation,                       // Current GPS coordinates
    locationPermissionStatus,              // Location permission status
    
    // Computed values for quick access
    unreadNotifications: notifications.filter(n => !n.read).length, // Count of unread notifications
    jobStats,                              // Job statistics computed from dashboardData (reactive)
    
    // Helper functions
    isLoading: (operation) => loading[operation],      // Check if operation is loading
    getError: (operation) => errors[operation],        // Get error for operation
    clearError: (operation) => setErrorState(operation, null), // Clear error for operation
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
