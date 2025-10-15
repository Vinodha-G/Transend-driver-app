/**
 * MyRidesScreen.js - Job History and Status Management
 * 
 * Displays a filterable list of jobs organized by status with tab navigation.
 * Allows drivers to view their job history across different stages of completion.
 * 
 * Features:
 * - Horizontal tab navigation for job status filtering
 * - Real-time job list filtering based on selected tab
 * - Job cards displaying complete job information
 * - Empty state handling for each status category
 * - Navigation to detailed job views
 * - Responsive horizontal scrolling for tabs
 * 
 * Tab Categories:
 * - Accepted: Jobs that have been accepted but not picked up
 * - PickedUp: Jobs that have been picked up and are in transit
 * - Delivered: Completed jobs that have been delivered
 * - Cancel: Cancelled or unsuccessful jobs
 * 
 * Navigation:
 * - Accessed via bottom tab navigation (My Rides tab)
 * - Links to JobDetails screen for individual job views
 * 
 * Data Sources:
 * - Global app context for jobs array
 * - Real-time filtering based on job status
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/common/Header';
import JobCard from '../components/common/JobCard';
import { useApp } from '../context/AppContext';
import { colors, commonStyles } from '../styles/commonStyles';

/**
 * MyRidesScreen Component
 * 
 * Main job history screen with tabbed filtering by job status.
 * Provides comprehensive view of all driver's job activities.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.navigation - React Navigation object for screen navigation
 * @returns {JSX.Element} MyRidesScreen component
 */
const MyRidesScreen = ({ navigation }) => {
  // Get jobs data and notification count from global context
  const { jobs, unreadNotifications } = useApp();
  
  // Local state for active tab selection
  const [activeTab, setActiveTab] = useState('accepted');

  /**
   * Handle Menu Press
   * 
   * Callback for hamburger menu button press.
   * Currently logs to console - can be extended for drawer navigation.
   */
  const handleMenuPress = () => {
    console.log('Menu pressed');
  };

  /**
   * Handle Notification Press
   * 
   * Navigates to the notification screen to view all notifications.
   */
  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  /**
   * Handle Job Press
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
   * Tab Configuration
   * 
   * Array defining the available job status tabs and their display labels.
   * Each tab corresponds to a different job status in the workflow.
   */
  const tabs = [
    { id: 'accepted', label: 'Accepted' },     // Jobs accepted but not picked up
    { id: 'pickedup', label: 'PickedUp' },     // Jobs picked up and in transit
    { id: 'delivered', label: 'Delivered' },   // Successfully completed jobs
    { id: 'cancelled', label: 'Cancel' },      // Cancelled or failed jobs
  ];

  /**
   * Map API Status to Tab Status
   * 
   * Maps the status values from API to the tab filter values.
   * This handles any discrepancy between API status names and UI tab names.
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
   * 
   * Filters the jobs array based on the currently active tab.
   * Returns only jobs that match the selected status.
   * 
   * @returns {Array} Array of jobs matching the active tab status
   */
  const getFilteredJobs = () => {
    return jobs.filter(job => {
      const mappedStatus = mapApiStatusToTabStatus(job.status);
      return mappedStatus === activeTab;
    });
  };

  /**
   * Render Tab Button
   * 
   * Renders individual tab buttons with active/inactive styling.
   * 
   * @param {Object} tab - Tab configuration object
   * @returns {JSX.Element} TouchableOpacity tab button
   */
  const renderTabButton = (tab) => (
    <TouchableOpacity
      key={tab.id}
      style={[
        styles.tabButton,
        activeTab === tab.id && styles.activeTabButton  // Apply active styling conditionally
      ]}
      onPress={() => setActiveTab(tab.id)}
      activeOpacity={0.7}                               // Visual feedback on press
    >
      <Text style={[
        styles.tabButtonText,
        activeTab === tab.id && styles.activeTabButtonText  // Apply active text styling
      ]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );

  /**
   * Render Job Item
   * 
   * Renders individual job cards in the filtered list.
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
      
      {/* Tab Navigation Section */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal                                      // Enable horizontal scrolling
          showsHorizontalScrollIndicator={false}          // Hide scroll indicator
          contentContainerStyle={styles.tabScrollView}
        >
          {tabs.map(renderTabButton)}
        </ScrollView>
      </View>

      {/* Tab Content Section */}
      <View style={[commonStyles.customContainer, styles.contentContainer]}>
        <FlatList
          data={getFilteredJobs()}                        // Use filtered jobs based on active tab
          renderItem={renderJobItem}
          keyExtractor={(item) => (item.id || Math.random()).toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={                            // Show when no jobs match the filter
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No {activeTab} rides found
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

/**
 * Component-Specific Styles
 * 
 * Styles specific to the MyRidesScreen component layout and design.
 * Includes tab navigation, content areas, and empty state styling.
 */
const styles = StyleSheet.create({
  /**
   * Tab Container
   * Container for the horizontal tab navigation
   */
  tabContainer: {
    backgroundColor: colors.white,          // White background
    borderBottomWidth: 1,                  // Bottom border separator
    borderBottomColor: colors.border,      // Light gray border
  },
  
  /**
   * Tab Scroll View Content
   * Content container for horizontally scrolling tabs
   */
  tabScrollView: {
    paddingHorizontal: 16,                 // Horizontal padding
    paddingVertical: 8,                    // Vertical padding
  },
  
  /**
   * Individual Tab Button
   * Styling for each tab button in inactive state
   */
  tabButton: {
    paddingVertical: 12,                   // Vertical padding
    paddingHorizontal: 20,                 // Horizontal padding
    marginRight: 8,                        // Right spacing between tabs
    borderRadius: 20,                      // Rounded pill shape
    backgroundColor: colors.light,         // Light background for inactive
    borderWidth: 1,                        // Border outline
    borderColor: colors.border,            // Light gray border
  },
  
  /**
   * Active Tab Button
   * Additional styling for the currently selected tab
   */
  activeTabButton: {
    backgroundColor: colors.themeColor,     // Theme color background
    borderColor: colors.themeColor,        // Matching border color
  },
  
  /**
   * Tab Button Text
   * Text styling for inactive tab buttons
   */
  tabButtonText: {
    fontSize: 14,                          // Medium text size
    fontWeight: '500',                     // Medium font weight
    color: colors.textLight,               // Light gray text
  },
  
  /**
   * Active Tab Button Text
   * Text styling for the active tab button
   */
  activeTabButtonText: {
    color: colors.white,                   // White text on colored background
  },
  
  /**
   * Content Container
   * Main content area below the tabs
   */
  contentContainer: {
    flex: 1,                               // Take remaining space
    paddingTop: 16,                        // Top spacing from tabs
  },
  
  /**
   * Empty State Container
   * Container for empty state message
   */
  emptyContainer: {
    flex: 1,                               // Take full space
    justifyContent: 'center',              // Center content vertically
    alignItems: 'center',                  // Center content horizontally
    paddingVertical: 60,                   // Vertical padding for spacing
  },
  
  /**
   * Empty State Text
   * Message shown when no jobs match the current filter
   */
  emptyText: {
    fontSize: 16,                          // Medium text size
    color: colors.textLight,               // Light gray color
    textAlign: 'center',                   // Center align text
  },
});

export default MyRidesScreen;
