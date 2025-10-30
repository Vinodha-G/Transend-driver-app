/**
 * theme.js - Centralized Theme Color Definitions
 * 
 * Defines complete color palettes for light and dark themes.
 * Used throughout the app for consistent theming.
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

/**
 * Light Theme Colors
 * Bright, clean colors for light mode
 */
export const lightTheme = {
  // Primary Colors
  primary: '#00897B',              // Teal green (main brand color)
  primaryDark: '#00695C',          // Darker teal for pressed states
  primaryLight: '#4DB6AC',         // Lighter teal for highlights
  secondary: '#ffb400',            // Orange accent
  secondaryDark: '#FF8F00',        // Darker orange
  
  // Background Colors
  background: '#FFFFFF',           // Main app background
  surface: '#F5F5F5',             // Card/container background
  surfaceElevated: '#FAFAFA',     // Elevated surfaces
  header: '#00897B',              // Header background
  card: '#FFFFFF',                 // Card background
  
  // Text Colors
  text: '#1f1f1f',                // Primary text (dark)
  textSecondary: '#8f8f8f',       // Secondary text (medium gray)
  textLight: '#FFFFFF',           // Light text for dark backgrounds
  textDisabled: '#BDBDBD',        // Disabled text
  
  // UI Colors
  border: '#E0E0E0',              // Borders and dividers
  divider: '#E0E0E0',             // Dividers
  shadow: 'rgba(0, 0, 0, 0.1)',   // Shadow color
  
  // Semantic Colors
  success: '#20b149',             // Success states
  error: '#ff4b4b',               // Error states
  warning: '#ffb400',             // Warning states
  info: '#3a6de5',                // Info states
  
  // Interactive Colors
  tabActive: '#00897B',           // Active tab color
  tabInactive: '#8f8f8f',         // Inactive tab color
  buttonPrimary: '#00897B',       // Primary button
  buttonSecondary: '#ffb400',     // Secondary button
  
  // Status Bar
  statusBar: 'dark-content',       // Dark text on light background
  
  // Additional Colors (for compatibility)
  titleColor: '#1f1f1f',          // Title text color
  contentColor: '#8f8f8f',        // Content text color
  themeColor: '#00897B',          // Theme color alias
  danger: '#ff4b4b',              // Danger color alias
  white: '#FFFFFF',               // White
  black: '#000000',               // Black
};

/**
 * Dark Theme Colors
 * Dark, comfortable colors for dark mode
 */
export const darkTheme = {
  // Primary Colors
  primary: '#00ACC1',              // Lighter teal for dark mode
  primaryDark: '#0097A7',          // Darker variant
  primaryLight: '#4DD0E1',        // Lighter teal
  secondary: '#FFC107',            // Amber accent
  secondaryDark: '#FFA000',        // Darker amber
  
  // Background Colors
  background: '#121212',           // Main dark background (Material Design dark)
  surface: '#1E1E1E',             // Card/container background
  surfaceElevated: '#2C2C2C',     // Elevated surfaces
  header: '#1F1F1F',              // Header background (slightly lighter)
  card: '#1E1E1E',                 // Card background
  
  // Text Colors
  text: '#E0E0E0',                // Primary text (light)
  textSecondary: '#A0A0A0',       // Secondary text (medium light)
  textLight: '#FFFFFF',           // Light text
  textDisabled: '#616161',        // Disabled text
  
  // UI Colors
  border: '#333333',              // Borders and dividers
  divider: '#333333',             // Dividers
  shadow: 'rgba(0, 0, 0, 0.3)',   // Shadow color (stronger)
  
  // Semantic Colors
  success: '#4CAF50',             // Success states
  error: '#F44336',               // Error states
  warning: '#FF9800',             // Warning states
  info: '#2196F3',                // Info states
  
  // Interactive Colors
  tabActive: '#00ACC1',           // Active tab color
  tabInactive: '#A0A0A0',         // Inactive tab color
  buttonPrimary: '#00ACC1',       // Primary button
  buttonSecondary: '#FFC107',     // Secondary button
  
  // Status Bar
  statusBar: 'light-content',     // Light text on dark background
  
  // Additional Colors (for compatibility)
  titleColor: '#E0E0E0',          // Title text color
  contentColor: '#A0A0A0',        // Content text color
  themeColor: '#00ACC1',          // Theme color alias
  danger: '#F44336',              // Danger color alias
  white: '#FFFFFF',               // White
  black: '#000000',               // Black
};

/**
 * Get theme colors based on theme mode
 * 
 * @param {boolean} isDark - Whether dark mode is enabled
 * @returns {Object} Theme colors object
 */
export const getThemeColors = (isDark) => {
  return isDark ? darkTheme : lightTheme;
};

/**
 * Theme storage key for AsyncStorage
 */
export const THEME_STORAGE_KEY = '@theme';

/**
 * Theme mode constants
 */
export const THEME_MODE = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system', // Follow system preference
};

export default {
  lightTheme,
  darkTheme,
  getThemeColors,
  THEME_STORAGE_KEY,
  THEME_MODE,
};

