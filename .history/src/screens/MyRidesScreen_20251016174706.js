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
 * @version 1.1.0
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/common/Header';
import JobCard from '../components/common/JobCard';
import { useApp } from '../context/AppContext';
import { colors, commonStyles } from '../styles/commonStyles';

const MyRidesScreen = ({ navigation, route }) => {
  const { jobs, unreadNotifications } = useApp();

  // Default tab is 'accepted'
  const [activeTab, setActiveTab] = useState('accepted');

  // Update activeTab whenever initialTab param changes
  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);

      // Clear param to avoid repeated updates
      navigation.setParams({ initialTab: undefined });
    }
  }, [route.params?.initialTab]);

  const handleMenuPress = () => {
    console.log('Menu pressed');
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const handleJobPress = (job) => {
    navigation.navigate('JobDetails', { job });
  };

  const tabs = [
    { id: 'accepted', label: 'Accepted' },
    { id: 'pickedup', label: 'PickedUp' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancel' },
  ];

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

  const getFilteredJobs = () => {
    return jobs.filter(job => mapApiStatusToTabStatus(job.status) === activeTab);
  };

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
        {tab.label}
      </Text>
    </TouchableOpacity>
  );

  const renderJobItem = ({ item }) => (
    <JobCard
      job={item}
      onPress={() => handleJobPress(item)}
    />
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <Header
        onMenuPress={handleMenuPress}
        onNotificationPress={handleNotificationPress}
        showNotificationBadge={unreadNotifications > 0}
      />

      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollView}
        >
          {tabs.map(renderTabButton)}
        </ScrollView>
      </View>

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
    </SafeAreaView>
  );
};

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
