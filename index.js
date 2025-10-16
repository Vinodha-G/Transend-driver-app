/**
 * index.js - Application Entry Point
 * 
 * This is the main entry point for the React Native Driver App using Expo.
 * It registers the root component with the React Native AppRegistry and ensures
 * the app works correctly in both Expo Go and native builds.
 * 
 * The registerRootComponent function:
 * - Calls AppRegistry.registerComponent('main', () => App)
 * - Sets up the environment appropriately for different runtime contexts
 * - Handles the bridge between Expo runtime and React Native
 * 
 * Flow:
 * index.js → App.js → AppNavigator.js → Individual Screens
 * 
 * @author Driver App Team
 * @version 1.0.0
 */

import { registerRootComponent } from 'expo';

import App from './App';

// Register the main App component as the root component
// This ensures compatibility with both Expo Go and native builds
registerRootComponent(App);
