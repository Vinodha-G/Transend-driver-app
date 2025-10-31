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

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, RefreshControl, findNodeHandle, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/common/Header';
import HamburgerMenu from '../components/common/HamburgerMenu';
import StatsCard from '../components/common/StatsCard';
import JobCard from '../components/common/JobCard';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { colors, commonStyles } from '../styles/commonStyles';
import { spacing } from '../utils/responsiveDimensions';
import { logError, ERROR_CATEGORIES } from '../utils/errorLogger';
import { showError } from '../utils/toast';

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
  // Get theme
  const { theme } = useTheme();
  
  // Get app data and functions from global context
  const scrollViewRef = useRef(null);
  const jobsSectionRef = useRef(null);
  const jobsSectionY = useRef(0);
  const {
    user,
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

  // Hamburger menu state
  const [menuVisible, setMenuVisible] = useState(false);

  /**
   * Screen Focus Effect
   * 
   * Refreshes dashboard data when screen comes into focus.
   * Ensures user always sees the latest statistics and jobs.
   * Includes error handling to prevent crashes.
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Reload dashboard data with error handling
      loadDashboardData().catch(error => {
        logError(
          ERROR_CATEGORIES.API,
          'Failed to load dashboard on screen focus',
          error,
          { screen: 'HomeScreen', action: 'focus' }
        );
        // Don't show toast on every focus - only show if there's an actual error state
        if (getError('dashboard')) {
          showError(getError('dashboard'), 'Dashboard Error');
        }
      });
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]); // loadDashboardData is stable from context

  /**
   * Tab Press Effect
   * 
   * Scrolls to top when Home tab is pressed while already on Home screen.
   * Provides quick navigation back to top of the page.
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      // Only scroll to top if we're already on the Home screen
      if (navigation.isFocused()) {
        scrollViewRef.current?.scrollTo({
          y: 0,
          animated: true,
        });
      }
    });

    return unsubscribe;
  }, [navigation]);

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
  const newJobs = (jobs || []).filter(job => job && job.status === 'new');


 const scrollToJobs = () => {
  if (scrollViewRef.current) {
    scrollViewRef.current.scrollTo({ y: jobsSectionY.current, animated: true });
  }
};



  /**
   * Handle Menu Press
   * 
   * Callback for when the hamburger menu button is pressed.
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
   * If Home is selected and we're already on Home screen, scroll to top.
   * 
   * @param {string} route - The route to navigate to
   */
  const handleMenuNavigation = (route) => {
    setMenuVisible(false);
    
    if (route === 'Home') {
      // If we're already on the Home screen, scroll to top
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
    } else {
      // Navigate to other screens
      navigation.navigate(route);
    }
  };

  /**
   * Handle Pull to Refresh
   * 
   * Refreshes all data when user pulls down on the screen.
   * Provides up-to-date job statistics and new jobs.
   * Includes comprehensive error handling.
   */
  const handleRefresh = async () => {
    try {
      await refreshAllData();
    } catch (error) {
      logError(
        ERROR_CATEGORIES.API,
        'Failed to refresh dashboard data',
        error,
        { screen: 'HomeScreen', action: 'pull_to_refresh' }
      );
      const errorMessage = error?.message || 'Failed to refresh data. Please try again.';
      showError(errorMessage, 'Refresh Error');
    }
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
  if (statsItem.title === 'New Order') {
    scrollToJobs(); // Scroll to New Jobs section
  } else {
    // Navigate to MyRides with tab param
    const statusMap = {
      Accepted: 'accepted',
      Pickedup: 'pickedup',
      Delivered: 'delivered',
    };
    navigation.navigate('MyRides', { initialTab: statusMap[statsItem.title] });
  }
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
    <SafeAreaView 
      style={[commonStyles.container, { backgroundColor: theme.background }]}
      edges={['top']}
    >
      {/* Header with menu, logo, and notifications */}
      <Header
        onMenuPress={handleMenuPress}
        onNotificationPress={handleNotificationPress}
        showNotificationBadge={unreadNotifications > 0}
      />
      
      {/* Main content area with scrollable sections and pull-to-refresh */}
      <ScrollView 
        ref={scrollViewRef}  
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isLoading('dashboard')}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
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
        <View   ref={jobsSectionRef}
  onLayout={(event) => {
    jobsSectionY.current = event.nativeEvent.layout.y; // Save Y position when layout is ready
  }}
          style={[commonStyles.customContainer, styles.jobsSection]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>New Job's</Text>
          <FlatList
            data={newJobs}
            renderItem={renderJobItem}
            keyExtractor={(item) => (item.id || Math.random()).toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No new jobs available</Text>
            }
          />
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
   * Scroll Content Container
   * Prevents content from being cut off and ensures proper padding
   */
  scrollContent: {
    flexGrow: 1,                           // Allow content to grow
    paddingBottom: spacing.lg,             // Bottom padding for better scrolling
  },
  
  /**
   * Statistics Section Container
   * Top section containing job statistics cards
   */
  statsSection: {
    paddingTop: spacing.md,                // Responsive top spacing from header
  },
  
  /**
   * Statistics Grid Layout
   * Grid container for statistics cards
   */
  statsGrid: {
    gap: spacing.sm,                      // Responsive spacing between grid items
  },
  
  /**
   * Statistics Row Layout
   * Individual row styling in the 2-column grid
   */
  statsRow: {
    justifyContent: 'space-between',       // Equal spacing between columns
    marginBottom: spacing.sm,              // Responsive bottom spacing between rows
  },
  
  /**
   * Jobs Section Container
   * Section containing new available jobs list
   */
  jobsSection: {
    paddingTop: spacing.lg,                // Responsive spacing from stats section
  },
  
  /**
   * Section Title
   * Header text for the jobs section
   * Note: color applied dynamically via theme
   */
  sectionTitle: {
    fontSize: 20,                          // Large title text
    fontWeight: 'bold',                    // Bold font weight
    marginBottom: spacing.md,              // Responsive bottom spacing before job list
  },
  
  /**
   * Empty State Text
   * Message shown when no new jobs are available
   * Note: color applied dynamically via theme
   */
  emptyText: {
    textAlign: 'center',                   // Center align text
    fontSize: 16,                          // Medium text size
    paddingVertical: spacing.xl,           // Responsive vertical padding for spacing
  },
});

export default HomeScreen;
