/**
 * API Testing Screen
 * 
 * Development utility screen for testing all implemented APIs.
 * This screen provides buttons to test each API endpoint and displays results.
 * Useful for development and debugging API integration.
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  StyleSheet,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { driverService, jobService, notificationService } from '../api';
import { colors, commonStyles } from '../styles/commonStyles';

const APITestScreen = ({ navigation }) => {
  const { 
    user,
    documents,
    dashboardData,
    loadDriverProfile,
    loadDashboardData,
    loadDriverDocuments,
    markDriverAbsent,
    refreshAllData
  } = useApp();

  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState({});

  /**
   * Test API Call
   * 
   * Generic function to test any API call and display results.
   */
  const testAPI = async (testName, apiCall) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    
    try {
      const result = await apiCall();
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { 
          success: true, 
          data: result,
          timestamp: new Date().toLocaleTimeString()
        } 
      }));
      
      Alert.alert(
        'Success', 
        `${testName} completed successfully!`,
        [
          { text: 'OK' },
          { 
            text: 'View Result', 
            onPress: () => Alert.alert('Result', JSON.stringify(result, null, 2))
          }
        ]
      );
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { 
          success: false, 
          error: error.message || 'Unknown error',
          timestamp: new Date().toLocaleTimeString()
        } 
      }));
      
      Alert.alert('Error', `${testName} failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  /**
   * API Test Configurations
   */
  const apiTests = [
    {
      title: 'Driver Profile',
      tests: [
        {
          name: 'Get Profile',
          action: () => testAPI('Get Profile', () => driverService.getProfile()),
        },
        {
          name: 'Load Profile (Context)',
          action: () => testAPI('Load Profile Context', loadDriverProfile),
        },
        {
          name: 'Update Profile',
          action: () => testAPI('Update Profile', () => 
            driverService.updateProfile({
              first_name: 'Test',
              last_name: 'Driver',
              email: 'test@example.com',
              phone: '1234567890',
              address: 'Test Address'
            })
          ),
        },
      ]
    },
    {
      title: 'Dashboard & Jobs',
      tests: [
        {
          name: 'Get Dashboard',
          action: () => testAPI('Get Dashboard', () => driverService.getDashboard()),
        },
        {
          name: 'Load Dashboard (Context)',
          action: () => testAPI('Load Dashboard Context', loadDashboardData),
        },
        {
          name: 'Get Jobs',
          action: () => testAPI('Get Jobs', () => jobService.getJobs()),
        },
      ]
    },
    {
      title: 'Documents',
      tests: [
        {
          name: 'Get Documents',
          action: () => testAPI('Get Documents', () => driverService.getDocuments()),
        },
        {
          name: 'Load Documents (Context)',
          action: () => testAPI('Load Documents Context', loadDriverDocuments),
        },
      ]
    },
    {
      title: 'Notifications',
      tests: [
        {
          name: 'Get Notifications',
          action: () => testAPI('Get Notifications', () => notificationService.getNotifications()),
        },
        {
          name: 'Mark All Read',
          action: () => testAPI('Mark All Read', () => notificationService.markAllAsRead()),
        },
      ]
    },
    {
      title: 'Other Actions',
      tests: [
        {
          name: 'Mark Absent',
          action: () => testAPI('Mark Absent', () => markDriverAbsent({ reason: 'Testing' })),
        },
        {
          name: 'Refresh All Data',
          action: () => testAPI('Refresh All Data', refreshAllData),
        },
      ]
    }
  ];

  /**
   * Render Test Button
   */
  const renderTestButton = (test) => {
    const isLoading = loading[test.name];
    const result = testResults[test.name];

    return (
      <TouchableOpacity
        key={test.name}
        style={[
          styles.testButton,
          result?.success === true && styles.successButton,
          result?.success === false && styles.errorButton,
        ]}
        onPress={test.action}
        disabled={isLoading}
      >
        <View style={styles.testButtonContent}>
          <Text style={styles.testButtonText}>{test.name}</Text>
          {isLoading && <ActivityIndicator size="small" color={colors.white} />}
          {result && !isLoading && (
            <Ionicons 
              name={result.success ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={colors.white} 
            />
          )}
        </View>
        {result && (
          <Text style={styles.timestampText}>
            {result.timestamp}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  /**
   * Render Test Section
   */
  const renderTestSection = (section) => (
    <View key={section.title} style={styles.testSection}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.testsContainer}>
        {section.tests.map(renderTestButton)}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.titleColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>API Testing</Text>
        <TouchableOpacity onPress={() => setTestResults({})}>
          <Ionicons name="refresh" size={24} color={colors.titleColor} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={[commonStyles.customContainer, styles.container]}>
          
          {/* Current Data Display */}
          <View style={styles.dataSection}>
            <Text style={styles.dataTitle}>Current Context Data</Text>
            <View style={styles.dataItem}>
              <Text style={styles.dataLabel}>User:</Text>
              <Text style={styles.dataValue}>
                {user ? `${user.first_name} ${user.last_name}` : 'Not loaded'}
              </Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.dataLabel}>Dashboard Jobs:</Text>
              <Text style={styles.dataValue}>
                New: {dashboardData?.counts?.new_order || 0}, 
                Accepted: {dashboardData?.counts?.accepted || 0}, 
                Picked: {dashboardData?.counts?.picked_up || 0}, 
                Delivered: {dashboardData?.counts?.delivered || 0}
              </Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.dataLabel}>Documents:</Text>
              <Text style={styles.dataValue}>
                {documents ? Object.values(documents).filter(Boolean).length : 0} uploaded
              </Text>
            </View>
          </View>

          {/* API Tests */}
          {apiTests.map(renderTestSection)}

          {/* Clear Results Button */}
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setTestResults({})}
          >
            <Text style={styles.clearButtonText}>Clear Results</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.titleColor,
  },

  scrollView: {
    flex: 1,
  },

  container: {
    paddingTop: 16,
  },

  // Data display section
  dataSection: {
    backgroundColor: colors.lightBackground,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },

  dataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.titleColor,
    marginBottom: 12,
  },

  dataItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },

  dataLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.titleColor,
    width: 120,
  },

  dataValue: {
    fontSize: 14,
    color: colors.contentColor,
    flex: 1,
  },

  // Test sections
  testSection: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.titleColor,
    marginBottom: 12,
  },

  testsContainer: {
    gap: 8,
  },

  testButton: {
    backgroundColor: colors.themeColor,
    borderRadius: 8,
    padding: 16,
  },

  successButton: {
    backgroundColor: colors.successColor,
  },

  errorButton: {
    backgroundColor: colors.danger,
  },

  testButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  testButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },

  timestampText: {
    color: colors.white,
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },

  clearButton: {
    backgroundColor: colors.contentColor,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },

  clearButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default APITestScreen;
