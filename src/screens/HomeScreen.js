/**
 * HomeScreen.js - Main Dashboard Screen with API Integration
 * 
 * The primary dashboard screen that drivers see when they open the app.
 * Displays key statistics, available jobs, and provides quick access to main features.
 * Now integrated with real API data and loading states.
 * 
 * Features:
 * - Job statistics overview (new orders, accepted, picked up, delivered)
 * - List of new available jobs from API
 * - Navigation to detailed screens
 * - Real-time data from app context with API integration
 * - Responsive grid layout for statistics
 * - Loading states and error handling
 * - Pull-to-refresh functionality
 * 
 * Navigation:
 * - Accessed via bottom tab navigation (Home tab)
 * - Links to job details, notifications, and My Rides screens
 * 
 * Data Sources:
 * - Global app context for user data and job statistics
 * - Real-time dashboard data from API
 * - Job counts from API dashboard endpoint
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import React, { useEffect } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/common/Header';
import StatsCard from '../components/common/StatsCard';
import JobCard from '../components/common/JobCard';
import { useApp } from '../context/AppContext';
import { colors, commonStyles } from '../styles/commonStyles';

/**
 * HomeScreen Component
 * 
 * Main dashboard screen providing overview of driver's current status,
 * job statistics, and available work opportunities.
 * Now includes API integration with loading states and error handling.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.navigation - React Navigation object for screen navigation
 * @returns {JSX.Element} HomeScreen component
 */
