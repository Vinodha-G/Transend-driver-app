import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { colors } from '../../styles/commonStyles';

/**
 * Loading state component to show while data is being fetched
 */
const LoadingState = ({ message = 'Loading...' }) => (
  <View style={styles.container} testID="loading-state">
    <ActivityIndicator size="large" color={colors.themeColor} />
    <Text style={styles.text}>{message}</Text>
  </View>
);

LoadingState.propTypes = {
  message: PropTypes.string,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
});

export default React.memo(LoadingState);