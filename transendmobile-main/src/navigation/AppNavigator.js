/**
 * AppNavigator.js - Main Navigation Configuration
 * 
 * This file sets up the complete navigation structure for the Driver App using React Navigation.
 * It includes both bottom tab navigation (for main screens) and stack navigation (for detailed screens).
 * 
 * Navigation Structure:
 * - Bottom Tabs: Home, Current Job, My Rides, Settings
 * - Stack Screens: Notifications, Profile Settings, Job Details
 * 
 * Features:
 * - Custom tab bar icons with active/inactive states
 * - Consistent header styling across stack screens
 * - Platform-specific navigation behaviors
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import all screen components
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MyRidesScreen from '../screens/MyRidesScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileSettingScreen from '../screens/ProfileSettingScreen';
import CurrentJobScreen from '../screens/CurrentJobScreen';
import JobDetailsScreen from '../screens/JobDetailsScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import VehicleScreen from '../screens/VehicleScreen';
import BankDetailsScreen from '../screens/BankDetailsScreen';

// Import styling constants
import { colors } from '../styles/commonStyles';

// Initialize navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

/**
 * MainTabs Component
 * 
 * Configures the bottom tab navigation with 4 main screens.
 * Each tab has custom icons that change based on focus state.
 * 
 * Tab Configuration:
 * - Home: Dashboard with job statistics and new jobs
 * - Current Job: Active job management and tracking
 * - My Rides: Job history with status filtering
 * - Settings: User profile and app configuration
 * 
 * @returns {JSX.Element} Bottom tab navigator component
 */
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Dynamic icon selection based on route name and focus state
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // Map route names to appropriate Ionicons
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'CurrentJob') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'MyRides') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        
        // Tab bar styling configuration
        tabBarActiveTintColor: colors.themeColor,     // Active tab color
        tabBarInactiveTintColor: colors.textLight,   // Inactive tab color
        tabBarStyle: {
          backgroundColor: colors.white,             // Tab bar background
          borderTopWidth: 1,                        // Top border
          borderTopColor: colors.border,            // Border color
          paddingBottom: 8,                         // Bottom padding
          paddingTop: 8,                           // Top padding
          height: 60,                              // Total height
        },
        tabBarLabelStyle: {
          fontSize: 12,                            // Label font size
          fontWeight: '500',                       // Label font weight
        },
        headerShown: false,                        // Hide default headers (custom headers in screens)
      })}
    >
      {/* Main dashboard screen */}
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      
      {/* Active job management screen */}
      <Tab.Screen 
        name="CurrentJob" 
        component={CurrentJobScreen}
        options={{
          tabBarLabel: 'Current Job',
        }}
      />
      
      {/* Job history and status tracking screen */}
      <Tab.Screen 
        name="MyRides" 
        component={MyRidesScreen}
        options={{
          tabBarLabel: 'My Rides',
        }}
      />
      
      {/* User settings and profile management screen */}
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Main App Navigator
 * 
 * Root navigation component that wraps the bottom tabs with a stack navigator.
 * This allows for modal-style screens and detailed views that can be pushed on top
 * of the main tab navigation.
 * 
 * Stack Screens:
 * - Main: Contains the bottom tab navigator
 * - Notification: Full-screen notification list
 * - ProfileSetting: Profile editing form
 * - JobDetails: Detailed job view with map
 * 
 * @returns {JSX.Element} Complete navigation tree wrapped in NavigationContainer
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Main tab navigator (no header shown to avoid double headers) */}
        <Stack.Screen 
          name="Main" 
          component={MainTabs} 
          options={{ headerShown: false }} 
        />
        
        {/* Notification screen with custom header styling */}
        <Stack.Screen 
          name="Notification" 
          component={NotificationScreen}
          options={{
            title: 'Notifications',                 // Header title
            headerStyle: {
              backgroundColor: colors.white,        // Header background
            },
            headerTintColor: colors.titleColor,     // Header text/icon color
            headerTitleStyle: {
              fontWeight: 'bold',                   // Header title font weight
            },
          }}
        />
        
        {/* Profile settings screen with custom header */}
        <Stack.Screen 
          name="ProfileSetting" 
          component={ProfileSettingScreen}
          options={{
            title: 'Profile Settings',
            headerStyle: {
              backgroundColor: colors.white,
            },
            headerTintColor: colors.titleColor,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        
        {/* Job details screen with map integration */}
        <Stack.Screen 
          name="JobDetails" 
          component={JobDetailsScreen}
          options={{
            title: 'Job Details',
            headerStyle: {
              backgroundColor: colors.white,
            },
            headerTintColor: colors.titleColor,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        
        {/* Documents screen for driver document management */}
        <Stack.Screen 
          name="Documents" 
          component={DocumentsScreen}
          options={{
            title: 'Documents',
            headerStyle: {
              backgroundColor: colors.white,
            },
            headerTintColor: colors.titleColor,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        
        {/* Vehicle screen for driver vehicle information */}
        <Stack.Screen 
          name="Vehicle" 
          component={VehicleScreen}
          options={{
            title: 'Vehicle Details',
            headerStyle: {
              backgroundColor: colors.white,
            },
            headerTintColor: colors.titleColor,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        
        {/* Bank details screen for payment information */}
        <Stack.Screen 
          name="BankDetails" 
          component={BankDetailsScreen}
          options={{
            title: 'Bank Details',
            headerStyle: {
              backgroundColor: colors.white,
            },
            headerTintColor: colors.titleColor,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
