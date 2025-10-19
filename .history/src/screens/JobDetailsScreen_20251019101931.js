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
 * Version: 1.1.0
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

// Get screen dimensions
const { width, height } = Dimensions.get('window');

const JobDetailsScreen = ({ route }) => {
  // Extract job data from route params
  const job = route?.params?.job ?? null;

  // If job data is not provided, show fallback
  if (!job) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyMessage}>Job data not available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Extract fields safely
  const orderId = job?.order_id ?? 'N/A';
  const trackingId = job?.tracking_id ?? 'N/A';
  const customerName = job?.customer_name ?? 'N/A';
  const fromAddress = job?.from_address ?? 'N/A';
  const toAddress = job?.to_address ?? 'N/A';
  const shipmentDate = job?.shipment_date ?? 'N/A';
  const bookingDetails = job?.booking_details ?? {};
  const variantSummary = bookingDetails?.variant_summary ?? 'N/A';
  const equipments = bookingDetails?.equipments ?? 'N/A';
  const totalWeight = bookingDetails?.total_weight ?? 'N/A';

  // Map state
  const [userLocation, setUserLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 43.6532, // default
    longitude: -79.3832,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Fetch user location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Get current device location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show map.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
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

        {/* Map Section */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={mapRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {/* User Location Marker */}
            {userLocation && (
              <Marker
                coordinate={userLocation}
                title="Your Location"
                pinColor={colors.themeColor}
              />
            )}

            {/* Pickup Location Marker */}
            <Marker
              coordinate={{
                latitude: mapRegion.latitude + 0.01, // demo offset
                longitude: mapRegion.longitude + 0.01,
              }}
              title="Pickup Location"
              description={fromAddress}
              pinColor={colors.danger}
            />

            {/* Dropoff Location Marker */}
            <Marker
              coordinate={{
                latitude: mapRegion.latitude - 0.01, // demo offset
                longitude: mapRegion.longitude - 0.01,
              }}
              title="Dropoff Location"
              description={toAddress}
              pinColor={colors.success}
            />
          </MapView>
        </View>

        {/* Job Details Section */}
        <View style={styles.section}>
          <View style={styles.headerContainer}>
            <Image
              source={require('../../assets/images/profile/p1.png')}
              style={styles.profileImage}
            />
            <View>
              <Text style={[styles.companyName, commonStyles.titleColor]}>
                {customerName}
              </Text>
              <Text style={styles.orderId}>Order ID: {orderId}</Text>
              <Text style={styles.trackingId}>Tracking ID: {trackingId}</Text>
            </View>
          </View>

          {/* Shipment Details */}
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

        {/* Booking Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Variant Summary:</Text>
            <Text style={styles.value}>{variantSummary}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Equipments:</Text>
            <Text style={styles.value}>{equipments}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Total Weight:</Text>
            <Text style={styles.value}>{totalWeight}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 20,
  },

  mapContainer: {
    width: width,
    height: height * 0.35,
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
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  label: {
    fontSize: 14,
    color: colors.textLight,
  },

  value: {
    fontSize: 14,
    color: colors.titleColor,
    flexShrink: 1,
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
