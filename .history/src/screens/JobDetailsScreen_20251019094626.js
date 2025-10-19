/**
 * JobDetailsScreen.js
 * --------------------
 * A detailed view of a job, showing company info, pickup/dropoff map, and actions.
 * 
 * ✅ Includes safety fixes to prevent crashes:
 * - Checks if route params or job data are missing.
 * - Provides fallback profile image when job.profileImage is null/empty.
 * - Safe null checks for pickup/dropoff locations.
 * - Clean error handling for missing permissions or data.
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

  // 🛡️ Safe extraction of job from navigation params.
  // This prevents app crash if 'route' or 'route.params' is undefined.
  const job = route?.params?.job;

  // 🔍 Log job data to verify what’s being passed from JobCard
  if (!job) {
    console.warn("⚠️ JobDetailsScreen: No job data received. route.params =", route?.params);
  }

  // 📦 Import global app context functions (for updating/accepting jobs)
  const { updateJobStatus, acceptJob } = useApp();

  // 📍 State for current user location and map region
  const [userLocation, setUserLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 43.6532,     // Default to Toronto coordinates (fallback)
    longitude: -79.3832,
    latitudeDelta: 0.0922, // Map zoom level
    longitudeDelta: 0.0421,
  });

  // 🚀 Get current location when screen loads
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // 📍 Function to get user's live location safely
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to display your map position.');
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

  // ✅ Handle job acceptance confirmation
  const handleAcceptJob = async () => {
    if (!job?.id) return;

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
              Alert.alert(success ? 'Success' : 'Error', success ? 'Job accepted successfully!' : 'Failed to accept job.');
            } catch (error) {
              console.error('Error accepting job:', error);
            }
          },
        },
      ]
    );
  };

  // 🚗 Handle job start
  const handleStartJob = () => {
    if (!job?.id) return;
    updateJobStatus(job.id, 'pickedup');
    Alert.alert('Success', 'Job started! Drive safely 🚗');
  };

  // 📦 Handle job completion
  const handleCompleteJob = () => {
    if (!job?.id) return;
    updateJobStatus(job.id, 'delivered');
    Alert.alert('Success', 'Job completed successfully! 🎉');
  };

  // 🧭 Decide which action button to display based on job status
  const getActionButton = () => {
    if (!job?.status) return null;

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

  // 🧱 If no job data found, render safe empty state (prevents crash)
  if (!job) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.container}>
          <Text style={styles.emptyMessage}>Job data not available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 🗺️ Main UI rendering
  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.container}>

        {/* 🗺️ Map Section */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={mapRegion}
            showsUserLocation
            showsMyLocationButton
          >
            {/* Marker for user's current location */}
            {userLocation && (
              <Marker coordinate={userLocation} title="Your Location" description="You are here" />
            )}

            {/* Marker for Pickup location */}
            {job?.pickupLocation && (
              <Marker
                coordinate={{
                  latitude: mapRegion.latitude + 0.01,
                  longitude: mapRegion.longitude + 0.01,
                }}
                title="Pickup Location"
                description={job.pickupLocation}
                pinColor={colors.danger}
              />
            )}

            {/* Marker for Dropoff location */}
            {job?.dropoffLocation && (
              <Marker
                coordinate={{
                  latitude: mapRegion.latitude - 0.01,
                  longitude: mapRegion.longitude - 0.01,
                }}
                title="Dropoff Location"
                description={job.dropoffLocation}
                pinColor={colors.success}
              />
            )}
          </MapView>
        </View>

        {/* 📄 Job Details Section */}
        <ScrollView style={styles.detailsContainer}>
          <View style={styles.jobCard}>

            {/* 👤 Company Info Header */}
            <View style={styles.jobHeader}>
              <Image
                // 🖼️ Use fallback image if job.profileImage is missing or empty
                source={
                  job.profileImage && typeof job.profileImage === 'string' && job.profileImage.trim() !== ''
                    ? { uri: job.profileImage }
                    : require('../../assets/images/profile/p1.png')
                }
                style={styles.companyImage}
              />
              <View style={styles.jobInfo}>
                <Text style={styles.companyName}>{job.companyName || 'Unknown Company'}</Text>
                <Text style={styles.orderId}>Order ID: {job.orderId || 'N/A'}</Text>
              </View>
            </View>

            {/* 📅 Job Details */}
            <View style={styles.jobDetails}>
              <View style={styles.jobMeta}>
                <Text style={styles.dateTime}>{job.dateTime || 'N/A'}</Text>
                <View style={styles.jobTypeBadge}>
                  <Text style={styles.jobTypeText}>{job.type || 'General'}</Text>
                </View>
              </View>

              {/* 📍 Pickup & Dropoff Info */}
              <View style={styles.locationContainer}>
                {job.pickupLocation && (
                  <View style={styles.locationItem}>
                    <Ionicons name="location" size={20} color={colors.danger} />
                    <Text style={styles.locationText}>{job.pickupLocation}</Text>
                  </View>
                )}
                {job.dropoffLocation && (
                  <View style={styles.locationItem}>
                    <Ionicons name="navigate" size={20} color={colors.success} />
                    <Text style={styles.locationText}>{job.dropoffLocation}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* 🎯 Action Buttons */}
            <View style={styles.actionContainer}>{getActionButton()}</View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// 🎨 Styles
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
  jobInfo: { flex: 1 },
  companyName: { fontSize: 18, fontWeight: '600', color: colors.titleColor },
  orderId: { fontSize: 14, color: colors.themeColor },

  jobDetails: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 },
  jobMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateTime: { fontSize: 14, color: colors.textLight },
  jobTypeBadge: { backgroundColor: colors.themeColor, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  jobTypeText: { color: colors.white, fontWeight: 'bold', fontSize: 12 },

  locationContainer: { marginTop: 16 },
  locationItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  locationText: { fontSize: 14, color: colors.titleColor, marginLeft: 8 },

  actionContainer: { paddingTop: 16 },
  actionButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 8, gap: 8,
  },
  acceptButton: { backgroundColor: colors.success },
  startButton: { backgroundColor: colors.warning },
  completeButton: { backgroundColor: colors.themeColor },
  actionButtonText: { fontSize: 16, fontWeight: '600', color: colors.white },

  // 💬 Style for empty state message
  emptyMessage: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 16,
    marginTop: 50,
  },
});

export default JobDetailsScreen;
