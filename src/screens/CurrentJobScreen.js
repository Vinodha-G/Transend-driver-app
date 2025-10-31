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
import HamburgerMenu from '../components/common/HamburgerMenu';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { colors, commonStyles } from '../styles/commonStyles';
import { spacing, componentSizes, responsive } from '../utils/responsiveDimensions';

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
  // Get theme
  const { theme } = useTheme();
  
  // Get data and functions from global context
  const {
    user,
    jobs,
    currentJobs,
    unreadNotifications,
    dashboardData,
    loading,
    errors,
    loadDashboardData,
    loadCurrentJobs,
    updateJobStatus,
    refreshAllData,
    isLoading,
    getError,
    clearError
  } = useApp();

  // Local loading state for job actions
  const [actionLoading, setActionLoading] = useState(false);
  
  // Hamburger menu state
  const [menuVisible, setMenuVisible] = useState(false);

  /**
   * Screen Focus Effect
   * 
   * Refreshes current jobs data when screen comes into focus.
   * Ensures user always sees the latest active job information.
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Load current jobs from dedicated API endpoint
      loadCurrentJobs();
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]); // loadCurrentJobs is stable from context

  /**
   * Load Current Jobs on Mount
   * 
   * Loads current jobs when component mounts.
   */
  useEffect(() => {
    loadCurrentJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  /**
   * Current Job Selection
   * 
   * Gets the first active job from the currentJobs array.
   * Priority order:
   * 1. First job from currentJobs API (most recent active job)
   * 2. Fallback to jobs array if currentJobs is empty (for backward compatibility)
   */
  const currentJob = (currentJobs && currentJobs.length > 0) 
    ? currentJobs[0] 
    : ((jobs || []).find(job => job && job.status === 'accepted') || 
       (jobs || []).find(job => job && job.status === 'pickedup') ||
       (dashboardData?.new_jobs && dashboardData.new_jobs.length > 0 ? dashboardData.new_jobs[0] : null));

  /**
   * Handle Menu Press
   * 
   * Opens the hamburger menu with slide-in animation.
   */
  const handleMenuPress = () => {
    console.log('Menu pressed');
    setMenuVisible(true);
  };

  /**
   * Handle Menu Close
   * 
   * Closes the hamburger menu.
   */
  const handleMenuClose = () => {
    setMenuVisible(false);
  };

  /**
   * Handle Menu Navigation
   * 
   * Handles navigation when a menu item is selected.
   * Always navigate to the selected route.
   * 
   * @param {string} route - The route to navigate to
   */
  const handleMenuNavigation = (route) => {
    setMenuVisible(false);
    navigation.navigate(route);
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
   * Refreshes current jobs data when user pulls down on the screen.
   */
  const handleRefresh = async () => {
    await loadCurrentJobs();
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
          { text: 'Retry', onPress: () => loadCurrentJobs() }
        ]
      );
    }
  };

  // Show error alert for currentJobs errors
  useEffect(() => {
    if (getError('currentJobs')) {
      showErrorAlert('currentJobs');
    }
  }, [getError('currentJobs')]);

  /**
   * Loading State Render
   * 
   * Shows loading indicator while fetching current jobs data.
   */
  if (isLoading('currentJobs') && !currentJob) {
    return (
      <SafeAreaView 
        style={[commonStyles.container, { backgroundColor: theme.background }]}
        edges={['top']}
      >
        <Header
          onMenuPress={handleMenuPress}
          onNotificationPress={handleNotificationPress}
          showNotificationBadge={unreadNotifications > 0}
        />
        
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={40} color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading job data...</Text>
        </View>

        {/* Hamburger Menu */}
        <HamburgerMenu
          visible={menuVisible}
          onClose={handleMenuClose}
          onNavigate={handleMenuNavigation}
          user={user}
        />
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
      <SafeAreaView 
        style={[commonStyles.container, { backgroundColor: theme.background }]}
        edges={['top']}
      >
        {/* Header with menu and notifications */}
        <Header
          onMenuPress={handleMenuPress}
          onNotificationPress={handleNotificationPress}
          showNotificationBadge={unreadNotifications > 0}
        />
        
        {/* Empty state content */}
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={80} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Active Job</Text>
          <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
            You don't have any active jobs at the moment. Check back later for new opportunities.
          </Text>
        </View>

        {/* Hamburger Menu */}
        <HamburgerMenu
          visible={menuVisible}
          onClose={handleMenuClose}
          onNavigate={handleMenuNavigation}
          user={user}
        />
      </SafeAreaView>
    );
  }

  /**
   * Error State Render
   * 
   * Shows error message with retry option if data loading fails.
   */
  if (getError('currentJobs') || getError('jobUpdate')) {
    return (
      <SafeAreaView 
        style={[commonStyles.container, { backgroundColor: theme.background }]}
        edges={['top']}
      >
        <Header
          onMenuPress={handleMenuPress}
          onNotificationPress={handleNotificationPress}
          showNotificationBadge={unreadNotifications > 0}
        />
        
        <View style={[styles.errorContainer, { backgroundColor: theme.background }]}>
          <Ionicons name="warning-outline" size={40} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.text }]}>
            {getError('currentJobs') || getError('jobUpdate')}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.primary }]} 
            onPress={handleRefresh}
          >
            <Text style={[styles.retryButtonText, { color: theme.textLight || '#FFFFFF' }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>

        <HamburgerMenu
          visible={menuVisible}
          onClose={handleMenuClose}
          onNavigate={handleMenuNavigation}
          user={user}
        />
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
    <SafeAreaView style={[commonStyles.container, { backgroundColor: theme.background }]} edges={['top']}>
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
           refreshing={isLoading('currentJobs')}
           onRefresh={handleRefresh}
           colors={[theme.primary]}
           tintColor={theme.primary}
         />
        }
      >
        <View style={[commonStyles.customContainer, styles.container]}>
          
          {/* Current Job Status Section */}
          <View style={styles.statusContainer}>
            <Text style={[styles.statusTitle, { color: theme.text }]}>Current Job Status</Text>
            {/* Dynamic status badge with color coding */}
            <View style={[
              styles.statusBadge, 
              { backgroundColor: currentJob.status === 'accepted' ? theme.warning : theme.info }
            ]}>
              <Text style={styles.statusText}>
                {(currentJob.status || 'new').toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Job Information Card */}
          <View style={[styles.jobCard, { backgroundColor: theme.surface }]}>
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
                <Text style={[styles.companyName, { color: theme.text }]}>
                  {currentJob.companyName || currentJob.customer_name || 'Unknown Company'}
                </Text>
                <Text style={[styles.orderId, { color: theme.primary }]}>
                  Order ID: {currentJob.orderId || currentJob.tracking_id || currentJob.order_id || 'N/A'}
                </Text>
                <Text style={[styles.jobType, { color: theme.primary }]}>
                  {currentJob.type || 'LTL'}
                </Text>
              </View>
            </View>

            {/* Job Details Section */}
            <View style={[styles.jobDetails, { borderTopColor: theme.border }]}>
              <Text style={[styles.dateTime, { color: theme.textSecondary }]}>
                {currentJob.dateTime || currentJob.shipment_date || currentJob.created_at || 'Date not available'}
              </Text>
              
              {/* Pickup and Dropoff Locations */}
              <View style={styles.locationContainer}>
                {/* Pickup Location */}
                <View style={styles.locationItem}>
                  <Ionicons name="location" size={20} color={theme.error} />
                  <Text style={[styles.locationText, { color: theme.text }]}>
                    {currentJob.pickupLocation || 
                     currentJob.from_address_text || 
                     currentJob.from_address || 
                     currentJob.pickup_address ||
                     'Pickup address not available'}
                  </Text>
                </View>
                {/* Dropoff Location */}
                <View style={styles.locationItem}>
                  <Ionicons name="navigate" size={20} color={theme.success} />
                  <Text style={[styles.locationText, { color: theme.text }]}>
                    {currentJob.dropoffLocation || 
                     currentJob.to_address_text || 
                     currentJob.to_address || 
                     currentJob.dropoff_address ||
                     'Dropoff address not available'}
                  </Text>
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
                  { backgroundColor: theme.success },
                  actionLoading && styles.disabledButton
                ]}
                onPress={() => handleJobAction('start')}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Ionicons name="hourglass" size={20} color={theme.textLight || '#FFFFFF'} />
                ) : (
                  <Ionicons name="play" size={20} color={theme.textLight || '#FFFFFF'} />
                )}
                <Text style={[styles.actionButtonText, { color: theme.textLight || '#FFFFFF' }]}>
                  {actionLoading ? 'Starting...' : 'Start Job'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Actions for picked up jobs (in transit) */}
            {currentJob.status === 'pickedup' && (
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  { backgroundColor: theme.primary },
                  actionLoading && styles.disabledButton
                ]}
                onPress={() => handleJobAction('complete')}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Ionicons name="hourglass" size={20} color={theme.textLight || '#FFFFFF'} />
                ) : (
                  <Ionicons name="checkmark" size={20} color={theme.textLight || '#FFFFFF'} />
                )}
                <Text style={[styles.actionButtonText, { color: theme.textLight || '#FFFFFF' }]}>
                  {actionLoading ? 'Completing...' : 'Complete Job'}
                </Text>
              </TouchableOpacity>
            )}

            {/* View Details Button - always available */}
            <TouchableOpacity
              style={[
                styles.actionButton, 
                { 
                  backgroundColor: theme.surface,
                  borderWidth: 1,
                  borderColor: theme.primary
                }
              ]}
              onPress={handleViewDetails}
              disabled={actionLoading}
            >
              <Ionicons name="map" size={20} color={theme.primary} />
              <Text style={[styles.actionButtonText, { color: theme.primary }]}>
                View Details
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Hamburger Menu */}
      <HamburgerMenu
        visible={menuVisible}
        onClose={handleMenuClose}
        onNavigate={handleMenuNavigation}
        user={user}
      />
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
    paddingTop: spacing.md,
  },

  // Loading state container
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  // Loading text styling
  loadingText: {
    fontSize: responsive(16, 18, 14),
    marginTop: spacing.md,
    textAlign: 'center',
  },

  // Error container
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  // Error text styling
  errorText: {
    fontSize: responsive(16, 18, 14),
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },

  // Retry button
  retryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: componentSizes.buttonBorderRadius,
    minHeight: componentSizes.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Retry button text
  retryButtonText: {
    fontSize: responsive(16, 18, 14),
    fontWeight: '600',
  },
  
  // Empty state styling
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  
  // Empty state title
  emptyTitle: {
    fontSize: responsive(24, 28, 20),
    fontWeight: 'bold',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  
  // Empty state message
  emptyMessage: {
    fontSize: responsive(16, 18, 14),
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Status container styling
  statusContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  // Status title styling
  statusTitle: {
    fontSize: responsive(18, 20, 16),
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  
  // Status badge container
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  
  // Status badge text
  statusText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: responsive(14, 16, 12),
  },
  
  // Job information card
  jobCard: {
    borderRadius: componentSizes.cardBorderRadius,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...componentSizes.cardShadow,
    elevation: componentSizes.cardElevation,
  },
  
  // Job header with company info
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  // Company profile image
  companyImage: {
    width: responsive(60, 70, 50),
    height: responsive(60, 70, 50),
    borderRadius: responsive(30, 35, 25),
    marginRight: spacing.md,
  },
  
  // Job info container
  jobInfo: {
    flex: 1,
  },
  
  // Company name styling
  companyName: {
    fontSize: responsive(18, 20, 16),
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  
  // Order ID styling
  orderId: {
    fontSize: responsive(14, 16, 12),
    marginBottom: spacing.xs,
  },
  
  // Job type styling
  jobType: {
    fontSize: responsive(16, 18, 14),
    fontWeight: 'bold',
  },
  
  // Job details section
  jobDetails: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  
  // Date and time display
  dateTime: {
    fontSize: responsive(14, 16, 12),
    marginBottom: spacing.md,
  },
  
  // Location container
  locationContainer: {
    gap: spacing.md,
  },
  
  // Individual location item
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Location text styling
  locationText: {
    fontSize: responsive(14, 16, 12),
    marginLeft: spacing.sm,
    flex: 1,
  },
  
  // Action buttons container
  actionsContainer: {
    gap: spacing.md,
  },
  
  // Base action button styling
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: componentSizes.buttonBorderRadius,
    gap: spacing.sm,
    minHeight: componentSizes.buttonHeight,
  },

  // Disabled button state
  disabledButton: {
    opacity: 0.6,
  },
  
  // Action button text
  actionButtonText: {
    fontSize: responsive(16, 18, 14),
    fontWeight: '600',
  },
});

export default CurrentJobScreen;
