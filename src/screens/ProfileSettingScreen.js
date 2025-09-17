/**
 * ProfileSettingScreen.js - User Profile Management
 *
 * Provides a form for users to edit their profile info including
 * name, email, phone, and profile image. Ensures updated data
 * syncs with global context and shows immediately in SettingsScreen.
 *
 * Features:
 * - Profile image upload/edit
 * - Form validation
 * - Real-time form state management
 * - Success/error feedback
 * - Fixed update button
 *
 * @author Driver App
 * @version 1.1.0
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useApp } from "../context/AppContext";
import { colors, commonStyles } from "../styles/commonStyles";

const ProfileSettingScreen = ({ navigation }) => {
  const { user, updateUserProfile } = useApp();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    profileImage: user?.profileImage || "",
  });

  const [loading, setLoading] = useState(false);

  /** Fetch Profile from API */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://devtrans.transend.ca/api/driver/profile?driver_id=${user?.id || 13}`
        );
        const data = await res.json();

        if (data.success && data.data) {
          const p = data.data;
          const fullName = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
          setFormData({
            name: fullName,
            email: p.email ?? "",
            phone: p.phone ?? "",
            profileImage: p.profileImage ?? "",
          });
          updateUserProfile({ ...p, name: fullName });
        } else {
          Alert.alert("Error", data.message || "Failed to load profile");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        Alert.alert("Error", "Unable to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /** Handle input changes */
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /** Image Picker */
  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Camera roll permissions required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        handleInputChange("profileImage", result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  /** Update Profile */
  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }

    const [firstName, ...lastParts] = formData.name.split(" ");
    const lastName = lastParts.join(" ");

    try {
      setLoading(true);

      const res = await fetch(
        "https://devtrans.transend.ca/api/driver/profile/update",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            driver_id: user?.id || 13,
            first_name: firstName,
            last_name: lastName,
            phone: formData.phone,
            email: formData.email,
            profileImage: formData.profileImage,
          }),
        }
      );

      const result = await res.json();

      if (result.success && result.data) {
        const updated = result.data.user || result.data;
        const fullName = `${updated.first_name ?? ""} ${updated.last_name ?? ""}`.trim();

        // Update context and form
        updateUserProfile({ ...updated, name: fullName });
        setFormData({
          name: fullName,
          email: updated.email ?? "",
          phone: updated.phone ?? "",
          profileImage: updated.profileImage ?? "",
        });

        Alert.alert("Success", result.message || "Profile updated successfully!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert("Error", result.message || "Profile update failed");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.themeColor} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={[commonStyles.customContainer, styles.container]}>
            {/* Profile Image */}
            <View style={styles.profileSection}>
              <TouchableOpacity
                style={styles.profileImageContainer}
                onPress={handleImagePicker}
              >
                <Image
                  source={{
                    uri:
                      formData.profileImage ||
                      "https://via.placeholder.com/120?text=Profile",
                  }}
                  style={styles.profileImage}
                />
                <View style={styles.uploadIcon}>
                  <Ionicons name="pencil" size={16} color={colors.white} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>User Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange("name", value)}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textLight}
                  keyboardType="default"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Mobile Number</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange("phone", value)}
                  placeholder="Enter your number"
                  placeholderTextColor={colors.textLight}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange("email", value)}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Update Button */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
          <Text style={styles.updateButtonText}>Update</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  container: { paddingTop: 24 },
  profileSection: { alignItems: "center", marginBottom: 32 },
  profileImageContainer: { position: "relative" },
  profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: colors.border },
  uploadIcon: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.themeColor,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  formContainer: { marginBottom: 100 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "500", color: colors.titleColor, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: colors.titleColor, backgroundColor: colors.white },
  fixedButtonContainer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: colors.white, paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.border },
  updateButton: { backgroundColor: colors.themeColor, borderRadius: 8, paddingVertical: 16, justifyContent: "center", alignItems: "center" },
  updateButtonText: { color: colors.white, fontSize: 16, fontWeight: "600" },
});

export default ProfileSettingScreen;
