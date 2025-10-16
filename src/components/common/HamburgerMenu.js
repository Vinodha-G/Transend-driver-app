/**
 * HamburgerMenu.js - Slide-out Navigation Menu Component
 * 
 * A slide-out hamburger menu that displays user profile and navigation options.
 * Shows profile picture, user name, and menu items for main app sections.
 * 
 * Features:
 * - Slide-in animation from the left
 * - Profile section with image and name
 * - Navigation menu items with icons
 * - Overlay background to close menu
 * - Smooth animations and transitions
 * 
 * Props:
 * - visible: Boolean to show/hide the menu
 * - onClose: Function called when menu should be closed
 * - onNavigate: Function called when menu item is selected
 * - user: User object with profile information
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/commonStyles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const MENU_WIDTH = screenWidth * 0.8; // 80% of screen width

/**
 * HamburgerMenu Component
 * 
 * Renders a slide-out navigation menu with user profile and menu items.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the menu is visible
 * @param {Function} props.onClose - Callback when menu should be closed
 * @param {Function} props.onNavigate - Callback when navigation item is selected
 * @param {Object} props.user - User profile object
 * @returns {JSX.Element} HamburgerMenu component
 */
const HamburgerMenu = ({ visible, onClose, onNavigate, user }) => {
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  /**
   * Menu Items Configuration
   * 
   * Array of navigation items with icons and navigation targets.
   */
  const menuItems = [
    {
      id: 'home',
      title: 'Home',
      icon: 'home-outline',
      route: 'Home',
    },
    {
      id: 'currentJob',
      title: 'Current Job',
      icon: 'car-outline',
      route: 'CurrentJob',
    },
    {
      id: 'myRides',
      title: 'My Rides',
      icon: 'list-outline',
      route: 'MyRides',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings-outline',
      route: 'Settings',
    },
  ];

  /**
   * Animation Effect
   * 
   * Handles slide-in/slide-out animations when menu visibility changes.
   */
  useEffect(() => {
    if (visible) {
      // Slide in from left
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out to left
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -MENU_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  /**
   * Handle Menu Item Press
   * 
   * Navigates to the selected screen and closes the menu.
   * 
   * @param {Object} item - Menu item that was pressed
   */
  const handleItemPress = (item) => {
    onNavigate(item.route);
    onClose();
  };

  /**
   * Handle Overlay Press
   * 
   * Closes the menu when user taps on the overlay background.
   */
  const handleOverlayPress = () => {
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <View style={styles.modalContainer}>
        {/* Overlay Background */}
        <Animated.View 
          style={[
            styles.overlay, 
            { opacity: overlayOpacity }
          ]}
        >
          <TouchableOpacity 
            style={styles.overlayTouch}
            onPress={handleOverlayPress}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Menu Content */}
        <Animated.View 
          style={[
            styles.menuContainer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Profile Header Section - Fixed at top */}
            <View style={styles.profileSection}>
              {/* Profile Image */}
              <View style={styles.profileImageContainer}>
                {user?.profileImage || user?.image ? (
                  <Image 
                    source={{ uri: user.profileImage || user.image }} 
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.defaultProfileImage}>
                    <Ionicons 
                      name="person" 
                      size={40} 
                      color={colors.textLight} 
                    />
                  </View>
                )}
              </View>

              {/* User Name */}
              <Text style={styles.userName}>
                {user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Driver'}
              </Text>
              
              {/* User Email (if available) */}
              {user?.email && (
                <Text style={styles.userEmail}>{user.email}</Text>
              )}
            </View>

            {/* Scrollable Menu Items */}
            <ScrollView 
              contentContainerStyle={styles.scrollArea}
              showsVerticalScrollIndicator={false}
            >
              {/* Divider */}
              <View style={styles.divider} />

              {/* Menu Items */}
              <View style={styles.menuItemsContainer}>
                {menuItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.menuItem}
                    onPress={() => handleItemPress(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemContent}>
                      {/* Menu Item Icon */}
                      <Ionicons 
                        name={item.icon} 
                        size={24} 
                        color={colors.titleColor}
                        style={styles.menuItemIcon}
                      />
                      
                      {/* Menu Item Text */}
                      <Text style={styles.menuItemText}>
                        {item.title}
                      </Text>
                    </View>

                    {/* Arrow Indicator */}
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={colors.textLight} 
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Bottom spacer for scroll content */}
              <View style={styles.scrollBottomSpacer} />
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

/**
 * Component Styles
 */
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
  },
  
  overlayTouch: {
    flex: 1,
  },
  
  menuContainer: {
    width: MENU_WIDTH,
    height: screenHeight,
    backgroundColor: colors.white,
    elevation: 10, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  scrollArea: {
    flexGrow: 1,
    paddingTop: 10,
    paddingBottom: 40, // ensures it reaches bottom safely
  },
  
  profileSection: {
    backgroundColor: colors.themeColor,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  
  profileImageContainer: {
    marginBottom: 15,
  },
  
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.white,
  },
  
  defaultProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 5,
  },
  
  userEmail: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  
  menuItemsContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 0,
  },
  
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginVertical: 2,
  },
  
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  menuItemIcon: {
    marginRight: 15,
    width: 24,
  },
  
  menuItemText: {
    fontSize: 16,
    color: colors.titleColor,
    fontWeight: '500',
  },
  
  scrollBottomSpacer: {
    height: 50,
    backgroundColor: colors.white,
  },
});

export default HamburgerMenu;