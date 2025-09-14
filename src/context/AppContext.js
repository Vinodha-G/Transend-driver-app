/**
 * AppContext.js - Global State Management
 * 
 * This file implements the global state management system for the Driver App using React Context API.
 * It provides centralized state for user data, job management, and notifications across all components.
 * 
 * State Management Features:
 * - User profile data with image management
 * - Job listing with real-time status updates
 * - Notification system with read/unread tracking
 * - Computed statistics for dashboard display
 * - Form validation and error handling
 * 
 * Context Consumers:
 * - All screen components for data access
 * - Common components for display logic
 * - Form components for data updates
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useState } from 'react';

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
 * 
 * State Structure:
 * - user: Complete user profile with personal information
 * - jobs: Array of all jobs with various statuses and details
 * - notifications: Array of notifications with read/unread status
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {JSX.Element} Context provider wrapping children
 */
export const AppProvider = ({ children }) => {
  /**
   * User Profile State
   * 
   * Manages complete user profile information including personal details
   * and profile image. Used throughout the app for personalization.
   */
  const [user, setUser] = useState({
    name: 'John Driver',                   // Driver's full name
    email: 'john.driver@example.com',      // Contact email address
    phone: '+1 234 567 8900',             // Phone number for contact
    profileImage: 'https://via.placeholder.com/150', // Profile photo URL
  });

  /**
   * Notifications State
   * 
   * Array of all notifications with read/unread tracking.
   * Supports different notification types and time tracking.
   */
  const [notifications, setNotifications] = useState([
    {
      id: 1,                               // Unique notification identifier
      title: 'New Job Available',          // Notification headline
      message: 'A new delivery job is available near your location', // Detailed message
      time: '5 mins ago',                  // Human-readable time since notification
      read: false,                         // Read status for UI indication
    },
    {
      id: 2,
      title: 'Job Completed',
      message: 'Your delivery to Toronto has been marked as completed',
      time: '1 hour ago',
      read: true,                          // Already read notification
    },
  ]);

  /**
   * Jobs State
   * 
   * Array of all jobs with comprehensive details and status tracking.
   * Supports multiple job statuses for workflow management.
   * 
   * Job Status Flow: new → accepted → pickedup → delivered
   */
  const [jobs, setJobs] = useState([
    {
      id: 1,                               // Unique job identifier
      companyName: 'Muthu & Co',          // Client company name
      orderId: '15612',                    // Company's order reference
      type: 'LTL',                         // Job type (LTL = Less Than Truckload)
      dateTime: '15 May\'25 at 10:15 AM',  // Scheduled pickup date/time
      profileImage: 'https://via.placeholder.com/50', // Company logo/image
      pickupLocation: '17, Yonge St, Toronto, Canada',   // Pickup address
      dropoffLocation: '20, Yonge St, Toronto, Canada',  // Delivery address
      status: 'new',                       // Current job status
    },
    {
      id: 2,
      companyName: 'MVP',
      orderId: '89142',
      type: 'LTL',
      dateTime: '15 May\'25 at 10:15 AM',
      profileImage: 'https://via.placeholder.com/50',
      pickupLocation: '17, Yonge St, Toronto, Canada',
      dropoffLocation: '20, Yonge St, Toronto, Canada',
      status: 'accepted',                  // Driver has accepted this job
    },
    {
      id: 3,
      companyName: 'ULINE',
      orderId: '51616',
      type: 'LTL',
      dateTime: '15 May\'25 at 10:15 AM',
      profileImage: 'https://via.placeholder.com/50',
      pickupLocation: '17, Yonge St, Toronto, Canada',
      dropoffLocation: '20, Yonge St, Toronto, Canada',
      status: 'pickedup',                  // Package has been picked up
    },
  ]);

  /**
   * Mark Notification as Read
   * 
   * Updates a specific notification's read status to true.
   * Used when user opens or interacts with notifications.
   * 
   * @param {number} id - The notification ID to mark as read
   */
  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }   // Mark this notification as read
          : notification                      // Keep other notifications unchanged
      )
    );
  };

  /**
   * Update Job Status
   * 
   * Updates the status of a specific job in the workflow.
   * Used throughout the app when drivers progress through job stages.
   * 
   * @param {number} jobId - The ID of the job to update
   * @param {string} newStatus - New status: 'new', 'accepted', 'pickedup', 'delivered'
   */
  const updateJobStatus = (jobId, newStatus) => {
    setJobs(prev => 
      prev.map(job => 
        job.id === jobId 
          ? { ...job, status: newStatus }     // Update status for matching job
          : job                               // Keep other jobs unchanged
      )
    );
  };

  /**
   * Update User Profile
   * 
   * Updates user profile information with new data.
   * Commonly used by profile settings screen for personal information updates.
   * 
   * @param {Object} updates - Object containing fields to update
   * @example
   * updateUserProfile({ name: 'John Doe', phone: '+1-555-0123' })
   */
  const updateUserProfile = (updates) => {
    setUser(prev => ({ 
      ...prev,        // Keep existing user data
      ...updates      // Merge in new updates
    }));
  };

  /**
   * Context Value Object
   * 
   * Contains all state values and functions that will be available
   * to components consuming this context.
   */
  const value = {
    // Core state data
    user,                                  // Complete user profile
    notifications,                         // All notifications array
    jobs,                                  // All jobs array
    
    // State update functions
    markNotificationAsRead,                // Function to mark notifications as read
    updateJobStatus,                       // Function to update job status
    updateUserProfile,                     // Function to update user profile
    
    // Computed values for quick access
    unreadNotifications: notifications.filter(n => !n.read).length, // Count of unread notifications
    
    /**
     * Job Statistics Object
     * 
     * Provides real-time counts of jobs by status for dashboard display.
     * Automatically recalculates when jobs array changes.
     */
    jobStats: {
      newOrders: jobs.filter(j => j.status === 'new').length,        // New job requests
      accepted: jobs.filter(j => j.status === 'accepted').length,    // Accepted but not picked up
      pickedup: jobs.filter(j => j.status === 'pickedup').length,    // Picked up, in transit
      delivered: jobs.filter(j => j.status === 'delivered').length,  // Completed deliveries
    }
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
