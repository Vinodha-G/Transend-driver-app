/**
 * JobDetailsScreen.js - Comprehensive Job Information & Map View
 * 
 * Provides a detailed view of a specific job with interactive map, customer information,
 * pickup and dropoff locations, and booking details.
 * Integrates with device location services for navigation purposes.
 * 
 * Features:
 * - Interactive Google Map with user, pickup, and dropoff markers
 * - Real-time user location tracking
 * - Comprehensive job information display
 * - Booking details: variant summary, equipments, total weight
 * - Responsive layout with scrollable content
 * 
 * Navigation:
 * - Receives job data from route params
 * - Can be accessed from HomeScreen or CurrentJobScreen
 * 
 * Author: Driver App Team
 * Version: 1.2.0
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { colors, commonStyles } from '../styles/commonStyles';
import { spacing, componentSizes, responsive } from '../utils/responsiveDimensions';

// Get device screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

const JobDetailsScreen = ({ route, navigation }) => {
  // Get theme
  const { theme } = useTheme();
  
  // Get data and functions from global context
  const {
    user,
    jobDetails,
    loadJobDetails,
    isLoading,
    getError,
    clearError,
  } = useApp();

  // Extract job object from navigation route params (used to get parcel_id)
  const jobParam = route?.params?.job ?? null;

  // State for job data (from API or params)
  const [job, setJob] = useState(jobParam);
  
  // Extract parcel ID from job param (try multiple fields)
  const parcelId = jobParam?.order_id || jobParam?.parcel_id || jobParam?.id || jobParam?.tracking_id || null;

  // Load job details from API when component mounts or parcel ID changes
  useEffect(() => {
    if (parcelId) {
      console.log('Loading job details for parcel:', parcelId);
      loadJobDetails(parcelId).catch(error => {
        console.error('Failed to load job details:', error);
        // Don't update job state on error - keep showing param data
      });
    }
  }, [parcelId, loadJobDetails]);

  // Update job when jobDetails changes
  useEffect(() => {
    if (jobDetails) {
      setJob(jobDetails);
    }
  }, [jobDetails]);

  // Safely get theme values with fallbacks
  const safeTheme = {
    background: theme?.background || '#f5f5f5',
    surface: theme?.surface || '#ffffff',
    text: theme?.text || '#1f1f1f',
    textSecondary: theme?.textSecondary || '#8f8f8f',
    primary: theme?.primary || '#00897B',
    error: theme?.error || '#ff4b4b',
    textLight: theme?.textLight || '#FFFFFF',
  };

  // Show loading state
  if (isLoading && isLoading('jobDetails') && !job) {
    return (
      <SafeAreaView style={[commonStyles.container, { backgroundColor: safeTheme.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={safeTheme.primary} />
          <Text style={[styles.loadingText, { color: safeTheme.textSecondary }]}>
            Loading job details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state (only if no job data at all)
  const errorMessage = getError && getError('jobDetails');
  if (errorMessage && !job) {
    return (
      <SafeAreaView style={[commonStyles.container, { backgroundColor: safeTheme.background }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={safeTheme.error} />
          <Text style={[styles.errorText, { color: safeTheme.text }]}>
            {errorMessage}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: safeTheme.primary }]}
            onPress={() => {
              if (clearError) clearError('jobDetails');
              if (parcelId && loadJobDetails) {
                loadJobDetails(parcelId).catch(err => console.error('Retry failed:', err));
              }
            }}
          >
            <Text style={[styles.retryButtonText, { color: safeTheme.textLight }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show fallback message if job data is missing
  if (!job) {
    return (
      <SafeAreaView style={[commonStyles.container, { backgroundColor: safeTheme.background }]} edges={['top']}>
        <View style={styles.centered}>
          <Ionicons name="document-outline" size={64} color={safeTheme.textSecondary} />
          <Text style={[styles.emptyMessage, { color: safeTheme.text }]}>
            Job data not available.
          </Text>
          {parcelId && loadJobDetails && (
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: safeTheme.primary, marginTop: spacing.md }]}
              onPress={() => {
                loadJobDetails(parcelId).catch(err => console.error('Load details failed:', err));
              }}
            >
              <Text style={[styles.retryButtonText, { color: safeTheme.textLight }]}>
                Load Details
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Safely extract job details with fallback values (prioritize API data)
  const orderId = job?.order_id ?? jobParam?.order_id ?? 'N/A';
  const trackingId = job?.tracking_id ?? jobParam?.tracking_id ?? 'N/A';
  const customerName = job?.customer_name ?? jobParam?.customer_name ?? 'N/A';
  const fromAddress = job?.from_address ?? jobParam?.from_address ?? jobParam?.from_address_text ?? 'N/A';
  const toAddress = job?.to_address ?? jobParam?.to_address ?? jobParam?.to_address_text ?? 'N/A';
  const shipmentDate = job?.shipment_date ?? jobParam?.shipment_date ?? 'N/A';

  // Booking details extraction with safety checks
  const bookingDetails = job?.booking_details ?? jobParam?.booking_details ?? {};
  const variantSummary = bookingDetails?.variant_summary ?? 'N/A';
  const equipments = bookingDetails?.equipments ?? 'N/A';
  const totalWeight = bookingDetails?.total_weight ?? 'N/A';

  /**
   * Map State
   * - userLocation: holds the current device location
   * - mapRegion: defines the visible map region (latitude, longitude, zoom)
   */
  const [userLocation, setUserLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 43.6532, // Default to Toronto coordinates if location unavailable
    longitude: -79.3832,
    latitudeDelta: 0.0922, // Controls vertical zoom
    longitudeDelta: 0.0421, // Controls horizontal zoom
  });

  // Fetch user's current location when component mounts
  useEffect(() => {
    getCurrentLocation();
  }, []);

  /**
   * getCurrentLocation - Requests location permission and fetches device coordinates
   * Updates userLocation state and mapRegion to center map on the user
   * Includes comprehensive error handling to prevent crashes
   */
  const getCurrentLocation = async () => {
    try {
      // Check if Location is available
      if (!Location) {
        console.warn('Location service not available');
        return;
      }

      // Ask for foreground location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      // If permission denied, don't show alert (might be annoying) - just return silently
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      // Get current position with timeout and error handling
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000, // 10 second timeout
      });

      // Validate location data
      if (!location || !location.coords) {
        console.warn('Invalid location data received');
        return;
      }

      const { latitude, longitude } = location.coords;

      // Validate coordinates are numbers
      if (typeof latitude !== 'number' || typeof longitude !== 'number' || 
          isNaN(latitude) || isNaN(longitude)) {
        console.warn('Invalid coordinates:', { latitude, longitude });
        return;
      }

      // Update userLocation for marker and mapRegion for centering
      setUserLocation({ latitude, longitude });
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      // Log error but don't crash - map will still show with default region
      console.error('Error fetching location:', error);
      // Don't show alert to user - silent failure is better than crash
    }
  };

  // Validate mapRegion to prevent crashes
  const safeMapRegion = {
    latitude: typeof mapRegion?.latitude === 'number' && !isNaN(mapRegion.latitude) 
      ? mapRegion.latitude 
      : 43.6532,
    longitude: typeof mapRegion?.longitude === 'number' && !isNaN(mapRegion.longitude)
      ? mapRegion.longitude
      : -79.3832,
    latitudeDelta: typeof mapRegion?.latitudeDelta === 'number' && !isNaN(mapRegion.latitudeDelta)
      ? mapRegion.latitudeDelta
      : 0.0922,
    longitudeDelta: typeof mapRegion?.longitudeDelta === 'number' && !isNaN(mapRegion.longitudeDelta)
      ? mapRegion.longitudeDelta
      : 0.0421,
  };

  return (
    <SafeAreaView style={[commonStyles.container, { backgroundColor: safeTheme.background }]} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >

        {/* ================= Map Section ================= */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}     // Use Google Maps provider
            style={styles.map}              // Full container size
            region={safeMapRegion}          // Center map on this region (validated)
            showsUserLocation={true}        // Show user's location on map
            showsMyLocationButton={true}    // Button to center on user location
            onError={(error) => {
              console.error('MapView error:', error);
              // Don't crash - just log the error
            }}
          >
            {/* ---------------- User Marker ---------------- */}
            {userLocation && 
             typeof userLocation.latitude === 'number' && 
             typeof userLocation.longitude === 'number' &&
             !isNaN(userLocation.latitude) && 
             !isNaN(userLocation.longitude) && (
              <Marker
                coordinate={userLocation}
                title="Your Location"
                pinColor={colors?.themeColor || '#00897B'} // Use theme color for user
              />
            )}

            {/* ---------------- Pickup Marker ---------------- */}
            <Marker
              coordinate={{
                latitude: safeMapRegion.latitude + 0.01, // Demo offset; can replace with geocoded pickup coords
                longitude: safeMapRegion.longitude + 0.01,
              }}
              title="Pickup Location"
              description={typeof fromAddress === 'string' ? fromAddress : 'Pickup address'}   // Shows full from_address on marker
              pinColor={colors?.danger || '#ff4b4b'}   // Red color for pickup
            />

            {/* ---------------- Dropoff Marker ---------------- */}
            <Marker
              coordinate={{
                latitude: safeMapRegion.latitude - 0.01, // Demo offset; replace with geocoded dropoff coords
                longitude: safeMapRegion.longitude - 0.01,
              }}
              title="Dropoff Location"
              description={typeof toAddress === 'string' ? toAddress : 'Dropoff address'}     // Shows full to_address on marker
              pinColor={colors?.success || '#20b149'}   // Green color for dropoff
            />
          </MapView>
        </View>

        {/* ================= Job Details Section ================= */}
        <View style={[styles.section, { backgroundColor: safeTheme.surface }]}>

          {/* ---------------- Customer Info ---------------- */}
          <View style={styles.headerContainer}>
            <Image
              source={
                (job?.profile_image && typeof job.profile_image === 'string' && job.profile_image.trim() !== '') ||
                (jobParam?.profileImage && typeof jobParam.profileImage === 'string' && jobParam.profileImage.trim() !== '')
                  ? { uri: job?.profile_image || jobParam?.profileImage }
                  : require('../../assets/images/profile/p1.png')
              }
              style={styles.profileImage}
              onError={(error) => {
                console.error('Image load error:', error);
                // Image will fallback to default via require() if URI fails
              }}
              defaultSource={require('../../assets/images/profile/p1.png')}
            />
            <View style={styles.customerInfo}>
              <Text style={[styles.companyName, { color: safeTheme.text }]}>
                {customerName}
              </Text>
              <Text style={[styles.trackingId, { color: safeTheme.primary }]}>
                Tracking ID: {trackingId}
              </Text>
              {orderId && orderId !== 'N/A' && (
                <Text style={[styles.orderId, { color: safeTheme.textSecondary }]}>
                  Order ID: {orderId}
                </Text>
              )}
            </View>
          </View>

          {/* ---------------- Shipment Info ---------------- */}
          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: safeTheme.textSecondary }]}>Shipment Date:</Text>
            <Text style={[styles.value, { color: safeTheme.text }]}>{shipmentDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: safeTheme.textSecondary }]}>From:</Text>
            <Text style={[styles.value, { color: safeTheme.text }]}>{fromAddress}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: safeTheme.textSecondary }]}>To:</Text>
            <Text style={[styles.value, { color: safeTheme.text }]}>{toAddress}</Text>
          </View>
        </View>

        {/* ================= Booking Details Section ================= */}
        <View style={[styles.section, { backgroundColor: safeTheme.surface }]}>
          <Text style={[styles.sectionTitle, { color: safeTheme.primary }]}>Booking Details</Text>

          {/* Variant Summary */}
          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: safeTheme.textSecondary }]}>Variant Summary:</Text>
            <Text style={[styles.value, { color: safeTheme.text }]}>{variantSummary}</Text>
          </View>

          {/* Equipments */}
          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: safeTheme.textSecondary }]}>Equipments:</Text>
            <Text style={[styles.value, { color: safeTheme.text }]}>{equipments}</Text>
          </View>

          {/* Total Weight */}
          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: safeTheme.textSecondary }]}>Total Weight:</Text>
            <Text style={[styles.value, { color: safeTheme.text }]}>{totalWeight}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// ================= StyleSheet =================
