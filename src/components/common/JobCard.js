/**
 * JobCard.js - Reusable Job Display Component
 * 
 * A card component that displays job information in a consistent format
 * across different screens. Shows company details, job type, timing,
 * and pickup/dropoff locations with appropriate icons.
 * 
 * Features:
 * - Company profile image and name
 * - Order ID and job type display
 * - Date and time information
 * - Pickup and dropoff locations with colored icons
 * - Touchable interaction for navigation
 * - Consistent card styling with shadow
 * 
 * Props:
 * - job: Job object containing all job details
 * - onPress: Function called when card is pressed
 * 
 * Usage:
 * <JobCard 
 *   job={jobObject}
 *   onPress={() => navigation.navigate('JobDetails', { job })}
 * />
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { commonStyles } from '../../styles/commonStyles';
import { spacing, componentSizes } from '../../utils/responsiveDimensions';

/**
 * JobCard Component
 * 
 * Displays a job's details in a card format with company info,
 * job type, timing, and location details.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.job - Job object containing:
 *   - companyName: Name of the hiring company
 *   - orderId: Unique order identifier
 *   - profileImage: Company's profile image URL
 *   - type: Job type (e.g., 'LTL', 'FTL')
 *   - dateTime: Scheduled date and time
 *   - pickupLocation: Pickup address
 *   - dropoffLocation: Delivery address
 * @param {Function} props.onPress - Callback function when card is pressed
 * @returns {JSX.Element} JobCard component
 */
const JobCard = ({ job, onPress }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity 
      style={[styles.myRideBox, { backgroundColor: theme.surface }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Job Header: Company info and order details */}
      <View style={styles.myRideHead}>
        {/* Company Profile Image */}
        <Image 
          source={
            job.profileImage && job.profileImage.trim() !== '' 
              ? { uri: job.profileImage }
              : require('../../../assets/images/profile/p1.png')
          } 
          style={[commonStyles.profileImg, styles.profileImg]} 
        />
        
        {/* Company and Order Information */}
        <View style={styles.myRideContent}>
          <View style={{ flexDirection: 'column' }}>
            <Text style={[styles.companyName, { color: theme.text }, commonStyles.fwMedium]}>
              {job.companyName}
            </Text>
            <Text style={[styles.orderId, { color: theme.primary }, commonStyles.fwMedium]}>
              Order Id : {job.orderId}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Job Details: Type, timing, and locations */}
      <View style={styles.myRideDetails}>
        {/* Job Type and Date/Time */}
        <View style={styles.rideInfo}>
          {/* Job Type (LTL, FTL, etc.) */}
          <Text style={[styles.ltlText, { color: theme.primary }, commonStyles.fwBold]}>
            {job.type}
          </Text>
          {/* Scheduled Date and Time */}
          <Text style={[styles.dateTime, { color: theme.text }, commonStyles.fwNormal]}>
            {job.dateTime}
          </Text>
        </View>
        
        {/* Location Information */}
        <View style={styles.rideLocationListing}>
          {/* Pickup Location */}
          <View style={styles.locationBox}>
            <Ionicons 
              name="location" 
              size={16} 
              color={theme.error}
              style={styles.locationIcon} 
            />
            <Text style={[styles.locationText, { color: theme.textSecondary }, commonStyles.fwLight]}>
              {job.pickupLocation}
            </Text>
          </View>
          
          {/* Dropoff Location */}
          <View style={styles.locationBox}>
            <Ionicons 
              name="navigate" 
              size={16} 
              color={theme.success}
              style={styles.locationIcon} 
            />
            <Text style={[styles.locationText, { color: theme.textSecondary }, commonStyles.fwLight]}>
              {job.dropoffLocation}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Component-Specific Styles
 * 
 * Styles specific to the JobCard component layout and design.
 * Creates a card-like appearance with proper spacing and typography.
 */
const styles = StyleSheet.create({
  /**
   * Main Card Container
   * Outer container with card styling and shadow
   * Note: backgroundColor applied dynamically via theme
   */
  myRideBox: {
    borderRadius: componentSizes.cardBorderRadius,  // Responsive border radius
    padding: spacing.md,                    // Responsive internal padding
    marginBottom: spacing.sm + 4,          // Responsive bottom spacing between cards
    shadowColor: '#000',                   // Shadow color
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,                    // Light shadow
    shadowRadius: 4,
    elevation: Platform.OS === 'android' ? componentSizes.cardElevation : 0, // Android shadow
  },
  
  /**
   * Card Header Container
   * Top section with company image and basic info
   */
  myRideHead: {
    flexDirection: 'row',                  // Horizontal layout
    alignItems: 'center',                  // Center items vertically
    marginBottom: spacing.sm + 4,         // Responsive bottom spacing
  },
  
  /**
   * Profile Image Styling
   * Additional margin for company profile image
   */
  profileImg: {
    marginRight: spacing.sm + 4,          // Responsive right spacing from text content
  },
  
  /**
   * Content Container
   * Container for company name and order ID
   */
  myRideContent: {
    flex: 1,                               // Take remaining space
  },
  
  /**
   * Company Name Text
   * Primary company identifier text
   */
  companyName: {
    fontSize: 16,                          // Medium text size
  },
  
  /**
   * Order ID Text
   * Order reference number text
   */
  orderId: {
    fontSize: 14,                          // Smaller text size
  },
  
  /**
   * Job Details Container
   * Section containing job type, timing, and locations
   */
  myRideDetails: {
    marginTop: 8,                          // Top spacing from header
  },
  
  /**
   * Job Info Container
   * Container for job type and date/time
   */
  rideInfo: {
    marginBottom: spacing.sm + 4,         // Responsive bottom spacing before locations
  },
  
  /**
   * Job Type Text (LTL, FTL, etc.)
   * Prominent text for job classification
   */
  ltlText: {
    fontSize: 16,                          // Medium text size
    marginBottom: spacing.xs,             // Responsive bottom spacing
  },
  
  /**
   * Date and Time Text
   * Scheduled timing information
   */
  dateTime: {
    fontSize: 14,                          // Smaller text size
  },
  
  /**
   * Location Listing Container
   * Container for pickup and dropoff locations
   */
  rideLocationListing: {
    gap: spacing.sm,                      // Responsive spacing between location items
  },
  
  /**
   * Individual Location Container
   * Row layout for icon and location text
   */
  locationBox: {
    flexDirection: 'row',                  // Horizontal layout
    alignItems: 'center',                  // Center items vertically
    paddingVertical: 4,                    // Vertical padding
  },
  
  /**
   * Location Icon Styling
   * Spacing for pickup/dropoff icons
   */
  locationIcon: {
    marginRight: spacing.sm,               // Responsive right spacing from text
  },
  
  /**
   * Location Text
   * Address text styling
   */
  locationText: {
    fontSize: 14,                          // Standard text size
    flex: 1,                               // Take remaining space for text wrapping
  },
});

export default JobCard;
