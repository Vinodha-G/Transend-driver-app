/**
 * responsiveDimensions.js - Responsive Design Utilities
 * 
 * Provides responsive dimensions, spacing, and layout utilities
 * for consistent UI across different screen sizes and Android/iOS platforms.
 * 
 * Features:
 * - Screen size detection (small, medium, large)
 * - Responsive spacing and padding
 * - Safe area insets handling
 * - Platform-specific adjustments
 * - Breakpoint-based responsive values
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import { Dimensions, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Device Type Detection
 */
export const isTablet = () => {
  const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
  return (
    (Platform.OS === 'ios' && SCREEN_WIDTH >= 768) ||
    (Platform.OS === 'android' && SCREEN_WIDTH >= 600) ||
    aspectRatio < 1.6
  );
};

export const isSmallDevice = () => {
  return SCREEN_WIDTH < 360;
};

export const isLargeDevice = () => {
  return SCREEN_WIDTH >= 768;
};

/**
 * Responsive Dimensions
 */
export const dimensions = {
  window: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  screen: Dimensions.get('screen'),
  isSmallDevice: isSmallDevice(),
  isTablet: isTablet(),
  isLargeDevice: isLargeDevice(),
};

/**
 * Base Spacing Unit
 * All spacing should be multiples of BASE_SPACING
 */
export const BASE_SPACING = 4;

/**
 * Responsive Spacing
 * Scales spacing based on device size
 */
export const spacing = {
  xs: BASE_SPACING * 1,        // 4px
  sm: BASE_SPACING * 2,        // 8px
  md: BASE_SPACING * 4,        // 16px
  lg: BASE_SPACING * 6,        // 24px
  xl: BASE_SPACING * 8,        // 32px
  xxl: BASE_SPACING * 12,      // 48px
  
  // Screen-specific spacing
  screenPadding: isTablet() ? BASE_SPACING * 6 : BASE_SPACING * 4,  // 24px tablet, 16px phone
  sectionSpacing: BASE_SPACING * 6,                                  // 24px
  cardPadding: BASE_SPACING * 4,                                     // 16px
  cardMargin: BASE_SPACING * 3,                                      // 12px
  headerHeight: Platform.OS === 'android' ? 56 : 56,                 // 56px
  tabBarHeight: Platform.OS === 'ios' ? 80 : 70,                     // iOS: 80px, Android: 70px
  
  // Responsive adjustments
  getResponsiveSpacing: (base) => {
    if (isTablet()) return base * 1.5;
    if (isSmallDevice()) return base * 0.85;
    return base;
  },
};

/**
 * Responsive Font Sizes
 */
export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  title: isTablet() ? 28 : 24,
  heading: isTablet() ? 22 : 18,
  body: isTablet() ? 16 : 14,
  
  getResponsiveFontSize: (base) => {
    if (isTablet()) return base * 1.2;
    if (isSmallDevice()) return base * 0.9;
    return base;
  },
};

/**
 * Responsive Dimensions for Components
 */
export const componentSizes = {
  // Buttons
  buttonHeight: Platform.OS === 'android' ? 48 : 44,
  buttonPadding: spacing.md,
  buttonBorderRadius: 8,
  
  // Cards
  cardBorderRadius: 12,
  cardElevation: Platform.OS === 'android' ? 3 : 0,
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  // Icons
  iconSmall: 16,
  iconMedium: 24,
  iconLarge: 32,
  iconXLarge: 48,
  
  // Profile Images
  profileSmall: 40,
  profileMedium: 50,
  profileLarge: 80,
  
  // Input Fields
  inputHeight: Platform.OS === 'android' ? 48 : 44,
  inputPadding: spacing.md,
  inputBorderRadius: 8,
  
  // Tab Bar
  tabIconSize: 24,
  tabLabelSize: 12,
  
  // Header
  headerHeight: Platform.OS === 'android' ? 56 : 56,
  headerPadding: spacing.md,
};

/**
 * Safe Area Insets
 * Note: Actual insets should come from react-native-safe-area-context
 * This provides fallback values
 */
export const safeAreaInsets = {
  top: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44,
  bottom: Platform.OS === 'ios' ? 34 : 0,
  left: 0,
  right: 0,
};

/**
 * Layout Helpers
 */
export const layout = {
  // Calculate responsive width (percentage-based)
  widthPercent: (percent) => (SCREEN_WIDTH * percent) / 100,
  
  // Calculate responsive height (percentage-based)
  heightPercent: (percent) => (SCREEN_HEIGHT * percent) / 100,
  
  // Grid columns based on device size
  gridColumns: () => {
    if (isTablet()) return 3;
    if (isLargeDevice()) return 2;
    return 2;
  },
  
  // Max content width for tablets
  maxContentWidth: isTablet() ? 1200 : SCREEN_WIDTH,
  
  // Container padding
  containerPadding: spacing.screenPadding,
  
  // Section spacing
  sectionSpacing: spacing.sectionSpacing,
};

/**
 * Android-Specific Adjustments
 */
export const androidAdjustments = {
  // Status bar height
  statusBarHeight: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  
  // Navigation bar height (gesture navigation)
  navigationBarHeight: Platform.OS === 'android' ? 0 : 0, // Usually handled by SafeAreaView
  
  // Elevation values for shadows
  elevation: {
    none: 0,
    low: 2,
    medium: 4,
    high: 8,
    veryHigh: 16,
  },
  
  // Ripple effect radius
  rippleRadius: 24,
  
  // Minimum touch target size (Material Design)
  minTouchTarget: 48,
};

/**
 * Responsive Values Helper
 * Returns different values based on device type
 */
export const responsive = (phone, tablet = phone, small = phone) => {
  if (isTablet()) return tablet;
  if (isSmallDevice()) return small;
  return phone;
};

/**
 * Percentage-based Dimensions
 */
export const percent = {
  width: (percent) => `${percent}%`,
  height: (percent) => `${percent}%`,
};

/**
 * Utility to get responsive padding
 */
export const getResponsivePadding = (
  top = spacing.md,
  right = spacing.md,
  bottom = spacing.md,
  left = spacing.md
) => {
  const scale = isTablet() ? 1.5 : isSmallDevice() ? 0.85 : 1;
  return {
    paddingTop: top * scale,
    paddingRight: right * scale,
    paddingBottom: bottom * scale,
    paddingLeft: left * scale,
  };
};

/**
 * Utility to get responsive margin
 */
export const getResponsiveMargin = (
  top = spacing.md,
  right = spacing.md,
  bottom = spacing.md,
  left = spacing.md
) => {
  const scale = isTablet() ? 1.5 : isSmallDevice() ? 0.85 : 1;
  return {
    marginTop: top * scale,
    marginRight: right * scale,
    marginBottom: bottom * scale,
    marginLeft: left * scale,
  };
};

export default {
  dimensions,
  spacing,
  fontSize,
  componentSizes,
  safeAreaInsets,
  layout,
  androidAdjustments,
  responsive,
  percent,
  getResponsivePadding,
  getResponsiveMargin,
  isTablet,
  isSmallDevice,
  isLargeDevice,
};