const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: spacing.xl,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  loadingText: {
    fontSize: responsive(16, 18, 14),
    marginTop: spacing.md,
    textAlign: 'center',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  errorText: {
    fontSize: responsive(16, 18, 14),
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },

  retryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: componentSizes.buttonBorderRadius,
    minHeight: componentSizes.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  retryButtonText: {
    fontSize: responsive(16, 18, 14),
    fontWeight: '600',
  },

  mapContainer: {
    width: width,
    height: responsive(height * 0.35, height * 0.4, height * 0.3),
  },

  map: {
    width: '100%',
    height: '100%',
  },

  section: {
    borderRadius: componentSizes.cardBorderRadius,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    ...componentSizes.cardShadow,
    elevation: componentSizes.cardElevation,
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  profileImage: {
    width: responsive(64, 70, 56),
    height: responsive(64, 70, 56),
    borderRadius: responsive(32, 35, 28),
    marginRight: spacing.md,
  },

  customerInfo: {
    flex: 1,
  },

  companyName: {
    fontSize: responsive(18, 20, 16),
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },

  orderId: {
    fontSize: responsive(14, 16, 12),
    marginTop: spacing.xs,
  },

  trackingId: {
    fontSize: responsive(14, 16, 12),
    fontWeight: '600',
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },

  label: {
    fontSize: responsive(14, 16, 12),
    flex: 1,
    marginRight: spacing.sm,
  },

  value: {
    fontSize: responsive(14, 16, 12),
    flex: 2,
    textAlign: 'right',
    flexWrap: 'wrap',
  },

  sectionTitle: {
    fontSize: responsive(16, 18, 14),
    fontWeight: '600',
    marginBottom: spacing.md,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  emptyMessage: {
    fontSize: responsive(16, 18, 14),
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

export default JobDetailsScreen;
