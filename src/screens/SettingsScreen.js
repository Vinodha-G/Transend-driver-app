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

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/common/Header';
import HamburgerMenu from '../components/common/HamburgerMenu';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { colors, commonStyles } from '../styles/commonStyles';
import { spacing } from '../utils/responsiveDimensions';

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
  
  // Get theme context
  const { theme, isDarkMode, toggleTheme } = useTheme();

  // Hamburger menu state
  const [menuVisible, setMenuVisible] = useState(false);

  /**
   * Handle Menu Press
   * 
   * Callback for hamburger menu button press.
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
   * Always navigate to the selected route.
   * 
   * @param {string} route - The route to navigate to
   */
  const handleMenuNavigation = (route) => {
    setMenuVisible(false);
    navigation.navigate(route);
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
    {
      id: 3,
      title: 'Dark Mode',                     // Theme toggle
      icon: isDarkMode ? 'moon' : 'moon-outline', // Moon icon for dark mode
      onPress: null,                          // Handled by switch
      isSwitch: true,                         // Render as switch instead of navigation
      switchValue: isDarkMode,
      onSwitchChange: toggleTheme,
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
      onPress: () => navigation.navigate('Documents'), // Navigate to Documents screen
    },
    {
      id: 2,
      title: 'Vehicle Details',              // Vehicle registration, inspection
      icon: 'car',                           // Car icon for vehicle
      onPress: () => navigation.navigate('Vehicle'), // Navigate to Vehicle screen
    },
    {
      id: 3,
      title: 'Bank details',                 // Banking and payment information
      icon: 'card',                          // Card icon for banking
      onPress: () => navigation.navigate('BankDetails'), // Navigate to Bank Details screen
    },
  ];

  /**
   * Render Setting Item
   * 
   * Renders a single setting row with icon, title, and navigation arrow or switch.
   * Used for both general and registration settings.
   * 
   * @param {Object} item - Setting item configuration object
   * @returns {JSX.Element} TouchableOpacity with setting content or Switch
   */
  const renderSettingItem = (item) => {
    // Render as switch for toggle settings
    if (item.isSwitch) {
      return (
        <View 
          key={item.id} 
          style={[
            styles.settingBox,
            {
              backgroundColor: theme.surface,
              borderBottomColor: theme.border,
            }
          ]}
        >
          {/* Setting Icon Container */}
          <View style={[styles.settingIcon, { backgroundColor: theme.surface }]}>
            <Ionicons 
              name={item.icon} 
              size={24} 
              color={theme.primary}
            />
          </View>
          
          {/* Setting Content (Title and Switch) */}
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: theme.text }]}>{item.title}</Text>
            <Switch
              value={item.switchValue}
              onValueChange={item.onSwitchChange}
              trackColor={{ 
                false: theme.border, 
                true: theme.primary 
              }}
              thumbColor={item.switchValue ? theme.textLight : '#F4F3F4'}
              ios_backgroundColor={theme.border}
            />
          </View>
        </View>
      );
    }
    
    // Render as navigation item
    return (
      <TouchableOpacity 
        key={item.id} 
        style={[
          styles.settingBox, 
          { 
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          }
        ]} 
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        {/* Setting Icon Container */}
        <View style={[styles.settingIcon, { backgroundColor: theme.background }]}>
          <Ionicons 
            name={item.icon} 
            size={24} 
            color={theme.primary}
          />
        </View>
        
        {/* Setting Content (Title and Arrow) */}
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>{item.title}</Text>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={theme.textSecondary}
          />
        </View>
      </TouchableOpacity>
    );
  };

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
      
      {/* Main content with scrollable sections */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* User Profile Section */}
        <View style={[commonStyles.customContainer, styles.profileSection]}>
          <View style={[styles.profileContainer, { backgroundColor: theme.surface }]}>
            <View style={[commonStyles.flexAlignCenter, commonStyles.gap2]}>
              {/* User Profile Image */}
              <Image
                source={
                  user && user.profileImage 
                    ? { uri: user.profileImage }
                    : require('../../assets/images/profile/p1.png')
                }
                style={styles.profileImage}
              />
              {/* User Profile Information */}
              <View style={styles.profileContent}>
                <Text style={[styles.profileName, { color: theme.text }]}>
                  {user ? user.name : 'Loading...'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* General Settings Section */}
        <View style={commonStyles.customContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>General</Text>
          <View style={[styles.settingsList, { backgroundColor: theme.surface }]}>
            {generalSettings.map(renderSettingItem)}
          </View>
        </View>

        {/* Registration Details Section */}
        <View style={commonStyles.customContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Registration details</Text>
          <View style={[styles.settingsList, { backgroundColor: theme.surface }]}>
            {registrationSettings.map(renderSettingItem)}
          </View>
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
   * Scroll Content Container
   * Prevents content from being cut off and ensures proper padding
   */
  scrollContent: {
    flexGrow: 1,                           // Allow content to grow
    paddingBottom: spacing.lg,             // Bottom padding for better scrolling
  },
  
  /**
   * Profile Section Container
   * Top section containing user profile information
   */
  profileSection: {
    paddingTop: spacing.md,                // Responsive top spacing from header
  },
  
  /**
   * Profile Card Container
   * Card-style container for user profile display
   * Note: backgroundColor applied dynamically via theme
   */
  profileContainer: {
    borderRadius: 12,                      // Rounded corners
    padding: spacing.md,                   // Responsive internal padding
    shadowColor: '#000',                   // Shadow for depth
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
   * Note: color applied dynamically via theme
   */
  profileName: {
    fontSize: 18,                          // Large text for name
    fontWeight: 'bold',                    // Bold font weight
  },
  
  /**
   * Section Title
   * Header text for each settings section
   * Note: color applied dynamically via theme
   */
  sectionTitle: {
    fontSize: 16,                          // Medium title size
    fontWeight: '500',                     // Medium font weight
    textTransform: 'capitalize',           // Capitalize first letter
    marginTop: spacing.lg,                 // Responsive top spacing between sections
    marginBottom: spacing.sm + 4,          // Responsive bottom spacing before list
  },
  
  /**
   * Settings List Container
   * Card-style container for setting items
   * Note: backgroundColor applied dynamically via theme
   */
  settingsList: {
    borderRadius: 12,                      // Rounded corners
    overflow: 'hidden',                    // Clip child content to rounded corners
    shadowColor: '#000',                   // Shadow for depth
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
   * Note: backgroundColor and borderBottomColor applied dynamically via theme
   */
  settingBox: {
    flexDirection: 'row',                  // Horizontal layout
    alignItems: 'center',                  // Center items vertically
    padding: spacing.md,                   // Responsive internal padding
    borderBottomWidth: 1,                  // Bottom border between items
    minHeight: 56,                         // Android touch target
    // borderBottomColor applied dynamically
  },
  
  /**
   * Setting Icon Container
   * Circular container for setting icons
   * Note: backgroundColor applied dynamically via theme
   */
  settingIcon: {
    width: 40,                             // Fixed width
    height: 40,                            // Fixed height (square)
    borderRadius: 20,                      // Make circular
    justifyContent: 'center',              // Center icon vertically
    alignItems: 'center',                  // Center icon horizontally
    marginRight: spacing.sm + 4,           // Responsive spacing to the right
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
   * Note: color applied dynamically via theme
   */
  settingTitle: {
    fontSize: 16,                          // Medium text size
  },
});

export default SettingsScreen;
