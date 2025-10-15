/**
 * commonStyles.js - Centralized Styling System
 * 
 * This file contains all the common styles, colors, and design tokens used throughout
 * the Driver App. It ensures visual consistency and makes theme management easier.
 * 
 * Style Categories:
 * - Color palette with Bootstrap-inspired naming
 * - Typography utilities and font weights
 * - Layout and spacing utilities
 * - Component-specific style helpers
 * - Responsive design utilities
 * 
 * Usage:
 * - Import colors and styles in components
 * - Use semantic color names for theming
 * - Apply utility classes for quick styling
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import { StyleSheet, Dimensions } from 'react-native';

// Get device dimensions for responsive design
const { width, height } = Dimensions.get('window');

/**
 * Color System
 * 
 * Original Driver App color palette matching the HTML/CSS web version.
 * All colors used in the app should be defined here to maintain visual consistency.
 * 
 * Color Categories:
 * - Original Theme Colors: Matching the web app CSS variables
 * - Semantic Colors: Success, error, warning, accent colors
 * - Neutral Colors: Light, dark, white, black
 * - App-Specific: Theme colors and custom brand colors
 * - Text Colors: Title, content text for hierarchy
 * - UI Colors: Background, border, surface colors
 */
export const colors = {
  // Original Theme Colors (matching CSS variables)
  themeColor: '#199675',                 // Main theme color (25, 150, 117) - Teal green
  titleColor: '#1f1f1f',                 // Primary text color (31, 31, 31) - Dark gray
  contentColor: '#8f8f8f',               // Content/secondary text (143, 143, 143) - Medium gray
  secondaryColor: '#ffb400',             // Secondary accent (255, 180, 0) - Orange
  successColor: '#20b149',               // Success states (32, 177, 73) - Green
  errorColor: '#ff4b4b',                 // Error/danger states (255, 75, 75) - Red
  accentColor: '#3a6de5',                // Accent color (58, 109, 229) - Blue
  
  // UI Element Colors
  boxBg: '#f5f5f5',                      // Box background (245, 245, 245) - Light gray
  lineColor: '#e9e9e9',                  // Border/line color (233, 233, 233) - Very light gray
  
  // Base Colors
  white: '#ffffff',                      // Pure white
  black: '#000000',                      // Pure black
  
  // Legacy/Bootstrap Compatibility Colors
  primary: '#199675',                    // Same as theme color
  secondary: '#ffb400',                  // Same as secondary color
  success: '#20b149',                    // Same as success color
  danger: '#ff4b4b',                     // Same as error color
  warning: '#ffb400',                    // Same as secondary color
  info: '#3a6de5',                       // Same as accent color
  light: '#f5f5f5',                      // Same as box background
  dark: '#1f1f1f',                       // Same as title color
  
  // Text Hierarchy
  textLight: '#8f8f8f',                  // Same as content color
  
  // UI Element Colors
  border: '#e9e9e9',                     // Same as line color
  background: '#f5f5f5'                  // Same as box background
};

/**
 * Common Styles
 * 
 * Reusable style objects organized by category for consistent application styling.
 * These styles follow utility-first principles for quick component development.
 * 
 * Style Categories:
 * - Layout: Containers and flex utilities
 * - Headers: App header and navigation styles
 * - Components: Common UI component styles
 * - Typography: Text styling utilities
 * - Spacing: Margin, padding, and gap utilities
 */
