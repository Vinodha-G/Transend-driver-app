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
import { Appearance, useColorScheme } from 'react-native';
import { lightTheme, darkTheme, THEME_STORAGE_KEY, THEME_MODE } from '../utils/theme';

// Re-export themes for backward compatibility
export { lightTheme, darkTheme };

/**
 * Theme Context
 */
const ThemeContext = createContext();

/**
 * Theme Provider Component
 * 
 * Manages theme state and provides theme switching functionality.
 * Supports system theme detection and persistent storage.
 * 
 * @param {Object} children - Child components
 */
export const ThemeProvider = ({ children }) => {
  // Use system color scheme as initial value
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [isLoading, setIsLoading] = useState(true);
  const [themeMode, setThemeMode] = useState(THEME_MODE.SYSTEM); // 'light', 'dark', or 'system'

  /**
   * Load saved theme preference on app start
   */
  useEffect(() => {
    loadThemePreference();
  }, []);

  /**
   * Listen to system theme changes when in system mode
   */
  useEffect(() => {
    if (themeMode === THEME_MODE.SYSTEM) {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        setIsDarkMode(colorScheme === 'dark');
      });
      return () => subscription?.remove();
    }
  }, [themeMode]);

  /**
   * Load theme preference from AsyncStorage
   */
  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        // Support both old format ('dark'/'light') and new format with mode
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setThemeMode(savedTheme);
          setIsDarkMode(savedTheme === 'dark');
        } else {
          // Try to parse as JSON for future format
          try {
            const parsed = JSON.parse(savedTheme);
            setThemeMode(parsed.mode || THEME_MODE.SYSTEM);
            if (parsed.mode === THEME_MODE.SYSTEM) {
              setIsDarkMode(systemColorScheme === 'dark');
            } else {
              setIsDarkMode(parsed.mode === THEME_MODE.DARK);
            }
          } catch {
            // Fallback to system if parse fails
            setThemeMode(THEME_MODE.SYSTEM);
            setIsDarkMode(systemColorScheme === 'dark');
          }
        }
      } else {
        // If no saved preference, use system preference
        setThemeMode(THEME_MODE.SYSTEM);
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      // Default to system preference if error
      setThemeMode(THEME_MODE.SYSTEM);
      setIsDarkMode(systemColorScheme === 'dark');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggle between light and dark mode
   */
  const toggleTheme = async () => {
    try {
      const newDarkMode = !isDarkMode;
      setIsDarkMode(newDarkMode);
      setThemeMode(newDarkMode ? THEME_MODE.DARK : THEME_MODE.LIGHT);
      
      // Save preference to AsyncStorage
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newDarkMode ? THEME_MODE.DARK : THEME_MODE.LIGHT);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  /**
   * Set theme mode explicitly
   * 
   * @param {string} mode - 'light', 'dark', or 'system'
   */
  const setTheme = async (mode) => {
    try {
      setThemeMode(mode);
      
      if (mode === THEME_MODE.SYSTEM) {
        setIsDarkMode(systemColorScheme === 'dark');
      } else {
        setIsDarkMode(mode === THEME_MODE.DARK);
      }
      
      // Save preference to AsyncStorage
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
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
    themeMode,
    toggleTheme,
    setTheme,
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