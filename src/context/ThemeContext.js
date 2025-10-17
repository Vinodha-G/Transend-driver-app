/**
 * ThemeContext.js - Dark/Light Theme Management
 * 
 * Provides theme context for the entire application to manage dark and light modes.
 * Uses AsyncStorage to persist user theme preference across app sessions.
 * 
 * Features:
 * - Light/Dark theme color definitions
 * - Theme persistence with AsyncStorage
 * - Smooth theme transitions
 * - Global theme state management
 * 
 * Usage:
 * - Wrap app with ThemeProvider
 * - Use useTheme hook to access theme and toggle function
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

/**
 * Light Theme Colors
 * Clean, bright colors for light mode
 */
export const lightTheme = {
  // Primary Colors
  primary: '#00897B',              // Teal green (header, accent)
  primaryDark: '#00695C',          // Darker teal for pressed states
  secondary: '#ffb400',            // Orange accent
  
  // Background Colors
  background: '#FFFFFF',           // Main background
  surface: '#F5F5F5',             // Card/container background
  header: '#00897B',              // Header background
  
  // Text Colors
  text: '#1f1f1f',                // Primary text (dark)
  textSecondary: '#8f8f8f',       // Secondary text (medium gray)
  textLight: '#FFFFFF',           // Light text for dark backgrounds
  
  // UI Colors
  border: '#E0E0E0',              // Borders and dividers
  success: '#20b149',             // Success states
  error: '#ff4b4b',               // Error states
  warning: '#ffb400',             // Warning states
  
  // Interactive Colors
  tabActive: '#00897B',           // Active tab color
  tabInactive: '#8f8f8f',         // Inactive tab color
  
  // Status Bar
  statusBar: 'dark-content',      // Dark text on light background
};

/**
 * Dark Theme Colors
 * Dark, comfortable colors for dark mode
 */
export const darkTheme = {
  // Primary Colors
  primary: '#00ACC1',              // Lighter teal for dark mode
  primaryDark: '#0097A7',          // Darker variant
  secondary: '#FFC107',            // Amber accent
  
  // Background Colors
  background: '#121212',           // Main dark background
  surface: '#1E1E1E',             // Card/container background
  header: '#1F1F1F',              // Header background (slightly lighter)
  
  // Text Colors
  text: '#E0E0E0',                // Primary text (light)
  textSecondary: '#A0A0A0',       // Secondary text (medium light)
  textLight: '#FFFFFF',           // Light text
  
  // UI Colors
  border: '#333333',              // Borders and dividers
  success: '#4CAF50',             // Success states
  error: '#F44336',               // Error states
  warning: '#FF9800',             // Warning states
  
  // Interactive Colors
  tabActive: '#00ACC1',           // Active tab color
  tabInactive: '#A0A0A0',         // Inactive tab color
  
  // Status Bar
  statusBar: 'light-content',     // Light text on dark background
};

/**
 * Theme Context
 */
const ThemeContext = createContext();

/**
 * Theme Provider Component
 * 
 * Manages theme state and provides theme switching functionality
 * 
 * @param {Object} children - Child components
 */
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load saved theme preference on app start
   */
  useEffect(() => {
    loadThemePreference();
  }, []);

  /**
   * Load theme preference from AsyncStorage
   */
  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@theme_preference');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        // If no saved preference, use system preference
        const colorScheme = Appearance.getColorScheme();
        setIsDarkMode(colorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      // Default to light mode if error
      setIsDarkMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggle between light and dark mode
   */
  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      
      // Save preference to AsyncStorage
      await AsyncStorage.setItem('@theme_preference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  /**
   * Get current theme colors
   */
  const theme = isDarkMode ? darkTheme : lightTheme;

  /**
   * Context value
   */
  const value = {
    isDarkMode,
    theme,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to use theme context
 * 
 * @returns {Object} Theme context value
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;