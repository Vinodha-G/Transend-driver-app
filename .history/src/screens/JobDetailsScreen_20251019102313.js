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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors, commonStyles } from '../styles/commonStyles';

// Get device screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

const JobDetailsScreen = ({ route }) => {
  // Extract job object from navigation route params
  const job = route?.params?.job ?? null;

  // Show fallback message if job data is missing
  if (!job) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyMessage}>Job data not available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Safely extract job details with fallback values
  const orderId = job?.order_id ?? 'N/A';
  const trackingId = job?.tracking_id ?? 'N/A';
  const customerName = job?.customer_name ?? 'N/A';
  const fromAddress = job?.from_address ?? 'N/A';
  const toAddress = job?.to_address ?? 'N/A';
  const shipmentDate = job?.shipment_date ?? 'N/A';

  // Booking details extraction with safety checks
  const bookingDetails = job?.booking_details ?? {};
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
   */
  const getCurrentLocation = async () => {
    try {
      // Ask for foreground location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      // If permission denied, show alert and return
      if (status !== 'granted') {
        Alert.alert(
          'Permission denied',
          'Location permission is required to show map.'
        );
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Update userLocation for marker and mapRegion for centering
      setUserLocation({ latitude, longitude });
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        {/* ================= Map Section ================= */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}     // Use Google Maps provider
            style={styles.map}              // Full container size
            region={mapRegion}              // Center map on this region
            showsUserLocation={true}        // Show user's location on map
            showsMyLocationButton={true}    // Button to center on user location
          >
            {/* ---------------- User Marker ---------------- */}
            {userLocation && (
              <Marker
                coordinate={userLocation}
                title="Your Location"
                pinColor={colors.themeColor} // Use theme color for user
              />
            )}

            {/* ---------------- Pickup Marker ---------------- */}
            <Marker
              coordinate={{
                latitude: mapRegion.latitude + 0.01, // Demo offset; can replace with geocoded pickup coords
                longitude: mapRegion.longitude + 0.01,
              }}
              title="Pickup Location"
              description={fromAddress}   // Shows full from_address on marker
              pinColor={colors.danger}   // Red color for pickup
            />

            {/* ---------------- Dropoff Marker ---------------- */}
            <Marker
              coordinate={{
                latitude: mapRegion.latitude - 0.01, // Demo offset; replace with geocoded dropoff coords
                longitude: mapRegion.longitude - 0.01,
              }}
              title="Dropoff Location"
              description={toAddress}     // Shows full to_address on marker
              pinColor={colors.success}   // Green color for dropoff
            />
          </MapView>
        </View>

        {/* ================= Job Details Section ================= */}
        <View style={styles.section}>

          {/* ---------------- Customer Info ---------------- */}
          <View style={styles.headerContainer}>
            <Image
              source={require('../../assets/images/profile/p1.png')}
              style={styles.profileImage}
            />
            <View>
              <Text style={[styles.companyName, commonStyles.titleColor]}>
                {customerName}   {/* Customer Name */}
              </Text>
              <Text style={styles.orderId}>Order ID: {orderId}</Text>
              <Text style={styles.trackingId}>Tracking ID: {trackingId}</Text>
            </View>
          </View>

          {/* ---------------- Shipment Info ---------------- */}
          <View style={styles.detailRow}>
            <Text style={styles.label}>Shipment Date:</Text>
            <Text style={styles.value}>{shipmentDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>From:</Text>
            <Text style={styles.value}>{fromAddress}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>To:</Text>
            <Text style={styles.value}>{toAddress}</Text>
          </View>
        </View>

        {/* ================= Booking Details Section ================= */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Details</Text>

          {/* Variant Summary */}
          <View style={styles.detailRow}>
            <Text style={styles.label}>Variant Summary:</Text>
            <Text style={styles.value}>{variantSummary}</Text>
          </View>

          {/* Equipments */}
          <View style={styles.detailRow}>
            <Text style={styles.label}>Equipments:</Text>
            <Text style={styles.value}>{equipments}</Text>
          </View>

          {/* Total Weight */}
          <View style={styles.detailRow}>
            <Text style={styles.label}>Total Weight:</Text>
            <Text style={styles.value}>{totalWeight}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// ================= StyleSheet =================
const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 20, // Space at bottom for scrolling
  },

  mapContainer: {
    width: width,
    height: height * 0.35, // 35% of screen height
  },

  map: {
    width: '100%',
    height: '100%',
  },

  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
  },

  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  orderId: {
    fontSize: 14,
    color: colors.textLight,
  },

  trackingId: {
    fontSize: 14,
    color: colors.themeColor,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // label on left, value on right
    marginBottom: 6,
  },

  label: {
    fontSize: 14,
    color: colors.textLight,
  },

  value: {
    fontSize: 14,
    color: colors.titleColor,
    flexShrink: 1,   // prevent overflow
    textAlign: 'right',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.themeColor,
    marginBottom: 8,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyMessage: {
    fontSize: 16,
    color: colors.textLight,
  },
});

export default JobDetailsScreen;
