import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/commonStyles';

/**
 * Network Status component to show offline state and retry option
 */
const NetworkStatus = ({ isConnected, onRetry }) => {
  if (isConnected) return null;

  return (
    <View style={styles.container} testID="network-status">
      <View style={styles.content}>
        <Ionicons name="cloud-offline" size={24} color={colors.error} />
        <Text style={styles.text}>No Internet Connection</Text>
      </View>
      <Pressable
        onPress={onRetry}
        style={styles.retryButton}
        accessibilityRole="button"
        accessibilityLabel="Retry connection"
        accessibilityHint="Double tap to check internet connection again"
      >
        <Text style={styles.retryText}>Retry</Text>
      </Pressable>
    </View>
  );
};

NetworkStatus.propTypes = {
  isConnected: PropTypes.bool.isRequired,
  onRetry: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  text: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.textDark,
  },
  retryButton: {
    backgroundColor: colors.themeColor,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  retryText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default React.memo(NetworkStatus);