const HomeScreen = ({ navigation }) => {
  // Get app data and functions from global context
  const {
    jobs,
    jobStats,
    unreadNotifications,
    dashboardData,
    loading,
    errors,
    loadDashboardData,
    refreshAllData,
    isLoading,
    getError
  } = useApp();

  /**
   * Screen Focus Effect
   * 
   * Refreshes dashboard data when screen comes into focus.
   * Ensures user always sees the latest statistics and jobs.
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboardData();
    });

    return unsubscribe;
  }, [navigation, loadDashboardData]);

  /**
   * Statistics Data Configuration
   * 
   * Creates an array of statistics cards to display job counts by status.
   * Uses real-time data from API dashboard for accurate counts.
   * Includes safe defaults to prevent errors during loading.
   */
  const statsData = [
    { 
      id: 1, 
      count: (jobStats.newOrders || 0).toString(),        // API count for new orders with fallback
      title: 'New Order', 
      iconName: 'car'                              // Ionicons name for car icon
    },
    { 
      id: 2, 
      count: (jobStats.accepted || 0).toString(),         // API count for accepted jobs with fallback
      title: 'Accepted', 
      iconName: 'checkmark-circle'                 // Checkmark icon for accepted jobs
    },
    { 
      id: 3, 
      count: (jobStats.pickedup || 0).toString(),         // API count for picked up jobs with fallback
      title: 'Pickedup', 
      iconName: 'arrow-up-circle'                  // Up arrow for picked up status
    },
    { 
      id: 4, 
      count: (jobStats.delivered || 0).toString(),        // API count for delivered jobs with fallback
      title: 'Delivered', 
      iconName: 'checkmark-done-circle'            // Double checkmark for completed jobs
    },
  ];

  /**
   * Filter New Jobs
   * 
   * Gets new jobs from the processed jobs array with proper field mapping.
   * Uses the jobs that have been properly mapped from API data.
   */
  const newJobs = jobs.filter(job => job.status === 'new');

  /**
   * Handle Menu Press
   * 
   * Callback for when the hamburger menu button is pressed.
   * Currently logs to console - can be extended to open drawer navigation.
   */
  const handleMenuPress = () => {
    // Handle drawer/menu opening
    console.log('Menu pressed');
  };

  /**
   * Handle Pull to Refresh
   * 
   * Refreshes all data when user pulls down on the screen.
   * Provides up-to-date job statistics and new jobs.
   */
  const handleRefresh = async () => {
    await refreshAllData();
  };

  /**
   * Handle Notification Press
   * 
   * Navigates to the notification screen when notification icon is pressed.
   * Used to view all notifications and mark them as read.
   */
  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  /**
   * Handle Stats Card Press
   * 
   * Navigates to My Rides screen when any statistics card is pressed.
   * My Rides screen shows filtered jobs based on status.
   * 
   * @param {Object} statsItem - The statistics item that was pressed
   */
  const handleStatsPress = (statsItem) => {
    navigation.navigate('MyRides');
  };

  /**
   * Handle Job Card Press
   * 
   * Navigates to job details screen with the selected job data.
   * Passes the complete job object as a parameter.
   * 
   * @param {Object} job - The job object that was pressed
   */
  const handleJobPress = (job) => {
    navigation.navigate('JobDetails', { job });
  };

  /**
   * Render Statistics Item
   * 
   * Renders each statistics card in the grid layout.
   * 
   * @param {Object} param - Render item parameters
   * @param {Object} param.item - Statistics data object
   * @param {number} param.index - Index in the array
   * @returns {JSX.Element} StatsCard component
   */
  const renderStatsItem = ({ item, index }) => (
    <StatsCard
      count={item.count}
      title={item.title}
      iconName={item.iconName}
      onPress={() => handleStatsPress(item)}
    />
  );

  /**
   * Render Job Item
   * 
   * Renders each job card in the new jobs list.
   * 
   * @param {Object} param - Render item parameters
   * @param {Object} param.item - Job data object
   * @returns {JSX.Element} JobCard component
   */
  const renderJobItem = ({ item }) => (
    <JobCard
      job={item}
      onPress={() => handleJobPress(item)}
    />
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header with menu, logo, and notifications */}
      <Header
        onMenuPress={handleMenuPress}
        onNotificationPress={handleNotificationPress}
        showNotificationBadge={unreadNotifications > 0}  // Show badge if unread notifications exist
      />
      
      {/* Main content area with scrollable sections and pull-to-refresh */}
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
        {/* Statistics Section - Job counts in 2x2 grid */}
        <View style={[commonStyles.customContainer, styles.statsSection]}>
          <FlatList
            data={statsData}
            renderItem={renderStatsItem}
            keyExtractor={(item) => (item.id || Math.random()).toString()}
            horizontal={false}                           // Vertical scrolling
            numColumns={2}                               // 2 columns for grid layout
            scrollEnabled={false}                        // Disable scroll (parent ScrollView handles it)
            contentContainerStyle={styles.statsGrid}
            columnWrapperStyle={styles.statsRow}         // Style for each row in grid
          />
        </View>

        {/* New Jobs Section - List of available jobs */}
        <View style={[commonStyles.customContainer, styles.jobsSection]}>
          <Text style={styles.sectionTitle}>New Job's</Text>
          <FlatList
            data={newJobs}
            renderItem={renderJobItem}
            keyExtractor={(item) => (item.id || Math.random()).toString()}
            scrollEnabled={false}                        // Disable scroll (parent ScrollView handles it)
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={                         // Show when no jobs available
              <Text style={styles.emptyText}>No new jobs available</Text>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Component-Specific Styles
 * 
 * Styles that are specific to the HomeScreen component layout and design.
 */
const styles = StyleSheet.create({
  /**
   * Main Scroll Container
   * Allows content to scroll when it exceeds screen height
   */
  scrollView: {
    flex: 1,                               // Take all available space
  },
  
  /**
   * Statistics Section Container
   * Top section containing job statistics cards
   */
  statsSection: {
    paddingTop: 16,                        // Top spacing from header
  },
  
  /**
   * Statistics Grid Layout
   * Grid container for statistics cards
   */
  statsGrid: {
    gap: 8,                                // Spacing between grid items
  },
  
  /**
   * Statistics Row Layout
   * Individual row styling in the 2-column grid
   */
  statsRow: {
    justifyContent: 'space-between',       // Equal spacing between columns
    marginBottom: 8,                       // Bottom spacing between rows
  },
  
  /**
   * Jobs Section Container
   * Section containing new available jobs list
   */
  jobsSection: {
    paddingTop: 24,                        // Spacing from stats section
  },
  
  /**
   * Section Title
   * Header text for the jobs section
   */
  sectionTitle: {
    fontSize: 20,                          // Large title text
    fontWeight: 'bold',                    // Bold font weight
    color: colors.titleColor,              // Dark color for visibility
    marginBottom: 16,                      // Bottom spacing before job list
  },
  
  /**
   * Empty State Text
   * Message shown when no new jobs are available
   */
  emptyText: {
    textAlign: 'center',                   // Center align text
    color: colors.textLight,               // Light gray color
    fontSize: 16,                          // Medium text size
    paddingVertical: 32,                   // Vertical padding for spacing
  },
});

export default HomeScreen;
