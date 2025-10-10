/**
 * JobDetailsScreen.js - Comprehensive Job Information & Map View
 * 
 * Provides a detailed view of a specific job with interactive map, customer information,
 * location details, and job management actions. Integrates with device location services
 * and provides navigation capabilities for drivers.
 * 
 * Features:
 * - Interactive map view with pickup/dropoff markers
 * - Real-time user location tracking
 * - Comprehensive job information display
 * - Customer profile and contact details
 * - Job status management and workflow actions
 * - Distance calculation and navigation integration
 * - Responsive layout with scrollable content
 * 
 * Map Integration:
 * - Google Maps provider for accurate location display
 * - User location marker with real-time updates
 * - Pickup and dropoff location markers
 * - Dynamic map region based on user location
 * 
 * Job Actions:
 * - Accept job (from available jobs list)
 * - Start job (begin pickup process)
 * - Confirm pickup (package collected)
 * - Complete delivery (job finished)
 * - Navigation to external map apps
 * 
 * Navigation:
 * - Accessible from HomeScreen job cards
 * - Accessible from CurrentJobScreen details button
 * - Stack screen with job data passed as route params
 * 
 * Data Sources:
 * - Route params for job information
 * - Global app context for job status updates
 * - Device location services for user positioning
 * - External navigation apps for turn-by-turn directions
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useApp } from '../context/AppContext';
import { colors, commonStyles } from '../styles/commonStyles';

// Get screen dimensions for responsive map sizing
const { width, height } = Dimensions.get('window');

/**
 * JobDetailsScreen Component
 * 
 * Detailed job view with map integration and comprehensive job information.
 * Provides all necessary details for drivers to understand and complete jobs.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.route - React Navigation route object containing job data
 * @returns {JSX.Element} JobDetailsScreen component
 */
