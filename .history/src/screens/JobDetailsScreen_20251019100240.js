/**
 * JobDetailsScreen.js - Comprehensive Job Information & Map View
 * 
 * Provides a detailed view of a specific job with interactive map, customer information,
 * location details, and job management actions. Integrates with device location services
 * and provides navigation capabilities for drivers.
 * 
 * Enhanced:
 * - Safe guards added for missing route/job data
 * - Local fallback image for missing company profile
 * - Booking details now fetched from real API response
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useApp } from '../context/AppContext';
import { colors, commonStyles } from '../styles/commonStyles';

const { width, height } = Dimensions.get('window');

const JobDetailsScreen = ({ route }) => {
  /**
   * ✅ Safe guard: Prevent crash if route or params are missing
   * If job data is not passed, we display a safe message instead of crashing.
   */
  const job = route?.params?.job ?? null;

  // Get global context functions
  const { updateJobStatus, acceptJob } = useApp();

  const [userLocation, setUserLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 43.6532,
    longitude: -79.3832,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for navigation');
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
      console.error('Error getting location:', error);
    }
  };

  /** ✅ Render fallback UI if no job data */
  if (!job) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.container}>
          <Text style={styles.emptyMessage}>Job data not available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  /** ✅ Booking details from API (safe destructuring with defaults) */
  const bookingDetails = job.booking_details || {};
  const variantSummary = bookingDetails.variant_summary || 'N/A';
  const equipments = bookingDetails.equipments || 'N/A';
  const totalWeight = bookingDetails.total_weight || 'N/A';

  /** ✅ Job actions */
  const handleAcceptJob = async () => {
    Alert.alert('Accept Job', 'Are you sure you want to accept this job?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: async () => {
          try {
            const success = await acceptJob(job.id);
            if (success) Alert.alert('Success', 'Job accepted successfully!');
            else Alert.alert('Error', 'Failed to accept job. Please try again.');
          } catch (error) {
            console.error('Error accepting job:', error);
            Alert.alert('Error', 'Failed to accept job. Please try again.');
          }
        },
      },
    ]);
  };

  const handleStartJob = () => {
    Alert.alert('Start Job', 'Are you ready to start this job?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start',
        onPress: () => {
          updateJobStatus(job.id, 'pickedup');
          Alert.alert('Success', 'Job started! Safe travels!');
        },
      },
    ]);
  };

  const handleCompleteJob = () => {
    Alert.alert('Complete Job', 'Mark this job as delivered?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: () => {
          updateJobStatus(job.id, 'delivered');
          Alert.alert('Success', 'Job completed successfully!');
        },
      },
    ]);
  };

  /** ✅ Return button dynamically based on job.status */
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
        return null;
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.container}>
        {/* ✅ Map Section */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={mapRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {userLocation && (
              <Marker coordinate={userLocation} title="Your Location" description="You are here" pinColor={colors.themeColor} />
            )}
            <Marker
              coordinate={{
                latitude: mapRegion.latitude + 0.01,
                longitude: mapRegion.longitude + 0.01,
              }}
              title="Pickup Location"
              description={job.from_address || job.pickupLocation}
              pinColor={colors.danger}
            />
            <Marker
              coordinate={{
                latitude: mapRegion.latitude - 0.01,
                longitude: mapRegion.longitude - 0.01,
              }}
              title="Dropoff Location"
              description={job.to_address || job.dropoffLocation}
              pinColor={colors.success}
            />
          </MapView>
        </View>

        {/* ✅ Job Info Section */}
        <ScrollView style={styles.detailsContainer}>
          <View style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <Image
                source={
                  job.profileImage && typeof job.profileImage === 'string' && job.profileImage.trim() !== ''
                    ? { uri: job.profileImage }
                    : require('../../assets/images/profile/p1.png') // ✅ Fallback local image
                }
                style={styles.companyImage}
              />
              <View style={styles.jobInfo}>
                <Text style={styles.companyName}>{job.customer_name || 'Unknown Customer'}</Text>
                <Text style={styles.orderId}>Order ID: {job.tracking_id || job.order_id}</Text>
              </View>
            </View>

            {/* ✅ Job Locations */}
            <View style={styles.locationContainer}>
              <View style={styles.locationItem}>
                <Ionicons name="location" size={20} color={colors.danger} />
                <Text style={styles.locationText}>{job.from_address}</Text>
              </View>
              <View style={styles.locationItem}>
                <Ionicons name="navigate" size={20} color={colors.success} />
                <Text style={styles.locationText}>{job.to_address}</Text>
              </View>
            </View>

            {/* ✅ Booking Details Section */}
            <View style={styles.bookingDetails}>
              <Text style={styles.bookingTitle}>Booking Details</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Variant Summary</Text>
                  <Text style={styles.detailValue}>{variantSummary}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Equipments</Text>
                  <Text style={styles.detailValue}>{equipments}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Total Weight</Text>
                  <Text style={styles.detailValue}>{totalWeight} kg</Text>
                </View>
              </View>
            </View>

            {/* ✅ Action Button */}
            <View style={styles.actionContainer}>{getActionButton()}</View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

/** ✅ Styles (same as before, with empty state added) */
const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { height: height * 0.4 },
  map: { width: '100%', height: '100%' },
  detailsContainer: { flex: 1, backgroundColor: colors.background },
  jobCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: 16,
    elevation: 5,
  },
  jobHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  companyImage: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  companyName: { fontSize: 18, fontWeight: '600', color: colors.titleColor },
  orderId: { fontSize: 14, color: colors.themeColor },
  locationContainer: { gap: 12, marginTop: 10 },
  locationItem: { flexDirection: 'row', alignItems: 'center' },
  locationText: { marginLeft: 8, flex: 1, color: colors.titleColor },
  bookingDetails: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16, marginBottom: 24 },
  bookingTitle: { fontSize: 16, fontWeight: '600', color: colors.titleColor, marginBottom: 12 },
  detailsGrid: { gap: 8 },
  detailItem: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { color: colors.textLight },
  detailValue: { color: colors.titleColor, fontWeight: '500' },
  actionContainer: { paddingTop: 16 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  acceptButton: { backgroundColor: colors.success },
  startButton: { backgroundColor: colors.warning },
  completeButton: { backgroundColor: colors.themeColor },
  actionButtonText: { fontSize: 16, fontWeight: '600', color: colors.white },
  emptyMessage: { fontSize: 16, color: colors.textLight, textAlign: 'center', marginTop: 40 },
});

export default JobDetailsScreen;
