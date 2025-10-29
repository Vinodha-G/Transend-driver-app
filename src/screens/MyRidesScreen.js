/**
 * MyRidesScreen.js - Job History and Status Management
 * 
 * Displays a filterable list of jobs organized by status with tab navigation.
 * For now, it uses FAKE job data generated based on jobStats counts.
 * 
 * Features:
 * - Horizontal tab navigation for job status filtering
 * - Dynamically generates dummy jobs per status count
 * - Job cards displayed vertically using FlatList
 * - Empty state handling when count = 0
 * 
 * @author
 * Driver App Team (Modified by Vinodha)
 * @version 1.4.0 (Fake data for testing)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/common/Header';
import HamburgerMenu from '../components/common/HamburgerMenu';
import JobCard from '../components/common/JobCard';
import { useApp } from '../context/AppContext';
import { colors, commonStyles } from '../styles/commonStyles';

const MyRidesScreen = ({ navigation, route }) => {
  // ✅ Pull global context data
  const { user, jobStats, unreadNotifications } = useApp();

  // ✅ Manage which tab is active
  const [activeTab, setActiveTab] = useState('accepted');

  // ✅ Manage hamburger menu visibility
  const [menuVisible, setMenuVisible] = useState(false);

  // ✅ Update active tab if screen navigated with param (e.g. from Home)
  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
      navigation.setParams({ initialTab: undefined });
    }
  }, [route.params?.initialTab]);

  // ✅ Handle menu open/close/navigation
  const handleMenuPress = () => setMenuVisible(true);
  const handleMenuClose = () => setMenuVisible(false);
  const handleMenuNavigation = (routeName) => {
    setMenuVisible(false);
    navigation.navigate(routeName);
  };

  // ✅ Notification button handler
  const handleNotificationPress = () => navigation.navigate('Notification');

  // ✅ Job card click handler (for future use)
  const handleJobPress = (job) => navigation.navigate('JobDetails', { job });

  // ✅ Define available tabs
  const tabs = [
    { id: 'accepted', label: 'Accepted' },
    { id: 'pickedup', label: 'PickedUp' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  // ✅ Get job count for each tab using jobStats
  const getTabCount = (tabId) => {
    switch (tabId) {
      case 'accepted': return jobStats?.accepted || 0;
      case 'pickedup': return jobStats?.pickedup || 0;
      case 'delivered': return jobStats?.delivered || 0;
      case 'cancelled': return jobStats?.cancelled || 0;
      default: return 0;
    }
  };

  // ✅ Generate FAKE jobs array based on count
  const getFilteredJobs = () => {
    const count = getTabCount(activeTab); // number of fake cards to show

    // 🔹 Create fake job objects dynamically
    return Array.from({ length: count }, (_, index) => ({
      id: `${activeTab}-${index + 1}`,
      status: activeTab,
      title: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Job #${index + 1}`,
      pickup: `Pickup Location ${index + 1}`,
      drop: `Drop Location ${index + 1}`,
      date: 'Today',
    }));
  };

  // ✅ Render each fake job as a card
  const renderJobItem = ({ item }) => (
    <JobCard
      job={item}
      onPress={() => handleJobPress(item)}
    />
  );

  // ✅ Render each tab button
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
        {tab.label} ({getTabCount(tab.id)})
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* 🔹 Top Header with Menu + Notification */}
      <Header
        onMenuPress={handleMenuPress}
        onNotificationPress={handleNotificationPress}
        showNotificationBadge={unreadNotifications > 0}
      />

      {/* 🔹 Horizontal Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollView}
        >
          {tabs.map(renderTabButton)}
        </ScrollView>
      </View>

      {/* 🔹 Main Content Area */}
      <View style={[commonStyles.customContainer, styles.contentContainer]}>
        <FlatList
          data={getFilteredJobs()} // Fake jobs shown here
          renderItem={renderJobItem}
          keyExtractor={(item) => item.id.toString()}
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

      {/* 🔹 Hamburger Menu Drawer */}
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
 * Component Styles
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
