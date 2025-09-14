/**
 * NotificationScreen.js - Notification Center
 * 
 * Displays all notifications in a list format with read/unread status tracking.
 * Provides centralized access to system messages, job updates, and alerts.
 * 
 * Features:
 * - List of all notifications with timestamps
 * - Visual distinction between read and unread notifications
 * - Icon categorization by notification type
 * - Tap to mark notifications as read
 * - Empty state handling when no notifications exist
 * - Automatic read status updates
 * 
 * Notification Types:
 * - job: Job-related notifications (new jobs, updates)
 * - time: Time-sensitive alerts and reminders
 * - discount: Promotional and discount notifications
 * - default: General system notifications
 * 
 * Navigation:
 * - Accessed via header notification icon
 * - Stack screen with custom header
 * 
 * Data Sources:
 * - Global app context for notifications array
 * - Real-time read/unread status management
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, commonStyles } from '../styles/commonStyles';

/**
 * NotificationScreen Component
 * 
 * Main notification center displaying all app notifications with
 * read/unread status and type-specific icons.
 * 
 * @returns {JSX.Element} NotificationScreen component
 */
const NotificationScreen = () => {
  // Get notifications data and read status function from global context
  const { notifications, markNotificationAsRead } = useApp();

  /**
   * Handle Notification Press
   * 
   * Marks unread notifications as read when tapped.
   * Could be extended to navigate to specific screens based on notification type.
   * 
   * @param {Object} notification - The notification object that was pressed
   */
  const handleNotificationPress = (notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    // Future: Add navigation based on notification type
    // if (notification.actionUrl) {
    //   navigation.navigate(notification.actionUrl);
    // }
  };

  /**
   * Get Notification Icon
   * 
   * Returns appropriate Ionicons name based on notification type.
   * Provides visual categorization for different types of notifications.
   * 
   * @param {string} type - The notification type
   * @returns {string} Ionicons name for the notification type
   */
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job':
        return 'car';                      // Car icon for job-related notifications
      case 'time':
        return 'time';                     // Clock icon for time-sensitive alerts
      case 'discount':
        return 'pricetag';                 // Price tag for promotional notifications
      default:
        return 'notifications';            // Default notification bell icon
    }
  };

  /**
   * Render Notification Item
   * 
   * Renders individual notification cards with icon, content, and read status.
   * 
   * @param {Object} param - Render item parameters
   * @param {Object} param.item - Notification data object
   * @returns {JSX.Element} TouchableOpacity notification card
   */
  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationBox,
        !item.read && styles.unreadNotification  // Apply unread styling conditionally
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}                       // Visual feedback on press
    >
      {/* Notification Icon */}
      <View style={styles.notificationIcon}>
        <Ionicons 
          name={getNotificationIcon(item.type)} 
          size={24} 
          color={colors.themeColor} 
        />
      </View>
      
      {/* Notification Content */}
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
      
      {/* Unread Indicator Dot */}
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Main Content Container */}
      <View style={styles.container}>
        <FlatList
          data={notifications}                           // Use notifications from context
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={                           // Show when no notifications exist
            <View style={styles.emptyContainer}>
              <Ionicons 
                name="notifications-off" 
                size={60} 
                color={colors.textLight} 
              />
              <Text style={styles.emptyText}>No notifications yet</Text>
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
 * Styles specific to the NotificationScreen component layout and design.
 * Includes notification cards, read/unread states, and empty state styling.
 */
const styles = StyleSheet.create({
  /**
   * Main Container
   * Content area with padding for notification list
   */
  container: {
    flex: 1,                               // Take all available space
    paddingHorizontal: 16,                 // Horizontal padding
    paddingTop: 16,                        // Top padding from header
  },
  
  /**
   * List Container
   * Content container for FlatList with bottom padding
   */
  listContainer: {
    paddingBottom: 20,                     // Bottom padding for scroll area
  },
  
  /**
   * Notification Card
   * Individual notification item styling
   */
  notificationBox: {
    flexDirection: 'row',                  // Horizontal layout
    alignItems: 'flex-start',              // Align items to top
    backgroundColor: colors.white,         // White background
    borderRadius: 12,                      // Rounded corners
    padding: 16,                           // Internal padding
    marginBottom: 12,                      // Bottom spacing between items
    shadowColor: colors.black,             // Shadow for depth
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,                    // Light shadow
    shadowRadius: 4,
    elevation: 3,                          // Android shadow
    position: 'relative',                  // Enable absolute positioning for dot
  },
  
  /**
   * Unread Notification Styling
   * Additional styling for unread notifications
   */
  unreadNotification: {
    borderLeftWidth: 4,                    // Left border indicator
    borderLeftColor: colors.themeColor,    // Theme color for unread indicator
  },
  
  /**
   * Notification Icon Container
   * Circular container for notification type icons
   */
  notificationIcon: {
    width: 40,                             // Fixed width
    height: 40,                            // Fixed height (square)
    borderRadius: 20,                      // Make circular
    backgroundColor: colors.light,         // Light background
    justifyContent: 'center',              // Center icon vertically
    alignItems: 'center',                  // Center icon horizontally
    marginRight: 12,                       // Right spacing from content
  },
  
  /**
   * Notification Content Container
   * Container for title, message, and timestamp
   */
  notificationContent: {
    flex: 1,                               // Take remaining space
  },
  
  /**
   * Notification Title
   * Primary heading for the notification
   */
  notificationTitle: {
    fontSize: 16,                          // Medium text size
    fontWeight: '600',                     // Semi-bold weight
    color: colors.titleColor,              // Dark color for readability
    marginBottom: 4,                       // Bottom spacing
  },
  
  /**
   * Notification Message
   * Detailed message content
   */
  notificationMessage: {
    fontSize: 14,                          // Standard text size
    color: colors.textLight,               // Light gray color
    lineHeight: 20,                        // Comfortable line height
    marginBottom: 8,                       // Bottom spacing
  },
  
  /**
   * Notification Timestamp
   * Time since notification was created
   */
  notificationTime: {
    fontSize: 12,                          // Small text size
    color: colors.textLight,               // Light gray color
  },
  
  /**
   * Unread Indicator Dot
   * Small red dot for unread notifications
   */
  unreadDot: {
    width: 8,                              // Small circular dot
    height: 8,
    borderRadius: 4,                       // Make circular
    backgroundColor: colors.danger,        // Red color for attention
    position: 'absolute',                  // Position relative to card
    top: 12,                               // Distance from top
    right: 12,                             // Distance from right
  },
  
  /**
   * Empty State Container
   * Container for empty state when no notifications exist
   */
  emptyContainer: {
    flex: 1,                               // Take full space
    justifyContent: 'center',              // Center content vertically
    alignItems: 'center',                  // Center content horizontally
    paddingVertical: 60,                   // Vertical padding for spacing
  },
  
  /**
   * Empty State Text
   * Message shown when no notifications are available
   */
  emptyText: {
    fontSize: 16,                          // Medium text size
    color: colors.textLight,               // Light gray color
    textAlign: 'center',                   // Center align text
    marginTop: 16,                         // Top spacing from icon
  },
});

export default NotificationScreen;
