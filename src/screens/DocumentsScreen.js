/**
 * DocumentsScreen.js - Driver Document Management with API Integration
 * 
 * Provides a comprehensive interface for drivers to view and upload required documents.
 * Integrates with the API to fetch current document status and upload new documents.
 * 
 * Features:
 * - View current uploaded documents with status indicators
 * - Upload new documents with file picker integration
 * - Progress tracking for document uploads
 * - Document type validation and preview
 * - Real-time API integration for document management
 * - Loading states and error handling
 * - Success/error feedback with alerts
 * 
 * Document Types:
 * - Driver License (Front & Back)
 * - Insurance Document
 * - MV1 Report
 * - Incident Report
 * - CUSE Logbook
 * 
 * Navigation:
 * - Can be accessed via Settings screen
 * - Stack screen with document management focus
 * 
 * Data Sources:
 * - Global app context for document data
 * - API services for document upload and retrieval
 * - File picker for document selection
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ActivityIndicator,
  Linking 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useApp } from '../context/AppContext';
import { colors, commonStyles } from '../styles/commonStyles';

/**
 * DocumentsScreen Component
 * 
 * Document management screen with upload functionality and API integration.
 * Allows drivers to view and upload required documents with real-time status updates.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.navigation - React Navigation object for screen navigation
 * @returns {JSX.Element} DocumentsScreen component
 */
