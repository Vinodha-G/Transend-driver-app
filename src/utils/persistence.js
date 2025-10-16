/**
 * persistence.js - State Persistence Utility
 * 
 * This utility handles persistence of app state to AsyncStorage with versioning,
 * migration support, and error recovery.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage version for handling migrations
const STORAGE_VERSION = '1.0';

// Storage keys
export const STORAGE_KEYS = {
  VERSION: '@app_storage_version',
  USER: '@app_user',
  JOBS: '@app_jobs',
  NOTIFICATIONS: '@app_notifications',
  DASHBOARD: '@app_dashboard',
  DOCUMENTS: '@app_documents',
};

/**
 * Save state to persistent storage
 * 
 * @param {string} key - Storage key
 * @param {*} data - Data to store
 * @returns {Promise<void>}
 */
export const persistState = async (key, data) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Failed to persist state for ${key}:`, error);
  }
};

/**
 * Load state from persistent storage
 * 
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if no stored data exists
 * @returns {Promise<*>} Stored data or default value
 */
export const loadState = async (key, defaultValue = null) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
  } catch (error) {
    console.error(`Failed to load state for ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Clear all persisted state
 * 
 * @returns {Promise<void>}
 */
export const clearPersistedState = async () => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('Failed to clear persisted state:', error);
  }
};

/**
 * Initialize storage and handle migrations
 * 
 * @returns {Promise<void>}
 */
export const initializeStorage = async () => {
  try {
    const storedVersion = await AsyncStorage.getItem(STORAGE_KEYS.VERSION);

    if (storedVersion !== STORAGE_VERSION) {
      // Handle migrations here based on version differences
      await clearPersistedState();
      await AsyncStorage.setItem(STORAGE_KEYS.VERSION, STORAGE_VERSION);
    }
  } catch (error) {
    console.error('Failed to initialize storage:', error);
  }
};

/**
 * Save multiple state items at once
 * 
 * @param {Object} items - Key-value pairs to store
 * @returns {Promise<void>}
 */
export const persistMultipleStates = async (items) => {
  try {
    const pairs = Object.entries(items).map(([key, value]) => [
      key,
      JSON.stringify(value)
    ]);
    await AsyncStorage.multiSet(pairs);
  } catch (error) {
    console.error('Failed to persist multiple states:', error);
  }
};

/**
 * Load multiple state items at once
 * 
 * @param {Object} keys - Keys and their default values
 * @returns {Promise<Object>} Object with loaded values
 */
export const loadMultipleStates = async (keys) => {
  try {
    const loadedPairs = await AsyncStorage.multiGet(Object.keys(keys));
    return loadedPairs.reduce((acc, [key, value]) => ({
      ...acc,
      [key]: value ? JSON.parse(value) : keys[key]
    }), {});
  } catch (error) {
    console.error('Failed to load multiple states:', error);
    return keys; // Return default values on error
  }
};