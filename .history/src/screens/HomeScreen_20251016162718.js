/**
 * HomeScreen.js - Main Dashboard Screen with API Integration
 * 
 * Main dashboard screen providing overview of driver's current status,
 * job statistics, and available work opportunities.
 * Now includes API integration with loading states, error handling, and
 * scroll-to-new-jobs functionality.
 * 
 * @author Driver App Team
 * @version 1.1.0
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/common/Header';
import StatsCard from '../components/common/StatsCard';
import JobCard from '../components/common/JobCard';
import { useApp } from '../context/AppContext';
import { colors, commonStyles } from '../styles/commonStyles';

const HomeScreen = ({ navigation }) => {
  // Refs for scrolling
  const scrollViewRef = useRef(null);
  const jobsSectionRef = useRef(null);

  // Get app data and functions from global context
  const {
    jobs,
    jobStats,
    unreadNotifications,
    loadDashboardData,
    refreshAllData,
    isLoading
  } = useApp();

  // Refresh dashboard data on screen focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboardData();
    });
    return unsubscribe;
  }, [navigation, loadDashboardData]);

  // Stats Data Configuration
  const statsData = [
    { id: 1, count: (jobStats.newOrders || 0).toString(), title: 'New Order', iconName: 'car' },
    { id: 2, count: (jobStats.accepted || 0).toString(), title: 'Accepted', iconName: 'checkmark-circle' },
    { id: 3, count: (jobStats.pickedup || 0).toString(), title: 'Pickedup', iconName: 'arrow-up-circle' },
    { id: 4, count: (jobStats.delivered || 0).toString(), title: 'Delivered', iconName: 'checkmark-done-circle' },
  ];

  // Filter New Jobs
  const newJobs = jobs.filter(job => job.status === 'new');

  // Scroll to New Jobs Section
  const scrollToJobs = () => {
    jobsSectionRef.current?.measureLayout(
      scrollViewRef.current.getInnerViewNode(),
      (x, y) => {
        scrollViewRef.current.scrollTo({ y: y, animated: true });
      }
    );
  };

  // Handle Stats Card Press
  const handleStatsPress = (statsItem) => {
    if (statsItem.title === 'New Order') {
      scrollToJobs();
    } else {
      navigation.navigate('MyRides');
    }
  };

  // Handle Menu Press
  const handleMenuPress = () => {
    console.log('Menu pressed');
  };

  // Handle Notification Press
  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  // Handle Pull-to-Refresh
  const handleRefresh = async () => {
    await refreshAllData();
  };

  // Handle Job Card Press
  const handleJobPress = (job) => {
    navigation.navigate('JobDetails', { job });
  };

  // Render Statistics Card
  const renderStatsItem = ({ item }) => (
    <StatsCard
      count={item.count}
      title={item.title}
      iconName={item.iconName}
      onPress={() => handleStatsPress(item)}
    />
  );

  // Render Job Card
  const renderJobItem = ({ item }) => (
    <JobCard
      job={item}
      onPress={() => handleJobPress(item)}
    />
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <Header
        onMenuPress={handleMenuPress}
        onNotificationPress={handleNotificationPress}
        showNotificationBadge={unreadNotifications > 0}
      />

      {/* Main Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
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
        {/* Statistics Section */}
        <View style={[commonStyles.customContainer, styles.statsSection]}>
          <FlatList
            data={statsData}
            renderItem={renderStatsItem}
            keyExtractor={(item) => (item.id || Math.random()).toString()}
            horizontal={false}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.statsGrid}
            columnWrapperStyle={styles.statsRow}
          />
        </View>

        {/* New Jobs Section */}
        <View
          ref={jobsSectionRef}
          style={[commonStyles.customContainer, styles.jobsSection]}
        >
          <Text style={styles.sectionTitle}>New Job's</Text>
          <FlatList
            data={newJobs}
            renderItem={renderJobItem}
            keyExtractor={(item) => (item.id || Math.random()).toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No new jobs available</Text>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  statsSection: { paddingTop: 16 },
  statsGrid: { gap: 8 },
  statsRow: { justifyContent: 'space-between', marginBottom: 8 },
  jobsSection: { paddingTop: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: colors.titleColor, marginBottom: 16 },
  emptyText: { textAlign: 'center', color: colors.textLight, fontSize: 16, paddingVertical: 32 },
});

export default HomeScreen;
