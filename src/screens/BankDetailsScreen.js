/**
 * BankDetailsScreen.js - Banking Information Management
 * 
 * Screen for managing driver's banking and payment information
 * for payroll and expense reimbursements.
 * 
 * Features:
 * - Bank account details
 * - Payment method preferences
 * - Transaction history
 * - Direct deposit setup
 * - Tax information
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, commonStyles } from '../styles/commonStyles';

/**
 * BankDetailsScreen Component
 * 
 * Displays and manages banking and payment information.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.navigation - React Navigation object
 * @returns {JSX.Element} BankDetailsScreen component
 */
const BankDetailsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Ionicons name="card" size={60} color={colors.primary} />
          <Text style={styles.headerTitle}>Bank Details</Text>
          <Text style={styles.headerSubtitle}>Manage your payment information</Text>
        </View>

        {/* Coming Soon Section */}
        <View style={styles.comingSoonSection}>
          <Ionicons name="construct" size={40} color={colors.textSecondary} />
          <Text style={styles.comingSoonTitle}>Coming Soon</Text>
          <Text style={styles.comingSoonText}>
            Banking and payment features are currently under development.
            {'\n\n'}
            This section will include:
            {'\n'}• Bank account setup
            {'\n'}• Direct deposit configuration
            {'\n'}• Payment history
            {'\n'}• Expense reimbursements
            {'\n'}• Tax documents
            {'\n'}• Earnings dashboard
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Component Styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSection: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: colors.white,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.titleColor,
    marginTop: 15,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  comingSoonSection: {
    backgroundColor: colors.white,
    margin: 20,
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.titleColor,
    marginTop: 15,
    marginBottom: 10,
  },
  comingSoonText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default BankDetailsScreen;
