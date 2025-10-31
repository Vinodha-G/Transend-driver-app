/**
 * Driver API Services
 * 
 * This file contains all API service functions related to driver operations.
 * It provides a clean interface for components to interact with driver APIs
 * without worrying about the underlying HTTP implementation.
 * 
 * Features:
 * - Driver profile management
 * - Document handling
 * - Dashboard data
 * - Attendance management
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import apiClient, { handleApiResponse, createFormData } from './client';
import { ENDPOINTS } from './endpoints';
import { logApiError, getUserFriendlyMessage, ERROR_CATEGORIES } from '../utils/errorLogger';

/**
 * Driver API Service Class
 * 
 * Contains all driver-related API methods.
 * Each method returns a standardized response format: { success, message, data, error? }
 */
export const driverService = {
  /**
   * Get Driver Profile
   * 
   * Retrieves the complete driver profile information using authenticated API call.
   * 
   * API: GET /driver/profile
   * Request: { "driver_id": 1 } (as query param or body)
   * Headers: Authorization: Bearer {token}
   * Response: { success: true, message: "Delivery Man", data: { user: {...}, meta: {...} } }
   * 
   * @param {number} [driverId=1] - Optional driver ID (defaults to 1)
   * @returns {Promise<Object>} Driver profile data with user and meta information
   */
  getProfile: async (driverId = 1) => {
    try {
      console.log(`🔵 [API] GET /driver/profile - driver_id=${driverId}`);
      
      // Try GET with query parameters first (standard HTTP approach)
      let response;
      try {
        response = await apiClient.get(ENDPOINTS.DRIVER.PROFILE, {
          params: { driver_id: driverId }
        });
        console.log('Profile API response (GET with params):', response.data);
      } catch (getError) {
        // If GET with params fails, try POST with body (some APIs require this)
        console.log('GET with params failed, trying POST with body...', getError.response?.status);
        response = await apiClient.post(ENDPOINTS.DRIVER.PROFILE, {
          driver_id: driverId
        });
        console.log('Profile API response (POST with body):', response.data);
      }
      
      return await handleApiResponse(Promise.resolve(response));
    } catch (error) {
      console.error('Profile API error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
      });
      
      // If unauthorized, the auth service will handle token refresh
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }
      
      // For other errors, provide a meaningful message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to fetch profile';
      throw new Error(errorMessage);
    }
  },

  /**
   * Update Driver Profile
   * 
   * Updates driver profile information with new data using authenticated API call.
   * 
   * API: POST /driver/profile/update
   * Body: { driver_id, first_name, last_name, phone }
   * Headers: Authorization: Bearer {token}
   * Response: { success: true, message: "Profile updated successfully", data: { user: {...}, meta: {...} } }
   * 
   * @param {Object} profileData - Updated profile information
   * @param {number} profileData.driver_id - Driver ID (required)
   * @param {string} profileData.first_name - Driver's first name (required)
   * @param {string} profileData.last_name - Driver's last name (required) 
   * @param {string} profileData.phone - Driver's phone number (required)
   * @param {string} [profileData.email] - Driver's email address (optional, may be included in request)
   * @param {string} [profileData.address] - Driver's address (optional, may be included in request)
   * @returns {Promise<Object>} Update result with updated user data and meta information
   */
  updateProfile: async (profileData) => {
    try {
      const driverId = profileData.driver_id || 1;
      console.log(`🟢 [API] POST /driver/profile/update - driver_id=${driverId}`);
      
      // Build request body matching API specification
      // Required fields: driver_id, first_name, last_name, phone
      const updateData = {
        driver_id: driverId,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone,
        // Include optional fields if provided
        ...(profileData.email && { email: profileData.email }),
        ...(profileData.address && { address: profileData.address }),
      };
      
      console.log('Profile update request:', updateData);
      const response = await apiClient.post(ENDPOINTS.DRIVER.PROFILE_UPDATE, updateData);
      console.log('Profile update response:', response.data);
      
      return await handleApiResponse(Promise.resolve(response));
    } catch (error) {
      console.error('Profile update error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
      });
      
      // If unauthorized, the auth service will handle token refresh
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }
      
      // For validation errors, provide specific feedback
      if (error.response?.status === 422 && error.response?.data?.data) {
        const validationErrors = error.response.data.data;
        const errorMessages = Object.values(validationErrors).flat();
        throw new Error(errorMessages.join(', '));
      }
      
      // For other errors, provide a meaningful message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to update profile';
      throw new Error(errorMessage);
    }
  },

  /**
   * Get Driver Documents
   * 
   * Retrieves all uploaded documents for the driver using authenticated API call.
   * 
   * API: GET /driver/documents with body { driver_id }
   * Headers: Authorization: Bearer {token}
   * Response: { success: true, message: "Documents retrieved successfully", data: { documents: {...} } }
   * 
   * @returns {Promise<Object>} Driver documents data with all document statuses
   */
  getDocuments: async () => {
    try {
      const driverId = 1; // Always use driver_id=1 for documents
      console.log(`🔵 [API] GET /driver/documents - driver_id=${driverId}`);
      
      const response = await apiClient.get(ENDPOINTS.DRIVER.DOCUMENTS, {
        params: { driver_id: driverId }
      });
      
      console.log('Documents API response:', response.data);
      return await handleApiResponse(Promise.resolve(response));
    } catch (error) {
      console.error('Documents API error:', error.response?.data || error.message);
      
      // If unauthorized, the auth service will handle token refresh
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }
      
      // For other errors, provide a meaningful message
      throw new Error(error.response?.data?.message || 'Failed to fetch documents');
    }
  },

  /**
   * Update Driver Documents
   * 
   * Uploads or updates driver documents (license, insurance, etc.) using multipart/form-data.
   * 
   * API: POST /driver/documents/update
   * Content-Type: multipart/form-data
   * Body: FormData with driver_id (text) and document files (files)
   * Headers: Authorization: Bearer {token}
   * Response: { success: true, message: "Documents updated successfully", data: { documents: {...}, meta: {...} } }
   * 
   * @param {Object} documents - Document files to upload
   * @param {number} documents.driver_id - Driver ID (required)
   * @param {Object} [documents.driver_license_front] - Front of driver license file { uri, type, name }
   * @param {Object} [documents.driver_license_back] - Back of driver license file { uri, type, name }
   * @param {Object} [documents.insurance] - Insurance document file { uri, type, name }
   * @param {Object} [documents.mv1_report] - MV1 report file { uri, type, name }
   * @param {Object} [documents.incident_report] - Incident report file { uri, type, name }
   * @param {Object} [documents.cuse_logbook] - CUSE logbook file { uri, type, name }
   * @returns {Promise<Object>} Upload result with documents and meta data
   */
  updateDocuments: async (documents) => {
    try {
      const driverId = documents.driver_id || 1;
      console.log(`🟢 [API] POST /driver/documents/update - driver_id=${driverId}`, {
        documentKeys: Object.keys(documents).filter(key => key !== 'driver_id'),
      });
      
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      
      // Add driver_id as text field (required)
      formData.append('driver_id', String(driverId));
      
      // Add each document file if provided
      // Document keys: driver_license_front, driver_license_back, insurance, mv1_report, incident_report, cuse_logbook
      const documentKeys = [
        'driver_license_front',
        'driver_license_back',
        'insurance',
        'mv1_report',
        'incident_report',
        'cuse_logbook'
      ];
      
      documentKeys.forEach(key => {
        if (documents[key] && documents[key].uri) {
          const file = documents[key];
          
          // Ensure URI is properly formatted for React Native
          // Handle both file:// and content:// URIs, and ensure proper encoding
          let fileUri = file.uri;
          
          // For React Native, ensure the URI is properly formatted
          // If it's already a file:// or content:// URI, use it as is
          // Otherwise, ensure it's a valid local file path
          if (!fileUri.startsWith('file://') && !fileUri.startsWith('content://') && !fileUri.startsWith('ph://')) {
            // If it's a relative path, it should already be handled by expo-document-picker
            // But let's ensure it's accessible
            fileUri = file.uri;
          }
          
          // Determine MIME type based on file extension if not provided
          let mimeType = file.type || file.mimeType;
          if (!mimeType) {
            const extension = (file.name || fileUri).split('.').pop()?.toLowerCase();
            if (extension === 'pdf') {
              mimeType = 'application/pdf';
            } else if (['jpg', 'jpeg'].includes(extension)) {
              mimeType = 'image/jpeg';
            } else if (extension === 'png') {
              mimeType = 'image/png';
            } else {
              mimeType = 'application/pdf'; // Default
            }
          }
          
          // Ensure filename has proper extension
          let fileName = file.name || `${key}.${mimeType.includes('pdf') ? 'pdf' : 'jpg'}`;
          
          // React Native FormData expects object with uri, type, and name
          // Format: { uri: string, type: string, name: string }
          formData.append(key, {
            uri: fileUri,
            type: mimeType,
            name: fileName,
          });
          
          console.log(`Added ${key} to FormData:`, {
            name: fileName,
            type: mimeType,
            uri: fileUri.substring(0, 50) + '...', // Log partial URI for debugging
          });
        }
      });
      
      console.log('FormData prepared, sending request...');
      console.log('FormData entries count:', formData._parts?.length || 'unknown');
      
      // For file uploads, increase timeout and ensure proper headers
      // React Native FormData requires NO Content-Type header - it sets it automatically with boundary
      // The interceptor already removes Content-Type for FormData
      const response = await apiClient.post(
        ENDPOINTS.DRIVER.DOCUMENTS_UPDATE, 
        formData,
        {
          timeout: 120000, // 2 minutes timeout for file uploads (large files may take time)
          // Do NOT set Content-Type header - React Native handles this automatically
          // Authorization header is added by interceptor
          maxContentLength: Infinity, // Allow large file uploads
          maxBodyLength: Infinity, // Allow large request bodies
        }
      );
      
      console.log('Documents update response:', response.data);
      return await handleApiResponse(Promise.resolve(response));
    } catch (error) {
      console.error('Update documents error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
      });
      
      // If unauthorized, the auth service will handle token refresh
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }
      
      // For validation errors, provide specific feedback
      if (error.response?.status === 422 && error.response?.data?.data) {
        const validationErrors = error.response.data.data;
        const errorMessages = Object.values(validationErrors).flat();
        throw new Error(errorMessages.join(', '));
      }
      
      // For other errors, provide a meaningful message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to update documents';
      throw new Error(errorMessage);
    }
  },

  /**
   * Get Driver Dashboard
   * 
   * Retrieves dashboard data including job counts and new jobs using authenticated API call.
   * 
   * API: GET /driver/dashboard
   * Request: { "driver_id": 1 } (as query param or body)
   * Headers: Authorization: Bearer {token}
   * Response: { success: true, message: "Delivery Man", data: { counts: {...}, new_jobs: [...], meta: {...} } }
   * 
   * @param {number} [driverId=1] - Optional driver ID (defaults to 1)
   * @returns {Promise<Object>} Dashboard data with job statistics, new jobs, and meta information
   */
  getDashboard: async (driverId = 1) => {
    try {
      console.log(`🔵 [API] GET/POST /driver/dashboard - driver_id=${driverId}`);
      
      // Try GET with query parameters first (standard HTTP approach)
      let response;
      try {
        response = await apiClient.get(ENDPOINTS.DRIVER.DASHBOARD, {
          params: { driver_id: driverId }
        });
        console.log('Dashboard API response (GET with params):', response.data);
      } catch (getError) {
        // If GET with params fails, try POST with body (some APIs require this)
        console.log('GET with params failed, trying POST with body...', getError.response?.status);
        response = await apiClient.post(ENDPOINTS.DRIVER.DASHBOARD, {
          driver_id: driverId
        });
        console.log('Dashboard API response (POST with body):', response.data);
      }
      
      // Log raw response before handleApiResponse
      console.log('=== Dashboard Service - Raw Axios Response ===');
      console.log('response.status:', response.status);
      console.log('response.data:', JSON.stringify(response.data, null, 2));
      console.log('response.data.success:', response.data?.success);
      console.log('response.data.data:', response.data?.data);
      console.log('response.data.data.counts:', response.data?.data?.counts);
      console.log('===============================================');
      
      const processedResponse = await handleApiResponse(Promise.resolve(response));
      
      // Log processed response
      console.log('=== Dashboard Service - Processed Response ===');
      console.log('processedResponse:', JSON.stringify(processedResponse, null, 2));
      console.log('processedResponse.success:', processedResponse.success);
      console.log('processedResponse.data:', processedResponse.data);
      console.log('processedResponse.data.counts:', processedResponse.data?.counts);
      console.log('===============================================');
      
      return processedResponse;
    } catch (error) {
      console.error('Dashboard API error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
      });
      
      // If unauthorized, the auth service will handle token refresh
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }
      
      // For other errors, provide a meaningful message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to fetch dashboard data';
      throw new Error(errorMessage);
    }
  },

  /**
   * Mark Driver as Absent
   * 
   * Marks the driver as absent and updates parcel assignments.
   * 
   * API: POST /driver/mark-absent
   * Request Body: { driver_id: number, absent_date: "YYYY-MM-DD" }
   * Headers: Authorization: Bearer {token}
   * Response: { success: true, message: "Driver marked absent and parcels updated successfully.", data: { meta: {...} } }
   * 
   * @param {number} driverId - Driver ID (required)
   * @param {string} absentDate - Absence date in YYYY-MM-DD format (required)
   * @returns {Promise<Object>} Absence marking result with success status and message
   */
  markAbsent: async (driverId, absentDate) => {
    try {
      console.log(`🟢 [API] POST /driver/mark-absent - driver_id=${driverId}, absent_date=${absentDate}`);
      
      // Validate inputs
      if (!driverId || !absentDate) {
        throw new Error('Driver ID and absent date are required');
      }

      // Format date to YYYY-MM-DD if needed
      let formattedDate = absentDate;
      if (absentDate instanceof Date) {
        formattedDate = absentDate.toISOString().split('T')[0];
      } else if (typeof absentDate === 'string') {
        // Ensure date is in YYYY-MM-DD format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(absentDate)) {
          // Try to parse and reformat if in different format
          const parsedDate = new Date(absentDate);
          if (!isNaN(parsedDate.getTime())) {
            formattedDate = parsedDate.toISOString().split('T')[0];
          } else {
            throw new Error('Invalid date format. Please use YYYY-MM-DD format.');
          }
        }
      }

      const requestBody = {
        driver_id: driverId,
        absent_date: formattedDate,
      };

      console.log('Marking driver as absent...', requestBody);

      const response = await apiClient.post(ENDPOINTS.DRIVER.MARK_ABSENT, requestBody);
      
      console.log('Mark absent API response:', response.data);
      return await handleApiResponse(Promise.resolve(response));
    } catch (error) {
      console.error('Mark absent API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }

      if (error.response?.status === 422 && error.response?.data?.data) {
        const validationErrors = error.response.data.data;
        const errorMessages = Object.values(validationErrors).flat();
        throw new Error(errorMessages.join(', '));
      }

      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to mark driver as absent';
      throw new Error(errorMessage);
    }
  },

        /**
         * Get Current Jobs
         * 
         * Fetches the list of current (active/ongoing) delivery jobs assigned to a specific driver.
         * 
         * API: POST /driver/current-jobs
         * Request Body: { driver_id: number }
         * Headers: Authorization: Bearer {token}
         * Response: { success: true, message: "dashboard.current_jobs", data: { jobs: [...], meta: {...} } }
         * 
         * @param {number} driverId - Driver ID (required)
         * @returns {Promise<Object>} Current jobs data with jobs array and meta information
         */
        getCurrentJobs: async (driverId) => {
          try {
            console.log(`🔵 [API] POST /driver/current-jobs - driver_id=${driverId}`);
            
            if (!driverId) {
              throw new Error('Driver ID is required');
            }

            const requestBody = {
              driver_id: driverId,
            };

            const response = await apiClient.post(ENDPOINTS.DRIVER.CURRENT_JOBS, requestBody);
            
            console.log('Current jobs API response:', response.data);
            return await handleApiResponse(Promise.resolve(response));
          } catch (error) {
            console.error('Current jobs API error:', {
              status: error.response?.status,
              data: error.response?.data,
              message: error.message,
            });

            if (error.response?.status === 401) {
              throw new Error('Authentication required. Please login again.');
            }

            if (error.response?.status === 422 && error.response?.data?.data) {
              const validationErrors = error.response.data.data;
              const errorMessages = Object.values(validationErrors).flat();
              throw new Error(errorMessages.join(', '));
            }

            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.error || 
                                error.message || 
                                'Failed to fetch current jobs';
            throw new Error(errorMessage);
          }
        },

        /**
         * Get Job Details
         * 
         * Fetches detailed information about a specific delivery job or parcel assigned to the driver.
         * 
         * API: POST /driver/job-details
         * Request Body: { driver_id: number, parcel_id: number }
         * Headers: Authorization: Bearer {token}
         * Response: { success: true, message: "dashboard.job_details", data: { job: {...}, meta: {...} } }
         * 
         * @param {number} driverId - Driver ID (required)
         * @param {number} parcelId - Parcel/Job ID (required)
         * @returns {Promise<Object>} Job details data with job object and meta information
         */
        getJobDetails: async (driverId, parcelId) => {
          try {
            console.log(`🔵 [API] POST /driver/job-details - driver_id=${driverId}, parcel_id=${parcelId}`);
            
            if (!driverId || !parcelId) {
              throw new Error('Driver ID and parcel ID are required');
            }

            const requestBody = {
              driver_id: driverId,
              parcel_id: parcelId,
            };

            const response = await apiClient.post(ENDPOINTS.DRIVER.JOB_DETAILS, requestBody);
            
            console.log('Job details API response:', response.data);
            return await handleApiResponse(Promise.resolve(response));
          } catch (error) {
            console.error('Job details API error:', {
              status: error.response?.status,
              data: error.response?.data,
              message: error.message,
            });

            if (error.response?.status === 401) {
              throw new Error('Authentication required. Please login again.');
            }

            if (error.response?.status === 422 && error.response?.data?.data) {
              const validationErrors = error.response.data.data;
              const errorMessages = Object.values(validationErrors).flat();
              throw new Error(errorMessages.join(', '));
            }

            if (error.response?.status === 404) {
              throw new Error('Job details not found. The parcel may have been removed or does not exist.');
            }

            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.error || 
                                error.message || 
                                'Failed to fetch job details';
            throw new Error(errorMessage);
          }
        },

        /**
         * Get Driver Rides
         * 
         * Retrieves driver rides filtered by status.
         * 
         * API: POST /driver/my-rides
         * Request Body: { driver_id: number, status: string }
         * Headers: Authorization: Bearer {token}
         * Response: { success: true, message: "dashboard.my_rides", data: { rides: [...], meta: {...} } }
         * 
         * @param {number} driverId - Driver ID (required)
         * @param {string} status - Ride status filter (e.g., "delivered", "accepted", "picked_up", "cancelled")
         * @returns {Promise<Object>} Rides data with rides array and meta information
         */
        getDriverRides: async (driverId, status) => {
    try {
      console.log(`🔵 [API] POST /driver/my-rides - driver_id=${driverId}, status=${status}`);
      
      // Validate inputs
      if (!driverId || !status) {
        throw new Error('Driver ID and status are required');
      }

      const requestBody = {
        driver_id: driverId,
        status: status,
      };

      const response = await apiClient.post(ENDPOINTS.DRIVER.MY_RIDES, requestBody);
      
      console.log('My rides API response:', response.data);
      return await handleApiResponse(Promise.resolve(response));
    } catch (error) {
      console.error('My rides API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }

      // Handle validation errors (422)
      if (error.response?.status === 422) {
        const validationData = error.response?.data?.data;
        if (validationData && typeof validationData === 'object') {
          // Extract validation error messages
          const errorMessages = Object.values(validationData).flat().filter(msg => msg);
          const validationMsg = errorMessages.length > 0 
            ? `Validation failed: ${errorMessages.join(', ')}`
            : error.response?.data?.message || 'Validation failed. Please check your input.';
          throw new Error(validationMsg);
        } else {
          throw new Error(error.response?.data?.message || 'Validation failed. Please check your input.');
        }
      }

      // Handle other errors
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to fetch driver rides';
      throw new Error(errorMessage);
    }
  },

  /**
   * Upload Profile Image
   * 
   * Uploads a new profile image for the driver.
   * 
   * @param {File} imageFile - Image file to upload
   * @returns {Promise<Object>} Upload result
   */
  uploadProfileImage: async (imageFile) => {
    const formData = createFormData({ profile_image: imageFile });
    
    return handleApiResponse(
      apiClient.post(ENDPOINTS.UPLOAD.PROFILE_IMAGE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    );
  },
};

/**
 * Job API Service Class
 * 
 * Contains job-related API methods for job management and status updates.
 */
export const jobService = {
  /**
   * Get Job List
   * 
   * Retrieves list of jobs assigned to the driver.
   * 
   * @param {Object} filters - Optional filters for job list
   * @param {string} filters.status - Filter by job status
   * @param {number} filters.limit - Limit number of results
   * @returns {Promise<Object>} Job list data
   */
  getJobs: async (filters = {}) => {
    return handleApiResponse(
      apiClient.get(ENDPOINTS.JOBS.LIST, { params: filters })
    );
  },

  /**
   * Accept Job
   * 
   * Accepts a job assignment.
   * 
   * @param {number} jobId - ID of the job to accept
   * @returns {Promise<Object>} Accept result
   */
  acceptJob: async (jobId) => {
    return handleApiResponse(
      apiClient.post(ENDPOINTS.JOBS.ACCEPT.replace('{id}', jobId))
    );
  },

  /**
   * Mark Job as Picked Up
   * 
   * Updates job status to picked up.
   * 
   * @param {number} jobId - ID of the job
   * @param {Object} pickupData - Pickup information
   * @returns {Promise<Object>} Pickup result
   */
  pickupJob: async (jobId, pickupData = {}) => {
    return handleApiResponse(
      apiClient.post(ENDPOINTS.JOBS.PICKUP.replace('{id}', jobId), pickupData)
    );
  },

  /**
   * Mark Job as Delivered
   * 
   * Updates job status to delivered.
   * 
   * @param {number} jobId - ID of the job
   * @param {Object} deliveryData - Delivery information
   * @returns {Promise<Object>} Delivery result
   */
  deliverJob: async (jobId, deliveryData = {}) => {
    return handleApiResponse(
      apiClient.post(ENDPOINTS.JOBS.DELIVER.replace('{id}', jobId), deliveryData)
    );
  },
};

/**
 * Notification API Service Class
 * 
 * Contains notification-related API methods.
 */
export const notificationService = {
  /**
   * Get Notifications
   * 
   * Retrieves list of notifications for the driver.
   * 
   * @returns {Promise<Object>} Notifications list
   */
  getNotifications: async () => {
    return handleApiResponse(
      apiClient.get(ENDPOINTS.NOTIFICATIONS.LIST)
    );
  },

  /**
   * Mark Notification as Read
   * 
   * Marks a specific notification as read.
   * 
   * @param {number} notificationId - ID of the notification
   * @returns {Promise<Object>} Mark read result
   */
  markAsRead: async (notificationId) => {
    return handleApiResponse(
      apiClient.post(ENDPOINTS.NOTIFICATIONS.MARK_READ.replace('{id}', notificationId))
    );
  },

  /**
   * Mark All Notifications as Read
   * 
   * Marks all notifications as read.
   * 
   * @returns {Promise<Object>} Mark all read result
   */
  markAllAsRead: async () => {
    return handleApiResponse(
      apiClient.post(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)
    );
  },
};

/**
 * Location API Service Class
 * 
 * Contains location-related API methods for real-time tracking.
 */
export const locationService = {
  /**
   * Update Driver Location
   * 
   * Publishes driver's live location to Kafka topic for real-time tracking.
   * 
   * API: POST /driver/location
   * Request Body: { driver_id: number, latitude: number, longitude: number, timestamp: string }
   * Headers: Authorization: Bearer {token}
   * Response: { success: true, message: "Location published to Kafka topic: transend.driver.livetracker", data: {...} }
   * 
   * @param {number} driverId - Driver ID (required)
   * @param {number} latitude - Latitude coordinate (required)
   * @param {number} longitude - Longitude coordinate (required)
   * @param {string} [timestamp] - ISO 8601 timestamp (optional, defaults to current time)
   * @returns {Promise<Object>} Location update result with success status and message
   */
  updateLocation: async (driverId, latitude, longitude, timestamp) => {
    try {
      console.log(`🟢 [API] POST /driver/location - driver_id=${driverId}, lat=${latitude}, lng=${longitude}`);
      
      // Validate inputs
      if (!driverId || latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
        throw new Error('Driver ID, latitude, and longitude are required');
      }

      // Use provided timestamp or generate current ISO 8601 timestamp
      const locationTimestamp = timestamp || new Date().toISOString();

      const requestBody = {
        driver_id: driverId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        timestamp: locationTimestamp,
      };

      console.log('Updating driver location...', {
        driver_id: driverId,
        latitude: requestBody.latitude,
        longitude: requestBody.longitude,
        timestamp: locationTimestamp,
      });

      const response = await apiClient.post(ENDPOINTS.LOCATION.UPDATE, requestBody);
      
      console.log('Location update API response:', response.data);
      return await handleApiResponse(Promise.resolve(response));
    } catch (error) {
      console.error('Location update API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }

      if (error.response?.status === 422 && error.response?.data?.data) {
        const validationErrors = error.response.data.data;
        const errorMessages = Object.values(validationErrors).flat();
        throw new Error(errorMessages.join(', '));
      }

      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to update location';
      throw new Error(errorMessage);
    }
  },
};

// Export all services
export default {
  driver: driverService,
  job: jobService,
  notification: notificationService,
  location: locationService,
};
