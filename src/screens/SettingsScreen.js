/**
 * SettingsScreen.js - User Settings and Profile Display
 * 
 * Shows profile info and allows navigation to ProfileSettingScreen
 * and other app settings. Reflects updated profile immediately.
 * 
 * @author Driver
 * @version 1.1.0
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/common/Header';
import { useApp } from '../context/AppContext';
import { colors, commonStyles } from '../styles/commonStyles';

const SettingsScreen = ({ navigation }) => {
  const { user, unreadNotifications } = useApp();

  const handleMenuPress = () => console.log('Menu pressed');
  const handleNotificationPress = () => navigation.navigate('Notification');
  const handleProfilePress = () => navigation.navigate('ProfileSetting');

  const generalSettings = [
    { id: 1, title: 'Profile settings', icon: 'person', onPress: handleProfilePress },
    { id: 2, title: 'My wallet', icon: 'wallet', onPress: () => console.log('Wallet pressed') },
  ];

  const registrationSettings = [
    { id: 1, title: 'Documents', icon: 'document-text', onPress: () => console.log('Documents pressed') },
    { id: 2, title: 'Vehicle Details', icon: 'car', onPress: () => console.log('Vehicle pressed') },
    { id: 3, title: 'Bank details', icon: 'card', onPress: () => console.log('Bank pressed') },
  ];

  const renderSettingItem = (item) => (
    <TouchableOpacity key={item.id} style={styles.settingBox} onPress={item.onPress} activeOpacity={0.7}>
      <View style={styles.settingIcon}>
        <Ionicons name={item.icon} size={24} color={colors.themeColor} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <Header
        onMenuPress={handleMenuPress}
        onNotificationPress={handleNotificationPress}
        showNotificationBadge={unreadNotifications > 0}
      />

      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
        <View style={[commonStyles.customContainer, styles.profileSection]}>
          <View style={styles.profileContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Image
                source={{ uri: user.profileImage || "https://via.placeholder.com/60" }}
                style={styles.profileImage}
              />
              <View style={styles.profileContent}>
  <Text style={styles.profileName}>
    {user.name ? user.name.split(' ')[0] : user.first_name ?? ''}
  </Text>
</View>

            </View>
          </View>
        </View>

        {/* General Settings */}
        <View style={commonStyles.customContainer}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.settingsList}>{generalSettings.map(renderSettingItem)}</View>
        </View>

        {/* Registration Details */}
        <View style={commonStyles.customContainer}>
          <Text style={styles.sectionTitle}>Registration details</Text>
          <View style={styles.settingsList}>{registrationSettings.map(renderSettingItem)}</View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  profileSection: { paddingTop: 16 },
  profileContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: { width: 60, height: 60, borderRadius: 30 },
  profileContent: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: 'bold', color: colors.titleColor },
  sectionTitle: { fontSize: 16, fontWeight: '500', color: colors.titleColor, textTransform: 'capitalize', marginTop: 24, marginBottom: 12 },
  settingsList: { backgroundColor: colors.white, borderRadius: 12, overflow: 'hidden', shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  settingBox: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  settingIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.light, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  settingContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingTitle: { fontSize: 16, color: colors.titleColor },
});

export default SettingsScreen;
