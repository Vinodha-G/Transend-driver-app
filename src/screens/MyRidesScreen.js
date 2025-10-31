/**
 * MyRidesScreen.js - Job History and Status Management
 * 
 * Displays a filterable list of rides (deliveries) organized by status with tab navigation.
 * Integrated with POST /driver/my-rides API endpoint.
 * 
 * Features:
 * - Horizontal tab navigation for ride status filtering (Accepted, PickedUp, Delivered, Cancelled)
 * - Dynamic API integration with POST /driver/my-rides
 * - Real-time ride data from backend
 * - Job cards displayed vertically using FlatList
 * - Empty state handling when no rides found
 * - Pull-to-refresh functionality
 * - Loading and error states
 * - Status-based filtering with automatic API calls
 * 
 * API Integration:
 * - Endpoint: POST /driver/my-rides
 * - Request: { driver_id: number, status: string }
 * - Response: { success: true, message: "dashboard.my_rides", data: { rides: [...], meta: {...} } }
 * - Status mapping: UI "pickedup" -> API "picked_up"
 * 
 * @author Driver App Team
 * @version 2.0.0 (API Integrated)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/common/Header';
import HamburgerMenu from '../components/common/HamburgerMenu';
import JobCard from '../components/common/JobCard';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { colors, commonStyles } from '../styles/commonStyles';
import { spacing } from '../utils/responsiveDimensions';
import { logError, ERROR_CATEGORIES } from '../utils/errorLogger';
import { showError } from '../utils/toast';

const MyRidesScreen = ({ navigation, route }) => {
  // ✅ Get theme
  const { theme } = useTheme();
  
  // ✅ Pull global context data
  const { 
    user, 
    rides, 
    dashboardData,
    jobStats,
    unreadNotifications, 
    loadDriverRides, 
    loadDashboardData,
    isLoading, 
    getError, 
    clearError 
  } = useApp();

  // ✅ Manage which tab is active
  const [activeTab, setActiveTab] = useState('accepted');

  // ✅ Manage hamburger menu visibility
  const [menuVisible, setMenuVisible] = useState(false);

  // ✅ Track if rides are being loaded to prevent multiple simultaneous calls
  const [isLoadingRides, setIsLoadingRides] = useState(false);
  
  // ✅ Use ref to track which tabs have been loaded to prevent loops
  const loadedTabsRef = useRef(new Set());

  // ✅ Update active tab if screen navigated with param (e.g. from Home)
  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
      navigation.setParams({ initialTab: undefined });
    }
  }, [route.params?.initialTab]);

  // ✅ Load rides when tab changes (only if not already loaded and not currently loading)
  useEffect(() => {
    // Check if rides are already loaded or currently loading
    const hasRides = rides[activeTab] && Array.isArray(rides[activeTab]) && rides[activeTab].length > 0;
    const currentlyLoading = isLoading(`rides_${activeTab}`);
    const alreadyAttempted = loadedTabsRef.current.has(activeTab);
    
    // Only load if:
    // 1. Tab is set
    // 2. No rides exist for this tab OR tab count from dashboard > 0 (need to load)
    // 3. Not currently loading
    // 4. Not already attempted (or previous attempt completed)
    const tabCount = getTabCount(activeTab);
    const shouldLoad = tabCount > 0 || !hasRides; // Load if dashboard shows count OR no rides loaded
    
    if (activeTab && shouldLoad && !currentlyLoading && !isLoadingRides && !alreadyAttempted) {
      loadedTabsRef.current.add(activeTab); // Mark as attempted
      setIsLoadingRides(true);
      
      // Always use driver_id: 1 for rides
      loadDriverRides(activeTab, 1)
        .catch(err => {
          logError(
            ERROR_CATEGORIES.API,
            `Failed to load ${activeTab} rides`,
            err,
            { screen: 'MyRidesScreen', tab: activeTab, driver_id: 1 }
          );
          // Show user-friendly error message
          const errorMsg = err?.message || 'Failed to load rides. Please try again.';
          if (err?.message?.includes('validation') || err?.message?.includes('422')) {
            showError('Invalid request. Please check your connection and try again.', 'Validation Error');
          } else {
            showError(errorMsg, 'Load Error');
          }
          // Remove from attempted set on error so user can retry
          loadedTabsRef.current.delete(activeTab);
        })
        .finally(() => {
          setIsLoadingRides(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, dashboardData]); // Reload when dashboard data changes to sync counts

  // ✅ Refresh dashboard counts when screen comes into focus
  // This ensures counts stay in sync with dashboard
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh dashboard to sync counts, but don't reload rides (user can pull to refresh)
      loadDashboardData().catch(err => {
        logError(ERROR_CATEGORIES.API, 'Failed to refresh dashboard on focus', err, { screen: 'MyRidesScreen' });
        console.error('Failed to refresh dashboard on focus:', err);
      });
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

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

  // ✅ Get rides for active tab from API response with null safety
  const getFilteredRides = () => {
    // Get rides for the active tab from context state
    // Ensure we always return an array, never null or undefined
    const tabRides = rides[activeTab];
    if (!tabRides || !Array.isArray(tabRides)) {
      return [];
    }
    return tabRides;
  };

  // ✅ Handle tab change and load rides
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    clearError(`rides_${tabId}`);
    
    // Load rides for the new tab if not already loaded and not currently loading
    const hasRides = rides[tabId] && Array.isArray(rides[tabId]) && rides[tabId].length > 0;
    const currentlyLoading = isLoading(`rides_${tabId}`);
    const alreadyAttempted = loadedTabsRef.current.has(tabId);
    const tabCount = getTabCount(tabId);
    const shouldLoad = tabCount > 0 || !hasRides; // Load if dashboard shows count OR no rides loaded
    
    if (shouldLoad && !currentlyLoading && !isLoadingRides && !alreadyAttempted) {
      loadedTabsRef.current.add(tabId); // Mark as attempted
      setIsLoadingRides(true);
      
      // Always use driver_id: 1 for rides
      loadDriverRides(tabId, 1)
        .catch(err => {
          logError(
            ERROR_CATEGORIES.API,
            `Failed to load ${tabId} rides`,
            err,
            { screen: 'MyRidesScreen', tab: tabId, driver_id: 1 }
          );
          // Show user-friendly error message
          const errorMsg = err?.message || 'Failed to load rides. Please try again.';
          if (err?.message?.includes('validation') || err?.message?.includes('422')) {
            showError('Invalid request. Please check your connection and try again.', 'Validation Error');
          } else {
            showError(errorMsg, 'Load Error');
          }
          // Remove from attempted set on error so user can retry
          loadedTabsRef.current.delete(tabId);
        })
        .finally(() => {
          setIsLoadingRides(false);
        });
    }
  };

  // ✅ Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    if (activeTab && !isLoadingRides) {
      setIsLoadingRides(true);
      try {
        // Refresh both dashboard and rides to keep counts in sync
        await Promise.all([
          loadDashboardData().catch(err => {
            logError(ERROR_CATEGORIES.API, 'Failed to refresh dashboard', err, { screen: 'MyRidesScreen' });
            console.error('Failed to refresh dashboard:', err);
          }),
          loadDriverRides(activeTab, 1).catch(err => {
            logError(ERROR_CATEGORIES.API, 'Failed to refresh rides', err, { screen: 'MyRidesScreen', tab: activeTab });
            console.error('Failed to refresh rides:', err);
            showError('Failed to refresh rides. Please try again.', 'Refresh Error');
          }),
        ]);
        // Don't remove from loadedTabsRef on refresh - keep it marked as loaded
      } catch (err) {
        logError(ERROR_CATEGORIES.API, 'Failed to refresh', err, { screen: 'MyRidesScreen' });
        console.error('Failed to refresh rides:', err);
        showError('Failed to refresh. Please try again.', 'Refresh Error');
      } finally {
        setIsLoadingRides(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]); // Remove loadDriverRides from dependencies

  // ✅ Render each ride as a card with proper field mapping and null safety
  const renderRideItem = ({ item }) => {
    // Null/undefined check
    if (!item || typeof item !== 'object') {
      console.warn('Invalid ride item:', item);
      return null;
    }
    
    // Map API ride fields to JobCard expected format
    // API provides: tracking_id, shipment_date, customer_name, from_address_text, to_address_text
    const mappedRide = {
      id: item.tracking_id || item.id || item.order_id || Math.random().toString(),
      tracking_id: item.tracking_id || item.trackingId || 'N/A',
      order_id: item.order_id || item.orderId || item.tracking_id || 'N/A', // For job details navigation
      parcel_id: item.parcel_id || item.parcelId || item.order_id || item.tracking_id || null, // For job details API
      companyName: item.customer_name || item.customerName || 'Unknown Company',
      orderId: item.tracking_id || item.trackingId || item.order_id || 'N/A',
      type: item.type || 'LTL', // Use provided type or default
      dateTime: item.shipment_date || item.shipmentDate || item.date || 'TBD',
      pickupLocation: item.from_address_text || item.fromAddressText || item.from_address || item.fromAddress || 'TBD',
      dropoffLocation: item.to_address_text || item.toAddressText || item.to_address || item.toAddress || 'TBD',
      profileImage: item.profile_image || item.profileImage || null, // API might provide profile image
      status: activeTab, // Use active tab as status
      // Preserve all original API fields for reference
      customer_name: item.customer_name || item.customerName,
      shipment_date: item.shipment_date || item.shipmentDate,
      from_address_text: item.from_address_text || item.fromAddressText,
      to_address_text: item.to_address_text || item.toAddressText,
      ...item, // Include any other fields from API
    };
    
    return (
      <JobCard
        job={mappedRide}
        onPress={() => handleJobPress(mappedRide)}
      />
    );
  };

  // ✅ Get tab count from dashboard data (synced with dashboard counts)
  // Maps UI tab IDs to dashboard count field names
  const getTabCount = (tabId) => {
    // First try to get count from dashboard data (source of truth)
    const dashboardCounts = dashboardData?.counts || {};
    
    // Map UI tab IDs to dashboard count field names
    const countMap = {
      'accepted': dashboardCounts.accepted ?? 0,
      'pickedup': dashboardCounts.picked_up ?? 0,
      'delivered': dashboardCounts.delivered ?? 0,
      'cancelled': dashboardCounts.cancelled ?? 0,
      'new': dashboardCounts.new_order ?? 0,
    };
    
    // Get count from dashboard, fallback to loaded rides length, then 0
    const dashboardCount = countMap[tabId] ?? 0;
    const loadedRidesCount = rides[tabId]?.length ?? 0;
    
    // Use dashboard count if available, otherwise use loaded rides count
    // Dashboard count is the source of truth, but if rides are loaded, show that too
    return dashboardCount > 0 ? dashboardCount : loadedRidesCount;
  };

  // ✅ Render each tab button
  const renderTabButton = (tab) => {
    const isActive = activeTab === tab.id;
    const count = getTabCount(tab.id);
    
    return (
      <TouchableOpacity
        key={tab.id}
        style={[
          styles.tabButton,
          {
            backgroundColor: isActive ? theme.primary : theme.surface,
            borderColor: isActive ? theme.primary : theme.border,
          }
        ]}
        onPress={() => handleTabChange(tab.id)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.tabButtonText,
          { color: isActive ? theme.textLight : theme.textSecondary }
        ]}>
          {tab.label} ({count})
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ErrorBoundary
      componentName="MyRidesScreen"
      screen="MyRidesScreen"
      title="My Rides Error"
      message="Unable to load rides. Please try again."
      onRetry={() => {
        // Reset loaded tabs and reload
        loadedTabsRef.current.clear();
        handleRefresh();
      }}
    >
      <SafeAreaView style={[commonStyles.container, { backgroundColor: theme.background }]} edges={['top']}>
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
        {(() => {
          const isLoadingTab = isLoading(`rides_${activeTab}`);
          const tabError = getError(`rides_${activeTab}`);
          const filteredRides = getFilteredRides();
          const hasRides = Array.isArray(filteredRides) && filteredRides.length > 0;
          
          // Show loading state only if loading and no rides exist
          if (isLoadingTab && !hasRides) {
            return (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                  Loading {activeTab} rides...
                </Text>
              </View>
            );
          }
          
          // Show error state with retry button
          if (tabError) {
            return (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={theme.error} />
                <Text style={[styles.errorText, { color: theme.text }]}>
                  {tabError}
                </Text>
                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    clearError(`rides_${activeTab}`);
                    loadedTabsRef.current.delete(activeTab);
                    handleTabChange(activeTab);
                  }}
                >
                  <Text style={[styles.retryButtonText, { color: theme.textLight || '#FFFFFF' }]}>
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }
          
          // Show rides list or empty state
          return (
            <FlatList
              data={filteredRides}
              renderItem={renderRideItem}
              keyExtractor={(item, index) => {
                // Safe key extraction with fallback
                if (item && item.tracking_id) return item.tracking_id;
                if (item && item.id) return String(item.id);
                if (item && item.order_id) return String(item.order_id);
                return `ride-${activeTab}-${index}`;
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              refreshControl={
                <RefreshControl
                  refreshing={isLoadingTab || isLoadingRides}
                  onRefresh={handleRefresh}
                  colors={[theme.primary]}
                  tintColor={theme.primary}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="car-outline" size={64} color={theme.textSecondary} />
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    {getTabCount(activeTab) > 0 
                      ? `Loading ${activeTab} rides...` 
                      : `No ${activeTab} rides found`}
                  </Text>
                </View>
              }
            />
          );
        })()}
      </View>

      {/* 🔹 Hamburger Menu Drawer */}
      <HamburgerMenu
        visible={menuVisible}
        onClose={handleMenuClose}
        onNavigate={handleMenuNavigation}
        user={user}
      />
      </SafeAreaView>
    </ErrorBoundary>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl + 28,     // Responsive vertical padding (60px)
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl + 28,     // Responsive vertical padding (60px)
    paddingHorizontal: spacing.md,
  },
  errorText: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl + 28,     // Responsive vertical padding (60px)
  },
  // Note: color applied dynamically via theme
  emptyText: {
    marginTop: spacing.md,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MyRidesScreen;