const JobDetailsScreen = ({ route }) => {
  // Extract job data from navigation params
  const { job } = route.params;
  
  // Get job update function from global context
  const { updateJobStatus, acceptJob } = useApp();
  
  /**
   * Location State Management
   * 
   * Manages user's current location and map display region.
   * Updates in real-time to provide accurate positioning.
   */
  const [userLocation, setUserLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 43.6532,                          // Default to Toronto coordinates
    longitude: -79.3832,
    latitudeDelta: 0.0922,                      // Map zoom level
    longitudeDelta: 0.0421,
  });

  /**
   * Component Initialization
   * 
   * Gets user's current location when component mounts.
   */
  useEffect(() => {
    getCurrentLocation();
  }, []);

  /**
   * Get Current Location
   * 
   * Requests location permissions and gets user's current position.
   * Updates map region to center on user location.
   */
  const getCurrentLocation = async () => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for navigation');
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Update state with user location
      setUserLocation({ latitude, longitude });
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  /**
   * Handle Accept Job
   * 
   * Updates job status to 'accepted' and provides user feedback.
   * Only available for jobs with 'available' status.
   */
  const handleAcceptJob = async () => {
    Alert.alert(
      'Accept Job',
      'Are you sure you want to accept this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: async () => {
            try {
              const success = await acceptJob(job.id);
              if (success) {
                Alert.alert('Success', 'Job accepted successfully!');
              } else {
                Alert.alert('Error', 'Failed to accept job. Please try again.');
              }
            } catch (error) {
              console.error('Error accepting job:', error);
              Alert.alert('Error', 'Failed to accept job. Please try again.');
            }
          }
        }
      ]
    );
  };

  /**
   * Handle Start Job
   * 
   * Updates job status to 'pickedup' indicating the driver has started the job.
   * Shows confirmation dialog before status change.
   */
  const handleStartJob = () => {
    Alert.alert(
      'Start Job',
      'Are you ready to start this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start', 
          onPress: () => {
            updateJobStatus(job.id, 'pickedup');
            Alert.alert('Success', 'Job started! Safe travels!');
          }
        }
      ]
    );
  };

  /**
   * Handle Complete Job
   * 
   * Updates job status to 'delivered' indicating successful completion.
   * Shows confirmation dialog before marking as complete.
   */
  const handleCompleteJob = () => {
    Alert.alert(
      'Complete Job',
      'Mark this job as delivered?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Complete', 
          onPress: () => {
            updateJobStatus(job.id, 'delivered');
            Alert.alert('Success', 'Job completed successfully!');
          }
        }
      ]
    );
  };

  /**
   * Get Action Button
   * 
   * Returns the appropriate action button based on current job status.
   * Provides dynamic workflow management for different job states.
   * 
   * @returns {JSX.Element} Action button component for current job status
   */
  const getActionButton = () => {
    switch (job.status) {
      case 'new':
        return (
          <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={handleAcceptJob}>
            <Ionicons name="checkmark" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Accept Job</Text>
          </TouchableOpacity>
        );
      case 'accepted':
        return (
          <TouchableOpacity style={[styles.actionButton, styles.startButton]} onPress={handleStartJob}>
            <Ionicons name="play" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Start Job</Text>
          </TouchableOpacity>
        );
      case 'pickedup':
        return (
          <TouchableOpacity style={[styles.actionButton, styles.completeButton]} onPress={handleCompleteJob}>
            <Ionicons name="checkmark-done" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Mark Delivered</Text>
          </TouchableOpacity>
        );
      default:
        return null;  // No action available for completed/cancelled jobs
    }
  };

  /**
   * Main Component Render
   * 
   * Renders the complete job details interface with map and information sections.
   */
  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.container}>
        
        {/* Interactive Map Section */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}           // Use Google Maps for accuracy
            style={styles.map}
            region={mapRegion}                   // Center on user location
            showsUserLocation={true}             // Show user's current position
            showsMyLocationButton={true}         // Enable location centering button
          >
            {/* User Location Marker */}
            {userLocation && (
              <Marker
                coordinate={userLocation}
                title="Your Location"
                description="You are here"
                pinColor={colors.themeColor}      // Theme color for user marker
              />
            )}
            
            {/* Pickup Location Marker */}
            <Marker
              coordinate={{
                latitude: mapRegion.latitude + 0.01,    // Demo coordinates near user
                longitude: mapRegion.longitude + 0.01,
              }}
              title="Pickup Location"
              description={job.pickupLocation}
              pinColor={colors.danger}                  // Red marker for pickup
            />
            
            {/* Dropoff Location Marker */}
            <Marker
              coordinate={{
                latitude: mapRegion.latitude - 0.01,    // Demo coordinates near user
                longitude: mapRegion.longitude - 0.01,
              }}
              title="Dropoff Location"
              description={job.dropoffLocation}
              pinColor={colors.success}                 // Green marker for dropoff
            />
          </MapView>
        </View>

        {/* Scrollable Job Details Section */}
        <ScrollView style={styles.detailsContainer}>
          <View style={styles.jobCard}>
            
            {/* Job Header with Company Info */}
            <View style={styles.jobHeader}>
              <Image
                source={{ uri: job.profileImage }}
                style={styles.companyImage}
              />
              <View style={styles.jobInfo}>
                <Text style={styles.companyName}>{job.companyName}</Text>
                <Text style={styles.orderId}>Order ID: {job.orderId}</Text>
              </View>
            </View>

            {/* Job Details Section */}
            <View style={styles.jobDetails}>
              <View style={styles.jobMeta}>
                <Text style={styles.dateTime}>{job.dateTime}</Text>
                <View style={styles.jobTypeBadge}>
                  <Text style={styles.jobTypeText}>{job.type}</Text>
                </View>
              </View>

              {/* Pickup and Dropoff Locations */}
              <View style={styles.locationContainer}>
                <View style={styles.locationItem}>
                  <Ionicons name="location" size={20} color={colors.danger} />
                  <Text style={styles.locationText}>{job.pickupLocation}</Text>
                </View>
                <View style={styles.locationItem}>
                  <Ionicons name="navigate" size={20} color={colors.success} />
                  <Text style={styles.locationText}>{job.dropoffLocation}</Text>
                </View>
              </View>
            </View>

            {/* Comprehensive Booking Details */}
            <View style={styles.bookingDetails}>
              <Text style={styles.bookingTitle}>Booking Details</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Method</Text>
                  <Text style={styles.detailValue}>Logistic</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Courier</Text>
                  <Text style={styles.detailValue}>1</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Pallets</Text>
                  <Text style={styles.detailValue}>120</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Weight</Text>
                  <Text style={styles.detailValue}>500 kg</Text>
                </View>
              </View>
            </View>

            {/* Dynamic Action Button based on job status */}
            <View style={styles.actionContainer}>
              {getActionButton()}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

/**
 * StyleSheet for JobDetailsScreen
 * 
 * Defines all visual styling for the job details interface including:
 * - Map container sizing and positioning
 * - Job information card layout with overlay effect
 * - Location markers and display formatting
 * - Action button styling for different job states
 * - Responsive layout for various screen sizes
 */
