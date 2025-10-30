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
import { useTheme } from '../context/ThemeContext';
import { colors, commonStyles } from '../styles/commonStyles';
import { spacing } from '../utils/responsiveDimensions';

const MyRidesScreen = ({ navigation, route }) => {
  // ✅ Get theme
  const { theme } = useTheme();
  
  // ✅ Pull global context data
  const { user, jobs, jobStats, unreadNotifications } = useApp();

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

  // ✅ Get filtered jobs from real jobs array by status
  const getFilteredJobs = () => {
    // Map activeTab to job status
    const statusMap = {
      'accepted': 'accepted',
      'pickedup': 'pickedup',
      'delivered': 'delivered',
      'cancelled': 'cancelled',
    };
    
    const targetStatus = statusMap[activeTab] || activeTab;
    
    // Filter real jobs from context by status
    return jobs.filter(job => {
      const jobStatus = job.status?.toLowerCase();
      return jobStatus === targetStatus.toLowerCase();
    });
  };

  // ✅ Render each job as a card with proper field mapping
  const renderJobItem = ({ item }) => {
    // Map API job fields to JobCard expected format
    const mappedJob = {
      id: item.id || item.tracking_id || Math.random().toString(),
      companyName: item.customer_name || item.companyName || 'Unknown Company',
      orderId: item.tracking_id || item.order_id || item.orderId || 'N/A',
      type: item.type || 'LTL',
      dateTime: item.shipment_date || item.dateTime || 'TBD',
      pickupLocation: item.from_address_text || item.from_address || item.pickupLocation || 'TBD',
      dropoffLocation: item.to_address_text || item.to_address || item.dropoffLocation || 'TBD',
      profileImage: item.profileImage || null,
      status: item.status || 'new',
    };
    
    return (
      <JobCard
        job={mappedJob}
        onPress={() => handleJobPress(mappedJob)}
      />
    );
  };

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
        {tab.label} ({getFilteredJobs().length})
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
      <View style={[styles.tabContainer, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
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
          data={getFilteredJobs()}
          renderItem={renderJobItem}
          keyExtractor={(item) => (item.id || item.tracking_id || Math.random()).toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
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
  // Note: backgroundColor and borderBottomColor applied dynamically via theme
  tabContainer: {
    borderBottomWidth: 1,
  },
  tabScrollView: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  // Note: backgroundColor, borderColor, and text color applied dynamically via theme
  tabButton: {
    paddingVertical: spacing.sm + 4,      // 12px
    paddingHorizontal: spacing.md + 4,     // 20px
    marginRight: spacing.sm,               // 8px
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 44,                         // Android touch target
  },
  activeTabButton: {
    // Styles applied dynamically
  },
  // Note: color applied dynamically via theme
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabButtonText: {
    // color applied dynamically
  },
  contentContainer: {
    flex: 1,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.lg,             // Bottom padding for better scrolling
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl + 28,     // Responsive vertical padding (60px)
  },
  // Note: color applied dynamically via theme
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MyRidesScreen;
