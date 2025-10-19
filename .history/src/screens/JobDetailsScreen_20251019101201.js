/**
 * JobDetailsScreen.js
 * 
 * Displays detailed information about a selected job,
 * including company info, shipment details, and booking summary.
 * 
 * Fixes applied:
 * - Guard against missing route params and job fields
 * - Display proper values from nested booking_details
 * - Use safe fallback values to prevent crashes
 */

import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, commonStyles } from '../../styles/commonStyles';

const JobDetailsScreen = ({ route }) => {
  /**
   * Safely extract job data from navigation route
   * If no job is passed, prevent crash by showing fallback message
   */
  const job = route?.params?.job ?? null;

  // If job is missing, render an empty safe state
  if (!job) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyMessage}>Job data not available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Extract job fields safely
   * Match API key names (snake_case) with proper fallbacks
   */
  const orderId = job?.order_id ?? 'N/A';
  const trackingId = job?.tracking_id ?? 'N/A';
  const customerName = job?.customer_name ?? 'N/A';
  const shipmentDate = job?.shipment_date ?? 'N/A';
  const fromAddress = job?.from_address ?? 'N/A';
  const toAddress = job?.to_address ?? 'N/A';

  // Extract booking_details safely
  const bookingDetails = job?.booking_details ?? {};
  const variantSummary = bookingDetails?.variant_summary ?? 'N/A';
  const equipments = bookingDetails?.equipments ?? 'N/A';
  const totalWeight = bookingDetails?.total_weight ?? 'N/A';

  // Optional local state for dynamic data if needed
  const [userLocation, setUserLocation] = useState(null);

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        {/* Header Section: Company or Customer Info */}
        <View style={styles.headerContainer}>
          <Image
            source={
              job.profileImage && typeof job.profileImage === 'string' && job.profileImage.trim() !== ''
                ? { uri: job.profileImage }
                : require('../../assets/images/profile/p1.png')
            }
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

        {/* Shipment Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipment Details</Text>
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

/**
 * Styles for JobDetailsScreen
 */
const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
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

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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

  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.themeColor,
    marginBottom: 8,
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
});

export default JobDetailsScreen;
