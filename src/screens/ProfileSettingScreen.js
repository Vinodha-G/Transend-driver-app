/**
 * ProfileSettingScreen.js - User Profile Management with API Integration
 * 
 * Provides a comprehensive form for users to edit their profile information
 * including name, email, phone number, and profile image. Features form validation,
 * image picker integration, real-time state management, and API updates.
 * 
 * Features:
 * - Profile image upload and editing with camera roll access
 * - Form validation for required fields and email format
 * - Real-time form state management
 * - API integration for profile updates
 * - Loading states and error handling
 * - Success/error feedback with alerts
 * - Fixed update button for easy access
 * - Auto-navigation back on successful update
 * 
 * Form Fields:
 * - Profile Image: Camera roll image picker with edit overlay
 * - User Name: Text input with validation
 * - Mobile Number: Phone-specific keyboard input
 * - Email: Email keyboard with format validation
 * 
 * Navigation:
 * - Accessed via Settings screen profile option
 * - Stack screen with custom header
 * - Auto-navigates back on successful update
 * 
 * Data Sources:
 * - Global app context for current user data
 * - API services for profile updates
 * - Form state management for real-time updates
 * - Image picker for profile photo selection
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { colors, commonStyles } from '../styles/commonStyles';

/**
 * ProfileSettingScreen Component
 * 
 * Profile editing screen with form validation, image upload functionality, and API integration.
 * Allows users to update their personal information and profile photo with real-time feedback.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.navigation - React Navigation object for screen navigation
 * @returns {JSX.Element} ProfileSettingScreen component
 */
