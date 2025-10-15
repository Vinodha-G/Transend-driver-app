/**
 * Header.js - App Header Component
 * 
 * A reusable header component that provides consistent navigation and branding
 * across all screens in the Driver App. Features a hamburger menu, app logo,
 * and notification icon with optional badge indicator.
 * 
 * Features:
 * - Hamburger menu button for navigation
 * - App logo/branding display
 * - Notification icon with optional badge
 * - Responsive layout with proper spacing
 * - Status bar safe area handling
 * 
 * Props:
 * - onMenuPress: Function called when menu button is pressed
 * - onNotificationPress: Function called when notification icon is pressed
 * - showNotificationBadge: Boolean to show/hide notification badge
 * 
 * Usage:
 * <Header 
 *   onMenuPress={() => console.log('Menu pressed')}
 *   onNotificationPress={() => navigation.navigate('Notification')}
 *   showNotificationBadge={true}
 * />
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, commonStyles } from '../../styles/commonStyles';

/**
 * Header Component
 * 
 * Renders the main app header with navigation menu, logo, and notification icon.
 * Automatically handles status bar spacing and responsive layout.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onMenuPress - Callback for menu button press
 * @param {Function} props.onNotificationPress - Callback for notification icon press
 * @param {boolean} props.showNotificationBadge - Whether to show notification badge (default: false)
 * @returns {JSX.Element} Header component
 */
const Header = ({ onMenuPress, onNotificationPress, showNotificationBadge = false }) => {
  return (
    <View style={[commonStyles.header, styles.header]}>
      <View style={commonStyles.headerPanel}>
        {/* Left Section: Menu Button and Logo */}
        <View style={[commonStyles.flexAlignCenter, commonStyles.gap2]}>
          {/* Hamburger Menu Button */}
          <TouchableOpacity 
            onPress={onMenuPress} 
            style={commonStyles.iconBtn}
            activeOpacity={0.7}                // Visual feedback on press
          >
            <Ionicons 
              name="menu" 
              size={24} 
              color={colors.white}              // White color for visibility on content-color background
            />
          </TouchableOpacity>
          
          {/* App Logo */}
          <Image 
            source={require('../../../assets/images/logo-transparent.png')} 
            style={commonStyles.logo}
            resizeMode="contain"              // Maintain aspect ratio
          />
        </View>
        
        {/* Right Section: Notification Button */}
        <View style={[commonStyles.flexAlignCenter, commonStyles.gap2]}>
          {/* Notification Icon with Optional Badge */}
          <TouchableOpacity 
            onPress={onNotificationPress} 
            style={[commonStyles.iconBtn, styles.notificationBtn]}
            activeOpacity={0.7}
          >
            {/* Notification Bell Icon */}
            <Ionicons 
              name="notifications" 
              size={24} 
              color={colors.white}              // White color for visibility on content-color background
            />
            
            {/* Notification Badge (small red dot) */}
            {showNotificationBadge && (
              <View style={styles.notificationBadge} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

/**
 * Component-Specific Styles
 * 
 * Styles that are specific to the Header component and not part of the global style system.
 */
const styles = StyleSheet.create({
  /**
   * Header Container
   * Adds top padding to account for device status bar on different devices
   */
  header: {
    paddingTop: 50,                      // Status bar spacing (iOS/Android safe area)
  },
  
  /**
   * Notification Button Container
   * Positioned relative to allow absolute positioning of badge
   */
  notificationBtn: {
    position: 'relative',                // Enable absolute positioning for badge
  },
  
  /**
   * Notification Badge
   * Small red dot indicator shown when there are unread notifications
   */
  notificationBadge: {
    position: 'absolute',                // Position relative to parent button
    top: 4,                              // 4px from top of button
    right: 4,                            // 4px from right of button
    width: 8,                            // Small circular badge
    height: 8,
    borderRadius: 4,                     // Make circular (half of width/height)
    backgroundColor: colors.danger,      // Red background for attention
  },
});

export default Header;
