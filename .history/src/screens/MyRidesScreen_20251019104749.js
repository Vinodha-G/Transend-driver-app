/**
 * MyRidesScreen.js - Job History and Status Management
 * 
 * Displays a filterable list of jobs organized by status with tab navigation.
 * Allows drivers to view their job history across different stages of completion.
 * Now updated to match HomeScreen counts and display corresponding job cards.
 * 
 * Features:
 * - Horizontal tab navigation for job status filtering
 * - Real-time job list filtering based on active tab using jobStats
 * - Job cards displaying complete job information
 * - Empty state handling for each status category
 * - Navigation to detailed job views
 * - Responsive horizontal scrolling for tabs
 * 
 * Tab Categories:
 * - Accepted: Jobs that have been accepted but not picked up
 * - PickedUp: Jobs that have been picked up and are in transit
 * - Delivered: Completed jobs that have been delivered
 * - Cancelled: Cancelled or unsuccessful jobs
 * 
 * Navigation:
 * - Accessed via bottom tab navigation (My Rides tab)
 * - Links to JobDetails screen for individual job views
 * 
 * Data Sources:
 * - Global app context for jobs array and jobStats
 * - Real-time filtering based on job status
 * 
 * @author Driver App Team
 * @version 1.2.0
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/common/Header';
import HamburgerMenu from '../components/common/HamburgerMenu';
import JobCard from '../components/common/JobCard';
import { useApp } from '../context/AppContext';
import { colors, commonStyles } from '../styles/commonStyles';

/**
 * MyRidesScreen Component
 * 
 * Main job history screen with tabbed filtering by job status.
 * Provides comprehensive view of all driver's job activities.
 * Cards are now aligned with HomeScreen counts.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.navigation - React Navigation object for screen navigation
 * @param {Object} props.route - React Navigation route object for params
 * @returns {JSX.Element} MyRidesScreen component
 */
const MyRidesScreen = ({ navigation, route }) => {
  // Get jobs data and jobStats from global context
  const { user, jobs, jobStats, unreadNotifications } = useApp();

  // Local state for active tab selection
  const [activeTab, setActiveTab] = useState('accepted');

  // Hamburger menu state
  const [menuVisible, setMenuVisible] = useState(false);

  /**
   * Update activeTab when initialTab param is passed from HomeScreen
   * Ensures correct tab opens if screen is already mounted
   */
  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);

      // Clear the param to prevent repeated updates on re-render
      navigation.setParams({ initialTab: undefined });
    }
  }, [route.params?.initialTab]);

  /**
   * Handle Menu Press
   * Opens the hamburger menu
   */
  const handleMenuPress = () => {
    console.log('Menu pressed');
    setMenuVisible(true);
  };

  /**
   * Handle Menu Close
   * Closes the hamburger menu
   */
  const handleMenuClose = () => {
    setMenuVisible(false);
  };

  /**
   * Handle Menu Navigation
   * Navigates to selected route from hamburger menu
   * @param {string} route - Route to navigate to
   */
  const handleMenuNavigation = (route) => {
    setMenuVisible(false);
    navigation.navigate(route);
  };

  /**
   * Handle Notification Press
   * Navigates to notifications screen
   */
  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  /**
   * Handle Job Press
   * Navigates to JobDetails screen with selected job object
   * @param {Object} job - Selected job object
   */
  const handleJobPress = (job) => {
    navigation.navigate('JobDetails', { job });
  };

  /**
   * Tab Configuration
   * Defines available tabs and labels
   */
  const tabs = [
    { id: 'accepted', label: 'Accepted' },
    { id: 'pickedup', label: 'PickedUp' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancel' },
  ];

  /**
   * Map API Status to Tab Status
   * Handles discrepancy between API and UI tab names
   */
  const mapApiStatusToTabStatus = (apiStatus) => {
    const statusMap = {
      'new': 'new',
      'accepted': 'accepted',
      'picked_up': 'pickedup',
      'pickedup': 'pickedup',
      'delivered': 'delivered',
      'completed': 'delivered',
      'cancelled': 'cancelled',
      'canceled': 'cancelled',
      'cancel': 'cancelled',
    };
    return statusMap[apiStatus?.toLowerCase()] || apiStatus;
  };

  /**
   * Get Filtered Jobs
   * Filters jobs array based on selected tab using jobStats to match HomeScreen counts
   */
  const getFilteredJobs = () => {
    // For accepted, pickedup, delivered, filter jobs based on jobStats ids
    const tabToStatusMap = {
      accepted: 'accepted',
      pickedup: 'pickedup',
      delivered: 'delivered',
      cancelled: 'cancelled',
    };

    const status = tabToStatusMap[activeTab];

    if (!status) return [];

    // For cancelled, use jobs array directly
    if (status === 'cancelled') {
      return jobs.filter(job => mapApiStatusToTabStatus(job.status) === 'cancelled');
    }

    // For accepted, pickedup, delivered, filter jobs based on dashboard jobStats ids
    const statusJobIds = jobStats[status + 'Jobs']?.map(job => job.id) || [];
    return jobs.filter(job => statusJobIds.includes(job.id));
  };

  /**
   * Render Tab Button
   * @param {Object} tab - Tab configuration
   * @returns {JSX.Element} TouchableOpacity
   */
  const renderTabButton = (tab) => (
    <TouchableOpacity
      key={tab.id}
      style={[
        styles.tabButton,
        activeTab === tab.id && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(tab.id)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.tabButtonText,
        activeTab === tab.id && styles.activeTabButtonText
      ]}>
        {tab.label} ({activeTab === tab.id ? getFilteredJobs().length : ''})
      </Text>
    </TouchableOpacity>
  );

  /**
   * Render Job Item
   * @param {Object} param - Render item parameters
   * @param {Object} param.item - Job object
   * @returns {JSX.Element} JobCard
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
        showNotificationBadge={unreadNotifications > 0}
      />

      {/* Tab Navigation Section */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollView}
        >
          {tabs.map(renderTabButton)}
        </ScrollView>
      </View>

      {/* Tab Content Section */}
      <View style={[commonStyles.customContainer, styles.contentContainer]}>
        <FlatList
          data={getFilteredJobs()}
          renderItem={renderJobItem}
          keyExtractor={(item) => (item.id || Math.random()).toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No {activeTab} rides found
              </Text>
            </View>
          }
        />
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
};

/**
 * Component-Specific Styles
 */
const styles = StyleSheet.create({
  tabContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabScrollView: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTabButton: {
    backgroundColor: colors.themeColor,
    borderColor: colors.themeColor,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
  },
  activeTabButtonText: {
    color: colors.white,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
});

export default MyRidesScreen;
