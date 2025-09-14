/**
 * SettingsScreen.js - User Settings and Profile Management
 * 
 * Provides access to various app settings, user profile management, and
 * registration details. Organized into logical sections for easy navigation.
 * 
 * Features:
 * - User profile display with image and name
 * - General settings (profile, wallet)
 * - Registration details (documents, vehicle, bank details)
 * - Consistent navigation to detail screens
 * - Card-based layout for better organization
 * 
 * Navigation:
 * - Accessed via bottom tab navigation (Settings tab)
 * - Links to ProfileSetting screen for editing
 * - Placeholder navigation for other features
 * 
 * Data Sources:
 * - Global app context for user profile data
 * - Real-time notification count for header badge
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/common/Header';
import { useApp } from '../context/AppContext';
import { colors, commonStyles } from '../styles/commonStyles';

/**
 * SettingsScreen Component
 * 
 * Main settings screen that displays user profile and provides access
 * to various app configuration options.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.navigation - React Navigation object for screen navigation
 * @returns {JSX.Element} SettingsScreen component
 */
const SettingsScreen = ({ navigation }) => {
  // Get user data and notification count from global context
  const { user, unreadNotifications } = useApp();

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
   * Handle Profile Press
   * 
   * Navigates to the profile settings screen where users can edit
   * their personal information and profile image.
   */
  const handleProfilePress = () => {
    navigation.navigate('ProfileSetting');
  };

  /**
   * General Settings Configuration
   * 
   * Array of general app settings that affect overall user experience.
   * Each item has an icon, title, and onPress handler.
   */
  const generalSettings = [
    {
      id: 1,
      title: 'Profile settings',              // User profile management
      icon: 'person',                         // Person icon for profile
      onPress: handleProfilePress,            // Navigate to profile editing
    },
    {
      id: 2,
      title: 'My wallet',                     // Financial/payment management
      icon: 'wallet',                         // Wallet icon for payments
      onPress: () => console.log('Wallet pressed'), // Placeholder for wallet feature
    },
  ];

  /**
   * Registration Settings Configuration
   * 
   * Array of driver registration and compliance related settings.
   * These are typically required for driver verification and legal compliance.
   */
  const registrationSettings = [
    {
      id: 1,
      title: 'Documents',                     // Driver license, insurance, etc.
      icon: 'document-text',                  // Document icon
      onPress: () => console.log('Documents pressed'), // Placeholder for documents management
    },
    {
      id: 2,
      title: 'Vehicle Details',              // Vehicle registration, inspection
      icon: 'car',                           // Car icon for vehicle
      onPress: () => console.log('Vehicle pressed'), // Placeholder for vehicle management
    },
    {
      id: 3,
      title: 'Bank details',                 // Banking and payment information
      icon: 'card',                          // Card icon for banking
      onPress: () => console.log('Bank pressed'), // Placeholder for bank details management
    },
  ];

  /**
   * Render Setting Item
   * 
   * Renders a single setting row with icon, title, and navigation arrow.
   * Used for both general and registration settings.
   * 
   * @param {Object} item - Setting item configuration object
   * @returns {JSX.Element} TouchableOpacity with setting content
   */
  const renderSettingItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.settingBox} 
      onPress={item.onPress}
      activeOpacity={0.7}                   // Visual feedback on press
    >
      {/* Setting Icon Container */}
      <View style={styles.settingIcon}>
        <Ionicons 
          name={item.icon} 
          size={24} 
          color={colors.themeColor}          // Theme color for icons
        />
      </View>
      
      {/* Setting Content (Title and Arrow) */}
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={colors.textLight}           // Light color for navigation arrow
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header with menu, logo, and notifications */}
      <Header
        onMenuPress={handleMenuPress}
        onNotificationPress={handleNotificationPress}
        showNotificationBadge={unreadNotifications > 0}  // Show badge if unread notifications exist
      />
      
      {/* Main content with scrollable sections */}
      <ScrollView style={styles.scrollView}>
        {/* User Profile Section */}
        <View style={[commonStyles.customContainer, styles.profileSection]}>
          <View style={styles.profileContainer}>
            <View style={[commonStyles.flexAlignCenter, commonStyles.gap2]}>
              {/* User Profile Image */}
              <Image
                source={{ uri: user.profileImage }}
                style={styles.profileImage}
              />
              {/* User Profile Information */}
              <View style={styles.profileContent}>
                <Text style={styles.profileName}>{user.name}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* General Settings Section */}
        <View style={commonStyles.customContainer}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.settingsList}>
            {generalSettings.map(renderSettingItem)}
          </View>
        </View>

        {/* Registration Details Section */}
        <View style={commonStyles.customContainer}>
          <Text style={styles.sectionTitle}>Registration details</Text>
          <View style={styles.settingsList}>
            {registrationSettings.map(renderSettingItem)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Component-Specific Styles
 * 
 * Styles specific to the SettingsScreen component layout and design.
 * Includes profile card, setting sections, and list item styling.
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
   * Profile Section Container
   * Top section containing user profile information
   */
  profileSection: {
    paddingTop: 16,                        // Top spacing from header
  },
  
  /**
   * Profile Card Container
   * Card-style container for user profile display
   */
  profileContainer: {
    backgroundColor: colors.white,          // White background
    borderRadius: 12,                      // Rounded corners
    padding: 16,                           // Internal padding
    shadowColor: colors.black,             // Shadow for depth
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,                    // Light shadow
    shadowRadius: 4,
    elevation: 3,                          // Android shadow
  },
  
  /**
   * Profile Image
   * Circular profile picture styling
   */
  profileImage: {
    width: 60,                             // Fixed width
    height: 60,                            // Fixed height (square)
    borderRadius: 30,                      // Make circular (half of width/height)
  },
  
  /**
   * Profile Content Container
   * Container for profile text information
   */
  profileContent: {
    flex: 1,                               // Take remaining space
  },
  
  /**
   * Profile Name Text
   * User's display name styling
   */
  profileName: {
    fontSize: 18,                          // Large text for name
    fontWeight: 'bold',                    // Bold font weight
    color: colors.titleColor,              // Dark color for readability
  },
  
  /**
   * Section Title
   * Header text for each settings section
   */
  sectionTitle: {
    fontSize: 16,                          // Medium title size
    fontWeight: '500',                     // Medium font weight
    color: colors.titleColor,              // Dark color for visibility
    textTransform: 'capitalize',           // Capitalize first letter
    marginTop: 24,                         // Top spacing between sections
    marginBottom: 12,                      // Bottom spacing before list
  },
  
  /**
   * Settings List Container
   * Card-style container for setting items
   */
  settingsList: {
    backgroundColor: colors.white,          // White background
    borderRadius: 12,                      // Rounded corners
    overflow: 'hidden',                    // Clip child content to rounded corners
    shadowColor: colors.black,             // Shadow for depth
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,                    // Light shadow
    shadowRadius: 4,
    elevation: 3,                          // Android shadow
  },
  
  /**
   * Individual Setting Item
   * Row layout for each setting option
   */
  settingBox: {
    flexDirection: 'row',                  // Horizontal layout
    alignItems: 'center',                  // Center items vertically
    padding: 16,                           // Internal padding
    borderBottomWidth: 1,                  // Bottom border between items
    borderBottomColor: colors.border,      // Light gray border
  },
  
  /**
   * Setting Icon Container
   * Circular container for setting icons
   */
  settingIcon: {
    width: 40,                             // Fixed width
    height: 40,                            // Fixed height (square)
    borderRadius: 20,                      // Make circular
    backgroundColor: colors.light,         // Light background
    justifyContent: 'center',              // Center icon vertically
    alignItems: 'center',                  // Center icon horizontally
    marginRight: 12,                       // Spacing to the right
  },
  
  /**
   * Setting Content Container
   * Container for title and navigation arrow
   */
  settingContent: {
    flex: 1,                               // Take remaining space
    flexDirection: 'row',                  // Horizontal layout
    justifyContent: 'space-between',       // Space between title and arrow
    alignItems: 'center',                  // Center align items
  },
  
  /**
   * Setting Title Text
   * Title text for each setting option
   */
  settingTitle: {
    fontSize: 16,                          // Medium text size
    color: colors.titleColor,              // Dark color for readability
  },
});

export default SettingsScreen;