const DocumentsScreen = ({ navigation }) => {
  // Get document data and functions from global context
  const {
    documents,
    loading,
    errors,
    loadDriverDocuments,
    updateDriverDocuments,
    isLoading,
    getError,
    clearError
  } = useApp();

  // Local loading state for individual document uploads
  const [uploadingDocument, setUploadingDocument] = useState(null);

  /**
   * Document Configuration
   * 
   * Defines all required document types with their display names and field keys.
   */
  const documentTypes = [
    {
      key: 'driver_license_front',
      title: 'Driver License (Front)',
      description: 'Front side of your driver license',
      required: true,
    },
    {
      key: 'driver_license_back',
      title: 'Driver License (Back)',
      description: 'Back side of your driver license',
      required: true,
    },
    {
      key: 'insurance',
      title: 'Insurance Document',
      description: 'Vehicle insurance certificate',
      required: true,
    },
    {
      key: 'mv1_report',
      title: 'MV1 Report',
      description: 'Motor vehicle inspection report',
      required: false,
    },
    {
      key: 'incident_report',
      title: 'Incident Report',
      description: 'Any incident reports if applicable',
      required: false,
    },
    {
      key: 'cuse_logbook',
      title: 'CUSE Logbook',
      description: 'Commercial vehicle logbook',
      required: false,
    },
  ];

  /**
   * Load Documents on Screen Focus
   * 
   * Ensures document data is fresh when user navigates to this screen.
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDriverDocuments();
    });

    return unsubscribe;
  }, [navigation, loadDriverDocuments]);

  /**
   * Handle Document Upload
   * 
   * Opens document picker and uploads selected file via API.
   * 
   * @param {string} documentType - The type of document being uploaded
   */
  const handleDocumentUpload = async (documentType) => {
    try {
      setUploadingDocument(documentType);
      clearError('documentUpdate');

      // Open document picker
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setUploadingDocument(null);
        return;
      }

      const file = result.assets[0];

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        Alert.alert('Error', 'File size must be less than 10MB');
        setUploadingDocument(null);
        return;
      }

      // Prepare file for upload
      const documentFiles = {
        [documentType]: {
          uri: file.uri,
          type: file.mimeType || 'application/octet-stream',
          name: file.name || `document.${file.uri.split('.').pop()}`,
        },
      };

      // Upload via API
      const success = await updateDriverDocuments(documentFiles);

      if (success) {
        Alert.alert('Success', 'Document uploaded successfully!');
        // Refresh document list
        await loadDriverDocuments();
      } else {
        const error = getError('documentUpdate');
        Alert.alert('Error', error || 'Failed to upload document. Please try again.');
      }
    } catch (error) {
      console.error('Document upload error:', error);
      Alert.alert('Error', 'An error occurred while uploading the document.');
    } finally {
      setUploadingDocument(null);
    }
  };

  /**
   * Handle Document View
   * 
   * Opens uploaded document in browser or external app.
   * 
   * @param {string} documentUrl - URL of the document to view
   * @param {string} documentTitle - Title of the document for display
   */
  const handleDocumentView = async (documentUrl, documentTitle) => {
    try {
      const supported = await Linking.canOpenURL(documentUrl);
      if (supported) {
        await Linking.openURL(documentUrl);
      } else {
        Alert.alert('Error', 'Cannot open this document type');
      }
    } catch (error) {
      console.error('Error opening document:', error);
      Alert.alert('Error', 'Failed to open document');
    }
  };

  /**
   * Get Document Status
   * 
   * Returns status information for a document type.
   * 
   * @param {string} documentType - The document type key
   * @returns {Object} Status object with uploaded status and URL
   */
  const getDocumentStatus = (documentType) => {
    const documentUrl = documents[documentType];
    return {
      uploaded: !!documentUrl,
      url: documentUrl,
    };
  };

  /**
   * Render Document Item
   * 
   * Renders individual document item with upload/view functionality.
   * 
   * @param {Object} docType - Document type configuration
   * @returns {JSX.Element} Document item component
   */
  const renderDocumentItem = (docType) => {
    const status = getDocumentStatus(docType.key);
    const isUploading = uploadingDocument === docType.key;

    return (
      <View key={docType.key} style={styles.documentItem}>
        <View style={styles.documentInfo}>
          <View style={styles.documentHeader}>
            <Text style={styles.documentTitle}>{docType.title}</Text>
            {docType.required && <Text style={styles.requiredLabel}>Required</Text>}
          </View>
          <Text style={styles.documentDescription}>{docType.description}</Text>
          
          {/* Document Status */}
          <View style={styles.statusContainer}>
            <Ionicons 
              name={status.uploaded ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={status.uploaded ? colors.successColor : colors.danger} 
            />
            <Text style={[
              styles.statusText,
              { color: status.uploaded ? colors.successColor : colors.danger }
            ]}>
              {status.uploaded ? 'Uploaded' : 'Not Uploaded'}
            </Text>
          </View>
        </View>

        <View style={styles.documentActions}>
          {/* Upload/Re-upload Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.uploadButton]}
            onPress={() => handleDocumentUpload(docType.key)}
            disabled={isUploading || isLoading('documentUpdate')}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons 
                  name={status.uploaded ? "refresh" : "cloud-upload"} 
                  size={16} 
                  color={colors.white} 
                />
                <Text style={styles.actionButtonText}>
                  {status.uploaded ? 'Replace' : 'Upload'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* View Button (only if uploaded) */}
          {status.uploaded && (
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={() => handleDocumentView(status.url, docType.title)}
            >
              <Ionicons name="eye" size={16} color={colors.themeColor} />
              <Text style={[styles.actionButtonText, styles.viewButtonText]}>View</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.titleColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documents</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Loading State */}
      {isLoading('documents') && !documents ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.themeColor} />
          <Text style={styles.loadingText}>Loading documents...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={[commonStyles.customContainer, styles.container]}>
            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Document Requirements</Text>
              <Text style={styles.instructionsText}>
                Please upload all required documents to complete your driver profile. 
                Accepted formats: PDF, JPG, PNG (Max 10MB per file)
              </Text>
            </View>

            {/* Document List */}
            <View style={styles.documentsContainer}>
              {documentTypes.map(renderDocumentItem)}
            </View>

            {/* Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Upload Summary</Text>
              <Text style={styles.summaryText}>
                Required: {documentTypes.filter(doc => doc.required && getDocumentStatus(doc.key).uploaded).length}/
                {documentTypes.filter(doc => doc.required).length} uploaded
              </Text>
              <Text style={styles.summaryText}>
                Optional: {documentTypes.filter(doc => !doc.required && getDocumentStatus(doc.key).uploaded).length}/
                {documentTypes.filter(doc => !doc.required).length} uploaded
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

/**
 * StyleSheet for DocumentsScreen
 * 
 * Defines all visual styling for the document management interface.
 */
const styles = StyleSheet.create({
  // Header styling
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

  // Loading container
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  loadingText: {
    fontSize: 16,
    color: colors.contentColor,
    marginTop: 12,
    textAlign: 'center',
  },

  // Main scroll container
  scrollView: {
    flex: 1,
  },

  container: {
    paddingTop: 16,
  },

  // Instructions section
  instructionsContainer: {
    backgroundColor: colors.lightBackground,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },

  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.titleColor,
    marginBottom: 8,
  },

  instructionsText: {
    fontSize: 14,
    color: colors.contentColor,
    lineHeight: 20,
  },

  // Documents container
  documentsContainer: {
    gap: 16,
    marginBottom: 24,
  },

  // Individual document item
  documentItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },

  documentInfo: {
    marginBottom: 16,
  },

  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.titleColor,
    flex: 1,
  },

  requiredLabel: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '500',
    backgroundColor: colors.lightBackground,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },

  documentDescription: {
    fontSize: 14,
    color: colors.contentColor,
    marginBottom: 8,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Document actions
  documentActions: {
    flexDirection: 'row',
    gap: 12,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    flex: 1,
  },

  uploadButton: {
    backgroundColor: colors.themeColor,
  },

  viewButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.themeColor,
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },

  viewButtonText: {
    color: colors.themeColor,
  },

  // Summary section
  summaryContainer: {
    backgroundColor: colors.lightBackground,
    padding: 16,
    borderRadius: 8,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.titleColor,
    marginBottom: 8,
  },

  summaryText: {
    fontSize: 14,
    color: colors.contentColor,
    marginBottom: 4,
  },
});

export default DocumentsScreen;