export const commonStyles = StyleSheet.create({
  // === LAYOUT CONTAINERS ===
  
  /**
   * Main Container
   * Primary container for screen layouts with background
   */
  container: {
    flex: 1,                             // Take full available space
    backgroundColor: colors.background,   // Light gray background
  },
  
  /**
   * Custom Container
   * Container with standard padding for content areas
   */
  customContainer: {
    paddingHorizontal: 16,               // 16px horizontal padding
    paddingVertical: 8,                  // 8px vertical padding
  },
  
  // === HEADER STYLES ===
  
  /**
   * App Header
   * Standard header styling with bottom border
   */
  header: {
    backgroundColor: colors.themeColor,      // Theme color background (teal green)
    paddingHorizontal: 16,               // Horizontal padding
    paddingVertical: 12,                 // Vertical padding
    borderBottomWidth: 1,                // Bottom border line
    borderBottomColor: colors.lineColor, // Light gray border
  },
  
  /**
   * Header Panel
   * Flex layout for header content with space between elements
   */
  headerPanel: {
    flexDirection: 'row',                // Horizontal layout
    justifyContent: 'space-between',     // Space items apart
    alignItems: 'center',                // Center align vertically
  },
  
  // === FLEX UTILITIES ===
  
  /**
   * Flex Align Center
   * Horizontal row with vertically centered items
   */
  flexAlignCenter: {
    flexDirection: 'row',                // Horizontal layout
    alignItems: 'center',                // Center items vertically
  },
  
  /**
   * Flex Spacing
   * Row layout with space between items and center alignment
   */
  flexSpacing: {
    flexDirection: 'row',                // Horizontal layout
    justifyContent: 'space-between',     // Distribute space between items
    alignItems: 'center',                // Center items vertically
  },
  
  // === COMPONENT STYLES ===
  
  /**
   * Logo Component
   * Standard app logo dimensions and scaling
   */
  logo: {
    width: 120,                          // Fixed width
    height: 40,                          // Fixed height
    resizeMode: 'contain',               // Maintain aspect ratio
  },
  
  /**
   * Icon Button
   * Rounded button container for icons
   */
  iconBtn: {
    padding: 8,                          // Internal padding
    borderRadius: 8,                     // Rounded corners
    backgroundColor: 'transparent',      // Transparent background for header visibility
  },
  
  /**
   * Profile Image
   * Circular profile picture styling
   */
  profileImg: {
    width: 50,                           // Fixed width
    height: 50,                          // Fixed height (square)
    borderRadius: 25,                    // Make circular (half of width/height)
  },
  
  // === TEXT COLOR UTILITIES ===
  
  /**
   * Title Color
   * Primary text color for headings and important text
   */
  titleColor: {
    color: colors.titleColor,            // Dark gray color
  },
  
  /**
   * Theme Color
   * Primary brand color for text elements
   */
  themeColor: {
    color: colors.themeColor,            // Blue brand color
  },
  
  /**
   * Light Text
   * Secondary text color for less important content
   */
  textLight: {
    color: colors.textLight,             // Medium gray color
  },
  
  // === FONT WEIGHT UTILITIES ===
  
  /**
   * Font Weight: Medium (500)
   * Semi-bold text for emphasis
   */
  fwMedium: {
    fontWeight: '500',
  },
  
  /**
   * Font Weight: Bold
   * Bold text for headings and strong emphasis
   */
  fwBold: {
    fontWeight: 'bold',
  },
  
  /**
   * Font Weight: Normal (400)
   * Default font weight for body text
   */
  fwNormal: {
    fontWeight: 'normal',
  },
  
  /**
   * Font Weight: Light (300)
   * Light font weight for subtle text
   */
  fwLight: {
    fontWeight: '300',
  },
  
  // === MARGIN UTILITIES ===
  
  /**
   * Margin Top: Small (8px)
   * Small vertical spacing above element
   */
  mt1: {
    marginTop: 8,
  },
  
  /**
   * Margin Top: Medium (16px)
   * Medium vertical spacing above element
   */
  mt2: {
    marginTop: 16,
  },
  
  // === PADDING UTILITIES ===
  
  /**
   * No Padding
   * Remove all padding from element
   */
  p0: {
    padding: 0,
  },
  
  /**
   * No Horizontal Padding
   * Remove left and right padding
   */
  px0: {
    paddingHorizontal: 0,
  },
  
  // === GAP UTILITIES ===
  // Used with flexbox to create spacing between child elements
  
  /**
   * Gap: Extra Small (4px)
   * Minimal spacing between flex items
   */
  gap1: {
    gap: 4,
  },
  
  /**
   * Gap: Small (8px)
   * Small spacing between flex items
   */
  gap2: {
    gap: 8,
  },
  
  /**
   * Gap: Medium (12px)
   * Medium spacing between flex items
   */
  gap3: {
    gap: 12,
  },
});

export default commonStyles;