const ProfileSettingScreen = ({ navigation }) => {
  // Get user data and update function from global context
  const { user, updateUserProfile, isLoading, getError, clearError } = useApp();
  
  /**
   * Form State Management
   * 
   * Local state to manage form data before submitting to API.
   * Initialized with current user data from context.
   */
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',        // User's first name
    last_name: user?.last_name || '',          // User's last name
    email: user?.email || '',                  // Contact email
    phone: user?.phone || '',                  // Phone number
    address: user?.address || '',              // Address (optional)
    profileImage: user?.image || '',           // Profile photo URI
  });

  // Local loading state for form submission
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Handle Input Change
   * 
   * Updates form state when input fields change.
   * Uses functional setState to merge updates with existing state.
   * 
   * @param {string} field - The form field name to update
   * @param {string} value - The new value for the field
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Handle Image Picker
   * 
   * Launches the device's image picker to select a new profile photo.
   * Requests permissions, handles errors, and updates form state with selected image.
   */
  const handleImagePicker = async () => {
    try {
      // Request permission to access photo library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      // Launch image picker with square aspect ratio for profile photos
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,  // Only allow images
        allowsEditing: true,                               // Enable cropping
        aspect: [1, 1],                                   // Square aspect ratio
        quality: 1,                                       // High quality
      });

      // Update form state if user selected an image
      if (!result.canceled) {
        handleInputChange('profileImage', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  /**
   * Handle Profile Update with API Integration
   * 
   * Validates form data and submits updates via API.
   * Includes validation for required fields and email format.
   * Shows loading state and provides success/error feedback.
   */
  const handleUpdate = async () => {
    // Validate required fields
    if (!formData.first_name.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return;
    }

    if (!formData.last_name.trim()) {
      Alert.alert('Error', 'Please enter your last name');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    // Validate email format using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsUpdating(true);
    clearError('profileUpdate');

    try {
      // Prepare update data for API (excluding profileImage for now)
      const updateData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      };

      // Call API to update profile
      const success = await updateUserProfile(updateData);

      if (success) {
        Alert.alert(
          'Success', 
          'Profile updated successfully!', 
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        const error = getError('profileUpdate');
        Alert.alert(
          'Error', 
          error || 'Failed to update profile. Please try again.'
        );
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Scrollable form container for all profile settings */}
      <ScrollView style={styles.scrollView}>
        <View style={[commonStyles.customContainer, styles.container]}>
          
          {/* Profile Image Section with upload functionality */}
          <View style={styles.profileSection}>
            <TouchableOpacity style={styles.profileImageContainer} onPress={handleImagePicker}>
              {/* Current profile image */}
              <Image
                source={
                  formData.profileImage && formData.profileImage.trim() !== '' 
                    ? { uri: formData.profileImage }
                    : require('../../assets/images/profile/p1.png')
                }
                style={styles.profileImage}
              />
              {/* Edit icon overlay for image upload */}
              <View style={styles.uploadIcon}>
                <Ionicons name="pencil" size={16} color={colors.white} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Form Section with all input fields */}
          <View style={styles.formContainer}>
            
            {/* First Name Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={formData.first_name}
                onChangeText={(value) => handleInputChange('first_name', value)}
                placeholder="Enter your first name"
                placeholderTextColor={colors.textLight}
              />
            </View>

            {/* Last Name Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={formData.last_name}
                onChangeText={(value) => handleInputChange('last_name', value)}
                placeholder="Enter your last name"
                placeholderTextColor={colors.textLight}
              />
            </View>

            {/* Mobile Number Input with phone keyboard */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="Enter your number"
                placeholderTextColor={colors.textLight}
                keyboardType="phone-pad"  // Phone-specific keyboard
              />
            </View>

            {/* Email Input with email keyboard and validation */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Enter your email"
                placeholderTextColor={colors.textLight}
                keyboardType="email-address"  // Email-specific keyboard
                autoCapitalize="none"         // Disable auto-capitalization for emails
              />
            </View>

            {/* Address Input (optional) */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Address (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                placeholder="Enter your address"
                placeholderTextColor={colors.textLight}
                multiline={true}
                numberOfLines={3}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Update Button at bottom of screen */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity 
          style={[
            styles.updateButton,
            (isUpdating || isLoading('profileUpdate')) && styles.disabledButton
          ]} 
          onPress={handleUpdate}
          disabled={isUpdating || isLoading('profileUpdate')}
        >
          {(isUpdating || isLoading('profileUpdate')) ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.updateButtonText}>Update</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

/**
 * StyleSheet for ProfileSettingScreen
 * 
 * Defines all visual styling for the profile editing form including:
 * - Profile image display and edit overlay positioning
 * - Form input field styling with proper spacing
 * - Fixed update button positioning at screen bottom
 * - Responsive layout with scroll view support
 */
const styles = StyleSheet.create({
  // Main scroll container
  scrollView: {
    flex: 1,                                    // Fill available height
  },
  
  // Main content container
  container: {
    paddingTop: 24,                             // Top spacing from header
  },
  
  // Profile image section styling
  profileSection: {
    alignItems: 'center',                       // Center profile image
    marginBottom: 32,                           // Space before form fields
  },
  
  // Profile image container with relative positioning for edit icon
  profileImageContainer: {
    position: 'relative',                       // Enable absolute positioning of edit icon
  },
  
  // Profile image styling
  profileImage: {
    width: 120,                                 // Fixed image size
    height: 120,
    borderRadius: 60,                           // Perfect circle
    borderWidth: 3,                             // Border for visual separation
    borderColor: colors.border,
  },
  
  // Edit icon overlay positioning
  uploadIcon: {
    position: 'absolute',                       // Overlay on profile image
    bottom: 8,                                  // Position near bottom-right
    right: 8,
    width: 32,                                  // Small circular button
    height: 32,
    borderRadius: 16,                           // Perfect circle
    backgroundColor: colors.themeColor,         // Theme color background
    justifyContent: 'center',                   // Center icon
    alignItems: 'center',
    borderWidth: 2,                             // White border for contrast
    borderColor: colors.white,
  },
  
  // Form container with space for fixed button
  formContainer: {
    marginBottom: 100,                          // Space for fixed update button
  },
  
  // Individual form field group
  formGroup: {
    marginBottom: 20,                           // Consistent spacing between fields
  },
  
  // Field label styling
  label: {
    fontSize: 14,                               // Readable label size
    fontWeight: '500',                          // Medium weight for emphasis
    color: colors.titleColor,                   // Primary text color
    marginBottom: 8,                            // Space between label and input
  },
  
  // Text input field styling
  input: {
    borderWidth: 1,                             // Subtle border
    borderColor: colors.border,                 // Light border color
    borderRadius: 8,                            // Rounded corners
    paddingHorizontal: 16,                      // Horizontal text padding
    paddingVertical: 12,                        // Vertical text padding
    fontSize: 16,                               // Readable text size
    color: colors.titleColor,                   // Primary text color
    backgroundColor: colors.white,              // White background
  },
  
  // Fixed button container at screen bottom
  fixedButtonContainer: {
    position: 'absolute',                       // Fixed positioning
    bottom: 0,                                  // Stick to bottom
    left: 0,
    right: 0,                                   // Full width
    backgroundColor: colors.white,              // White background
    paddingHorizontal: 16,                      // Side padding
    paddingVertical: 16,                        // Top/bottom padding
    borderTopWidth: 1,                          // Top border separator
    borderTopColor: colors.border,
  },
  
  // Update button styling
  updateButton: {
    backgroundColor: colors.themeColor,         // Primary theme color
    borderRadius: 8,                            // Rounded corners
    paddingVertical: 16,                        // Comfortable touch target
    justifyContent: 'center',                   // Center text
    alignItems: 'center',
  },

  // Text area input for address
  textArea: {
    height: 80,                                 // Taller height for multi-line
    textAlignVertical: 'top',                   // Start text at top
    paddingTop: 12,                             // Top padding for multi-line
  },

  // Disabled button state
  disabledButton: {
    opacity: 0.6,                               // Reduced opacity for disabled state
  },
  
  // Update button text styling
  updateButtonText: {
    color: colors.white,                        // White text on colored background
    fontSize: 16,                               // Readable button text
    fontWeight: '600',                          // Semi-bold for emphasis
  },
});

export default ProfileSettingScreen;
