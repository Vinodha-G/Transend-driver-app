/**
 * Toast Utility
 * 
 * Provides user-friendly error and success messages.
 * Uses React Native's Alert for now, but can be extended with a toast library.
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import { Alert, Platform } from 'react-native';

/**
 * Show Error Toast/Alert
 * 
 * Displays a user-friendly error message to the user.
 * 
 * @param {string} message - Error message to display
 * @param {string} title - Alert title (default: "Error")
 * @param {Function} onPress - Callback when user dismisses alert
 */
export const showError = (message, title = 'Error', onPress = null) => {
  if (Platform.OS === 'web') {
    // On web, use alert
    alert(`${title}\n\n${message}`);
    onPress?.();
  } else {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'OK',
          onPress: onPress || (() => {}),
        },
      ],
      { cancelable: true }
    );
  }
};

/**
 * Show Success Toast/Alert
 * 
 * Displays a success message to the user.
 * 
 * @param {string} message - Success message to display
 * @param {string} title - Alert title (default: "Success")
 * @param {Function} onPress - Callback when user dismisses alert
 */
export const showSuccess = (message, title = 'Success', onPress = null) => {
  if (Platform.OS === 'web') {
    // On web, use alert
    alert(`${title}\n\n${message}`);
    onPress?.();
  } else {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'OK',
          onPress: onPress || (() => {}),
        },
      ],
      { cancelable: true }
    );
  }
};

/**
 * Show Warning Toast/Alert
 * 
 * Displays a warning message to the user.
 * 
 * @param {string} message - Warning message to display
 * @param {string} title - Alert title (default: "Warning")
 * @param {Function} onPress - Callback when user dismisses alert
 */
export const showWarning = (message, title = 'Warning', onPress = null) => {
  if (Platform.OS === 'web') {
    alert(`${title}\n\n${message}`);
    onPress?.();
  } else {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'OK',
          onPress: onPress || (() => {}),
        },
      ],
      { cancelable: true }
    );
  }
};

/**
 * Show Confirmation Dialog
 * 
 * Displays a confirmation dialog with OK and Cancel options.
 * 
 * @param {string} message - Confirmation message
 * @param {string} title - Dialog title (default: "Confirm")
 * @param {Function} onConfirm - Callback when user confirms
 * @param {Function} onCancel - Callback when user cancels
 */
export const showConfirmation = (
  message,
  title = 'Confirm',
  onConfirm = () => {},
  onCancel = () => {}
) => {
  if (Platform.OS === 'web') {
    const confirmed = confirm(`${title}\n\n${message}`);
    if (confirmed) {
      onConfirm();
    } else {
      onCancel();
    }
  } else {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'OK',
          onPress: onConfirm,
        },
      ],
      { cancelable: true }
    );
  }
};

export default {
  showError,
  showSuccess,
  showWarning,
  showConfirmation,
};