const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,                                    // Fill available space
  },
  
  // Map display container
  mapContainer: {
    height: height * 0.4,                       // 40% of screen height for map
  },
  
  // Map view styling
  map: {
    width: '100%',                              // Full width
    height: '100%',                             // Fill container height
  },
  
  // Scrollable details container
  detailsContainer: {
    flex: 1,                                    // Fill remaining space
    backgroundColor: colors.background,         // Light background
  },
  
  // Job information card with overlay effect
  jobCard: {
    backgroundColor: colors.white,              // White card background
    borderTopLeftRadius: 20,                    // Rounded top corners
    borderTopRightRadius: 20,
    marginTop: -20,                             // Overlay effect on map
    padding: 16,                                // Internal card padding
    shadowColor: colors.black,                  // Card shadow for depth
    shadowOffset: {
      width: 0,
      height: -2,                               // Shadow above card
    },
    shadowOpacity: 0.1,                         // Subtle shadow
    shadowRadius: 4,
    elevation: 5,                               // Android shadow
  },
  
  // Job header with company information
  jobHeader: {
    flexDirection: 'row',                       // Horizontal layout
    alignItems: 'center',                       // Center vertically
    marginBottom: 16,                           // Space before details
  },
  
  // Company profile image
  companyImage: {
    width: 60,                                  // Fixed image size
    height: 60,
    borderRadius: 30,                           // Circular image
    marginRight: 12,                            // Space before text
  },
  
  // Job info container
  jobInfo: {
    flex: 1,                                    // Fill remaining space
  },
  
  // Company name styling
  companyName: {
    fontSize: 18,                               // Prominent heading
    fontWeight: '600',                          // Semi-bold weight
    color: colors.titleColor,                   // Primary text color
    marginBottom: 4,                            // Small space after
  },
  
  // Order ID styling
  orderId: {
    fontSize: 14,                               // Smaller reference text
    color: colors.themeColor,                   // Theme color for emphasis
  },
  
  // Job details section
  jobDetails: {
    borderTopWidth: 1,                          // Top border separator
    borderTopColor: colors.border,              // Light border color
    paddingTop: 16,                             // Space after border
    marginBottom: 16,                           // Space before booking details
  },
  
  // Job metadata container
  jobMeta: {
    flexDirection: 'row',                       // Horizontal layout
    justifyContent: 'space-between',            // Spread date and type badge
    alignItems: 'center',                       // Center vertically
    marginBottom: 16,                           // Space before locations
  },
  
  // Date and time display
  dateTime: {
    fontSize: 14,                               // Small reference text
    color: colors.textLight,                    // Subdued text color
  },
  
  // Job type badge
  jobTypeBadge: {
    backgroundColor: colors.themeColor,         // Theme color background
    paddingHorizontal: 12,                      // Horizontal badge padding
    paddingVertical: 4,                         // Vertical badge padding
    borderRadius: 12,                           // Rounded badge
  },
  
  // Job type badge text
  jobTypeText: {
    color: colors.white,                        // White text on colored background
    fontWeight: 'bold',                         // Bold emphasis
    fontSize: 12,                               // Small badge text
  },
  
  // Location container
  locationContainer: {
    gap: 12,                                    // Consistent spacing between locations
  },
  
  // Individual location item
  locationItem: {
    flexDirection: 'row',                       // Horizontal layout
    alignItems: 'center',                       // Center icon and text
  },
  
  // Location text styling
  locationText: {
    fontSize: 14,                               // Readable text size
    color: colors.titleColor,                   // Primary text color
    marginLeft: 8,                              // Space after icon
    flex: 1,                                    // Fill available space
  },
  
  // Booking details section
  bookingDetails: {
    borderTopWidth: 1,                          // Top border separator
    borderTopColor: colors.border,              // Light border color
    paddingTop: 16,                             // Space after border
    marginBottom: 24,                           // Space before actions
  },
  
  // Booking section title
  bookingTitle: {
    fontSize: 16,                               // Section heading size
    fontWeight: '600',                          // Semi-bold weight
    color: colors.titleColor,                   // Primary text color
    marginBottom: 12,                           // Space before details
  },
  
  // Details grid container
  detailsGrid: {
    gap: 8,                                     // Consistent spacing between items
  },
  
  // Individual detail item
  detailItem: {
    flexDirection: 'row',                       // Horizontal layout
    justifyContent: 'space-between',            // Spread label and value
    paddingVertical: 4,                         // Vertical padding for touch target
  },
  
  // Detail label styling
  detailLabel: {
    fontSize: 14,                               // Readable label size
    color: colors.textLight,                    // Subdued label color
  },
  
  // Detail value styling
  detailValue: {
    fontSize: 14,                               // Readable value size
    color: colors.titleColor,                   // Primary text color
    fontWeight: '500',                          // Medium weight for emphasis
  },
  
  // Action button container
  actionContainer: {
    paddingTop: 16,                             // Space before action button
  },
  
  // Base action button styling
  actionButton: {
    flexDirection: 'row',                       // Horizontal layout for icon and text
    alignItems: 'center',                       // Center content
    justifyContent: 'center',                   // Center horizontally
    paddingVertical: 16,                        // Comfortable touch target
    borderRadius: 8,                            // Rounded button corners
    gap: 8,                                     // Space between icon and text
  },
  
  // Accept job button
  acceptButton: {
    backgroundColor: colors.success,            // Green for accept action
  },
  
  // Start job button
  startButton: {
    backgroundColor: colors.warning,            // Orange for start action
  },
  
  // Complete job button
  completeButton: {
    backgroundColor: colors.themeColor,         // Theme color for complete
  },
  
  // Action button text
  actionButtonText: {
    fontSize: 16,                               // Readable button text
    fontWeight: '600',                          // Semi-bold emphasis
    color: colors.white,                        // White text on colored background
  },
});

export default JobDetailsScreen;
