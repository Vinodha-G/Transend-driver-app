/**
 * CurrentJobScreen.js - Active Job Dashboard with API Integration
 * 
 * Displays the driver's currently active job with status tracking and action controls.
 * Provides a comprehensive view of job details, customer information, locations, and
 * job management actions. Handles empty state when no active jobs are available.
 * Now integrated with real API services for data fetching and job status updates.
 * 
 * Features:
 * - Current job status display with visual indicators
 * - Customer and job information card
 * - Pickup and dropoff location display
 * - Job action buttons for workflow management
 * - Navigation integration for map view and details
 * - Empty state handling with motivational messaging
 * - Loading states and error handling
 * - Real-time job status updates via API
 * - Pull-to-refresh functionality
 * 
 * Job Status Flow:
 * - accepted: Job accepted, ready to start
 * - pickedup: Package picked up, in transit
 * - delivered: Job completed
 * 
 * Navigation:
 * - Tab screen accessible from bottom navigation
 * - Links to JobDetails screen for full information
 * - Links to Notification screen via header
 * 
 * Data Sources:
 * - Global app context with API integration
 * - Real-time dashboard data from API
 * - Job status tracking with server sync
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/common/Header';
import { useApp } from '../context/AppContext';
import { colors, commonStyles } from '../styles/commonStyles';

/**
 * CurrentJobScreen Component
 * 
 * Main dashboard for displaying and managing the driver's currently active job.
 * Shows job details, status, and provides action controls for job workflow.
 * Now includes API integration, loading states, and error handling.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.navigation - React Navigation object for screen navigation
 * @returns {JSX.Element} CurrentJobScreen component
 */
