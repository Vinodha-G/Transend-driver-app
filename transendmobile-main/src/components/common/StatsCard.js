/**
 * StatsCard.js - Statistics Display Component
 * 
 * A card component that displays numerical statistics with an icon and title.
 * Used primarily on the dashboard to show job counts and key metrics.
 * 
 * Features:
 * - Large count number display
 * - Associated icon for visual context
 * - Descriptive title text
 * - Navigation chevron for interaction
 * - Touchable interaction for drilling down
 * - Consistent card styling with shadow
 * 
 * Props:
 * - count: Numerical value to display (string or number)
 * - title: Descriptive text for the statistic
 * - onPress: Function called when card is pressed
 * - iconName: Ionicons name for the associated icon (optional)
 * 
 * Usage:
 * <StatsCard 
 *   count="5"
 *   title="New Orders"
 *   iconName="car"
 *   onPress={() => navigation.navigate('MyRides')}
 * />
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, commonStyles } from '../../styles/commonStyles';

/**
 * StatsCard Component
 * 
 * Displays a statistic with count, icon, title, and navigation in a card format.
 * 
 * @param {Object} props - Component props
 * @param {string|number} props.count - The numerical value to display prominently
 * @param {string} props.title - The descriptive title for this statistic
 * @param {Function} props.onPress - Callback function when card is pressed
 * @param {string} props.iconName - Ionicons name for the icon (defaults to "car")
 * @returns {JSX.Element} StatsCard component
 */
const StatsCard = ({ count, title, onPress, iconName = "car" }) => {
  return (
    <TouchableOpacity 
      style={styles.rideBox} 
      onPress={onPress}
      activeOpacity={0.7}                  // Visual feedback on press
    >
      {/* Top Row: Count and Icon */}
      <View style={[commonStyles.flexSpacing, commonStyles.gap1]}>
        {/* Large Count Display */}
        <Text style={styles.countText}>{count}</Text>
        
        {/* Associated Icon */}
        <View style={styles.rideIcon}>
          <Ionicons 
            name={iconName} 
            size={24} 
            color={colors.themeColor}       // Theme color for consistency
          />
        </View>
      </View>
      
      {/* Bottom Row: Title and Navigation Arrow */}
      <View style={[commonStyles.flexSpacing, commonStyles.gap1, commonStyles.mt1]}>
        {/* Statistic Title */}
        <Text style={[styles.titleText, commonStyles.titleColor]}>{title}</Text>
        
        {/* Navigation Arrow */}
        <Ionicons 
          name="chevron-forward" 
          size={16} 
          color={colors.textLight}          // Light color for subtle arrow
        />
      </View>
    </TouchableOpacity>
  );
};

/**
 * Component-Specific Styles
 * 
 * Styles specific to the StatsCard component layout and design.
 * Creates a compact card suitable for grid layouts.
 */
const styles = StyleSheet.create({
  /**
   * Main Card Container
   * Card-style container with shadow and responsive sizing
   */
  rideBox: {
    backgroundColor: colors.white,          // White background
    borderRadius: 12,                      // Rounded corners
    padding: 16,                           // Internal padding
    flex: 1,                               // Flexible sizing for grid layout
    marginHorizontal: 4,                   // Horizontal spacing between cards
    shadowColor: colors.black,             // Shadow color
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,                    // Light shadow
    shadowRadius: 4,
    elevation: 3,                          // Android shadow
  },
  
  /**
   * Count Text Styling
   * Large, bold number display for the main statistic
   */
  countText: {
    fontSize: 24,                          // Large font size for prominence
    fontWeight: 'bold',                    // Bold weight for emphasis
    color: colors.titleColor,              // Dark color for contrast
  },
  
  /**
   * Icon Container
   * Circular container for the statistic icon
   */
  rideIcon: {
    width: 40,                             // Fixed width
    height: 40,                            // Fixed height (square)
    borderRadius: 20,                      // Make circular
    backgroundColor: colors.light,         // Light background
    justifyContent: 'center',              // Center icon vertically
    alignItems: 'center',                  // Center icon horizontally
  },
  
  /**
   * Title Text Styling
   * Descriptive text for the statistic
   */
  titleText: {
    fontSize: 14,                          // Medium text size
    fontWeight: '500',                     // Medium font weight
  },
});

export default StatsCard;
