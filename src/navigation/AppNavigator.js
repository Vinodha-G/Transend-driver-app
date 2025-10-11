/**
 * AppNavigator.js - Complete Navigation Setup
 * Ensures bottom tabs remain visible and handles safe area & keyboard.
 */

import React from 'react';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
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

// Styles
import { colors } from '../styles/commonStyles';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

/**
 * MainTabs Component - Bottom Tabs
 */
function MainTabs() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'CurrentJob') iconName = focused ? 'car' : 'car-outline';
            else if (route.name === 'MyRides') iconName = focused ? 'list' : 'list-outline';
            else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.themeColor,
          tabBarInactiveTintColor: colors.textLight,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            height: Platform.OS === 'ios' ? 80 : 70,
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
        <Tab.Screen name="CurrentJob" component={CurrentJobScreen} options={{ tabBarLabel: 'Current Job' }} />
        <Tab.Screen name="MyRides" component={MyRidesScreen} options={{ tabBarLabel: 'My Rides' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

/**
 * AppNavigator - Root Stack
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="Notification"
          component={NotificationScreen}
          options={{
            title: 'Notifications',
            headerStyle: { backgroundColor: colors.white },
            headerTintColor: colors.titleColor,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="ProfileSetting"
          component={ProfileSettingScreen}
          options={{
            title: 'Profile Settings',
            headerStyle: { backgroundColor: colors.white },
            headerTintColor: colors.titleColor,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="JobDetails"
          component={JobDetailsScreen}
          options={{
            title: 'Job Details',
            headerStyle: { backgroundColor: colors.white },
            headerTintColor: colors.titleColor,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="Documents"
          component={DocumentsScreen}
          options={{
            title: 'Documents',
            headerStyle: { backgroundColor: colors.white },
            headerTintColor: colors.titleColor,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="Vehicle"
          component={VehicleScreen}
          options={{
            title: 'Vehicle Details',
            headerStyle: { backgroundColor: colors.white },
            headerTintColor: colors.titleColor,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="BankDetails"
          component={BankDetailsScreen}
          options={{
            title: 'Bank Details',
            headerStyle: { backgroundColor: colors.white },
            headerTintColor: colors.titleColor,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