const CurrentJobScreen = ({ navigation }) => {
  // Get data and functions from global context
  const {
    jobs,
    unreadNotifications,
    dashboardData,
    loading,
    errors,
    loadDashboardData,
    updateJobStatus,
    refreshAllData,
    isLoading,
    getError,
    clearError
  } = useApp();

  // Local loading state for job actions
  const [actionLoading, setActionLoading] = useState(false);

  /**
   * Screen Focus Effect
   * 
   * Refreshes dashboard data when screen comes into focus.
   * Ensures user always sees the latest job information.
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboardData();
    });

    return unsubscribe;
  }, [navigation, loadDashboardData]);

  /**
   * Current Job Selection
   * 
   * Finds the active job from the jobs array. Priority order:
   * 1. Jobs with 'accepted' status (newly accepted)
   * 2. Jobs with 'pickedup' status (in progress)
   * 
   * For API integration, we also check dashboardData.new_jobs
   */
  const currentJob = jobs.find(job => job.status === 'accepted') || 
                    jobs.find(job => job.status === 'pickedup') ||
                    (dashboardData.new_jobs && dashboardData.new_jobs.length > 0 ? dashboardData.new_jobs[0] : null);

  /**
   * Handle Menu Press
   * 
   * Handles the menu button press in header.
   * Currently logs action - can be extended for drawer navigation.
   */
  const handleMenuPress = () => {
    console.log('Menu pressed');
  };

  /**
   * Handle Notification Press
   * 
   * Navigates to the notification screen when notification icon is pressed.
   */
  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  /**
   * Handle Job Action with API Integration
   * 
   * Handles job workflow actions with real API calls and loading states.
   * Updates job status via API and provides user feedback.
   * 
   * @param {string} action - The job action to perform (start, pickup, deliver, etc.)
   */
  const handleJobAction = async (action) => {
    if (!currentJob) return;

    setActionLoading(true);
    
    try {
      let success = false;
      let newStatus = '';
      
      switch (action) {
        case 'start':
          // Start job - mark as picked up
          newStatus = 'pickedup';
          success = await updateJobStatus(currentJob.id, newStatus);
          break;
          
        case 'complete':
          // Complete job - mark as delivered
          newStatus = 'delivered';
          success = await updateJobStatus(currentJob.id, newStatus);
          break;
          
        default:
          console.warn('Unknown job action:', action);
          break;
      }
      
      if (success) {
        Alert.alert(
          'Success',
          `Job ${action === 'start' ? 'started' : 'completed'} successfully!`,
          [{ text: 'OK' }]
        );
        
        // Refresh dashboard data to get latest job counts
        await loadDashboardData();
      } else {
        Alert.alert(
          'Error',
          `Failed to ${action} job. Please try again.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Job action error:', error);
      Alert.alert(
        'Error',
        `An error occurred while trying to ${action} the job.`,
        [{ text: 'OK' }]
      );
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle View Details
   * 
   * Navigates to the JobDetails screen with the current job data.
   * Only navigates if there is an active job.
   */
  const handleViewDetails = () => {
    if (currentJob) {
      navigation.navigate('JobDetails', { job: currentJob });
    }
  };

  /**
   * Handle Pull to Refresh
   * 
   * Refreshes all data when user pulls down on the screen.
   */
  const handleRefresh = async () => {
    await refreshAllData();
  };

  /**
   * Show Error Alert
   * 
   * Displays error messages with retry option.
   */
  const showErrorAlert = (operation) => {
    const error = getError(operation);
    if (error) {
      Alert.alert(
        'Error',
        error,
        [
          { text: 'Cancel', onPress: () => clearError(operation) },
          { text: 'Retry', onPress: () => loadDashboardData() }
        ]
      );
    }
  };

  // Show error alert for dashboard errors
  useEffect(() => {
    if (getError('dashboard')) {
      showErrorAlert('dashboard');
    }
  }, [getError('dashboard')]);

  /**
   * Loading State Render
   * 
   * Shows loading indicator while fetching dashboard data.
   */
  if (isLoading('dashboard') && !currentJob) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <Header
          onMenuPress={handleMenuPress}
          onNotificationPress={handleNotificationPress}
          showNotificationBadge={unreadNotifications > 0}
        />
        
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={40} color={colors.themeColor} />
          <Text style={styles.loadingText}>Loading job data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Empty State Render
   * 
   * Displays when no active jobs are available.
   * Shows motivational messaging and icon to encourage driver engagement.
   */
  if (!currentJob) {
    return (
      <SafeAreaView style={commonStyles.container}>
        {/* Header with menu and notifications */}
        <Header
          onMenuPress={handleMenuPress}
          onNotificationPress={handleNotificationPress}
          showNotificationBadge={unreadNotifications > 0}
        />
        
        {/* Empty state content */}
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={80} color={colors.contentColor} />
          <Text style={styles.emptyTitle}>No Active Job</Text>
          <Text style={styles.emptyMessage}>
            You don't have any active jobs at the moment. Check back later for new opportunities.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Main Active Job Content
   * 
   * Displays comprehensive job information when an active job is available.
   * Includes status tracking, job details, and action controls.
   */
  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header with menu and notifications */}
      <Header
        onMenuPress={handleMenuPress}
        onNotificationPress={handleNotificationPress}
        showNotificationBadge={unreadNotifications > 0}
      />
      
      {/* Scrollable job content with pull-to-refresh */}
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isLoading('dashboard')}
            onRefresh={handleRefresh}
            colors={[colors.themeColor]}
            tintColor={colors.themeColor}
          />
        }
      >
        <View style={[commonStyles.customContainer, styles.container]}>
          
          {/* Current Job Status Section */}
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>Current Job Status</Text>
            {/* Dynamic status badge with color coding */}
            <View style={[styles.statusBadge, styles[`${currentJob.status || 'new'}Status`]]}>
              <Text style={styles.statusText}>
                {(currentJob.status || 'new').toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Job Information Card */}
          <View style={styles.jobCard}>
            {/* Job Header with company info */}
            <View style={styles.jobHeader}>
              <Image
                source={
                  currentJob.profileImage && currentJob.profileImage.trim() !== '' 
                    ? { uri: currentJob.profileImage }
                    : require('../../assets/images/profile/p1.png')
                }
                style={styles.companyImage}
              />
              <View style={styles.jobInfo}>
                <Text style={styles.companyName}>{currentJob.companyName}</Text>
                <Text style={styles.orderId}>Order ID: {currentJob.orderId}</Text>
                <Text style={styles.jobType}>{currentJob.type}</Text>
              </View>
            </View>

            {/* Job Details Section */}
            <View style={styles.jobDetails}>
              <Text style={styles.dateTime}>{currentJob.dateTime}</Text>
              
              {/* Pickup and Dropoff Locations */}
              <View style={styles.locationContainer}>
                {/* Pickup Location */}
                <View style={styles.locationItem}>
                  <Ionicons name="location" size={20} color={colors.danger} />
                  <Text style={styles.locationText}>{currentJob.pickupLocation}</Text>
                </View>
                {/* Dropoff Location */}
                <View style={styles.locationItem}>
                  <Ionicons name="navigate" size={20} color={colors.success} />
                  <Text style={styles.locationText}>{currentJob.dropoffLocation}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Job Action Buttons */}
          <View style={styles.actionsContainer}>
            {/* Actions for accepted jobs (ready to start) */}
            {currentJob.status === 'accepted' && (
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  styles.startButton,
                  actionLoading && styles.disabledButton
                ]}
                onPress={() => handleJobAction('start')}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Ionicons name="hourglass" size={20} color={colors.white} />
                ) : (
                  <Ionicons name="play" size={20} color={colors.white} />
                )}
                <Text style={styles.actionButtonText}>
                  {actionLoading ? 'Starting...' : 'Start Job'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Actions for picked up jobs (in transit) */}
            {currentJob.status === 'pickedup' && (
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  styles.completeButton,
                  actionLoading && styles.disabledButton
                ]}
                onPress={() => handleJobAction('complete')}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Ionicons name="hourglass" size={20} color={colors.white} />
                ) : (
                  <Ionicons name="checkmark" size={20} color={colors.white} />
                )}
                <Text style={styles.actionButtonText}>
                  {actionLoading ? 'Completing...' : 'Complete Job'}
                </Text>
              </TouchableOpacity>
            )}

            {/* View Details Button - always available */}
            <TouchableOpacity
              style={[styles.actionButton, styles.detailsButton]}
              onPress={handleViewDetails}
              disabled={actionLoading}
            >
              <Ionicons name="map" size={20} color={colors.themeColor} />
              <Text style={[styles.actionButtonText, styles.detailsButtonText]}>
                View Details
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * StyleSheet for CurrentJobScreen
 * 
 * Defines all visual styling for the active job dashboard including:
 * - Empty state layout and typography
 * - Job status badge styling with dynamic colors
 * - Job card layout with company information
 * - Location display with icon integration
 * - Action button styling for job workflow
 * - Loading states and disabled button styles
 */
const styles = StyleSheet.create({
  // Main scroll container
  scrollView: {
    flex: 1,                                    // Fill available height
  },
  
  // Main content container
  container: {
    paddingTop: 16,                             // Top spacing from header
  },

  // Loading state container
  loadingContainer: {
    flex: 1,                                    // Fill available space
    justifyContent: 'center',                   // Center content vertically
    alignItems: 'center',                       // Center content horizontally
    paddingHorizontal: 32,                      // Side padding
  },

  // Loading text styling
  loadingText: {
    fontSize: 16,                               // Readable text size
    color: colors.contentColor,                 // Subdued text color
    marginTop: 12,                              // Space after icon
    textAlign: 'center',                        // Center align text
  },
  
  // Empty state styling
  emptyContainer: {
    flex: 1,                                    // Fill available space
    justifyContent: 'center',                   // Center content vertically
    alignItems: 'center',                       // Center content horizontally
    paddingHorizontal: 32,                      // Side padding for text
  },
  
  // Empty state title
  emptyTitle: {
    fontSize: 24,                               // Large heading size
    fontWeight: 'bold',                         // Bold emphasis
    color: colors.titleColor,                   // Primary text color
    marginTop: 16,                              // Space after icon
    marginBottom: 8,                            // Space before message
  },
  
  // Empty state message
  emptyMessage: {
    fontSize: 16,                               // Readable body text
    color: colors.contentColor,                 // Subdued text color (original content-color)
    textAlign: 'center',                        // Center align text
    lineHeight: 24,                             // Improved readability
  },
  
  // Status container styling
  statusContainer: {
    alignItems: 'center',                       // Center status elements
    marginBottom: 24,                           // Space before job card
  },
  
  // Status title styling
  statusTitle: {
    fontSize: 18,                               // Section heading size
    fontWeight: '600',                          // Semi-bold weight
    color: colors.titleColor,                   // Primary text color
    marginBottom: 12,                           // Space before badge
  },
  
  // Status badge container
  statusBadge: {
    paddingHorizontal: 16,                      // Horizontal badge padding
    paddingVertical: 8,                         // Vertical badge padding
    borderRadius: 20,                           // Pill-shaped badge
  },
  
  // Status-specific badge colors
  acceptedStatus: {
    backgroundColor: colors.secondaryColor,     // Orange for accepted jobs (original secondary color)
  },
  pickedupStatus: {
    backgroundColor: colors.accentColor,        // Blue for picked up jobs (original accent color)
  },
  
  // Status badge text
  statusText: {
    color: colors.white,                        // White text on colored background
    fontWeight: '600',                          // Semi-bold emphasis
    fontSize: 14,                               // Badge text size
  },
  
  // Job information card
  jobCard: {
    backgroundColor: colors.white,              // White card background
    borderRadius: 12,                           // Rounded card corners
    padding: 16,                                // Internal card padding
    marginBottom: 24,                           // Space before actions
    shadowColor: colors.black,                  // Shadow for card depth
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,                         // Subtle shadow
    shadowRadius: 4,
    elevation: 3,                               // Android shadow
  },
  
  // Job header with company info
  jobHeader: {
    flexDirection: 'row',                       // Horizontal layout
    alignItems: 'center',                       // Center vertically
    marginBottom: 16,                           // Space before details
  },
  
  // Company profile image
  companyImage: {
    width: 60,                                  // Square image size
    height: 60,
    borderRadius: 30,                           // Circular image
    marginRight: 12,                            // Space before text
  },
  
  // Job info container
  jobInfo: {
    flex: 1,                                    // Fill remaining space
  },
  
  // Company name styling
  companyName: {
    fontSize: 18,                               // Prominent heading
    fontWeight: '600',                          // Semi-bold weight
    color: colors.titleColor,                   // Primary text color
    marginBottom: 4,                            // Small space after
  },
  
  // Order ID styling
  orderId: {
    fontSize: 14,                               // Smaller reference text
    color: colors.themeColor,                   // Theme color for emphasis (original theme-color)
    marginBottom: 4,                            // Small space after
  },
  
  // Job type styling
  jobType: {
    fontSize: 16,                               // Medium text size
    fontWeight: 'bold',                         // Bold emphasis
    color: colors.themeColor,                   // Theme color highlight (original theme-color)
  },
  
  // Job details section
  jobDetails: {
    borderTopWidth: 1,                          // Top border separator
    borderTopColor: colors.border,              // Light border color
    paddingTop: 16,                             // Space after border
  },
  
  // Date and time display
  dateTime: {
    fontSize: 14,                               // Small reference text
    color: colors.contentColor,                 // Subdued text color (original content-color)
    marginBottom: 16,                           // Space before locations
  },
  
  // Location container
  locationContainer: {
    gap: 12,                                    // Consistent spacing between locations
  },
  
  // Individual location item
  locationItem: {
    flexDirection: 'row',                       // Horizontal layout
    alignItems: 'center',                       // Center icon and text
  },
  
  // Location text styling
  locationText: {
    fontSize: 14,                               // Readable text size
    color: colors.titleColor,                   // Primary text color
    marginLeft: 8,                              // Space after icon
    flex: 1,                                    // Fill available space
  },
  
  // Action buttons container
  actionsContainer: {
    gap: 12,                                    // Consistent button spacing
  },
  
  // Base action button styling
  actionButton: {
    flexDirection: 'row',                       // Horizontal layout for icon and text
    alignItems: 'center',                       // Center content
    justifyContent: 'center',                   // Center horizontally
    paddingVertical: 16,                        // Comfortable touch target
    borderRadius: 8,                            // Rounded button corners
    gap: 8,                                     // Space between icon and text
  },
  
  // Start job button
  startButton: {
    backgroundColor: colors.successColor,       // Green for start action (original success-color)
  },
  
  // Complete job button
  completeButton: {
    backgroundColor: colors.themeColor,         // Theme color for complete
  },
  
  // Details button (outline style)
  detailsButton: {
    backgroundColor: colors.white,              // White background
    borderWidth: 1,                             // Outline border
    borderColor: colors.themeColor,             // Theme color border
  },

  // Disabled button state
  disabledButton: {
    opacity: 0.6,                               // Reduced opacity for disabled state
  },
  
  // Action button text
  actionButtonText: {
    fontSize: 16,                               // Readable button text
    fontWeight: '600',                          // Semi-bold emphasis
    color: colors.white,                        // White text (overridden for outline)
  },
  
  // Details button specific text color
  detailsButtonText: {
    color: colors.themeColor,                   // Theme color for outline button
  },
});

export default CurrentJobScreen;
