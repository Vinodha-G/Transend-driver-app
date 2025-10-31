import React from 'react';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import ErrorBoundary from './components/common/ErrorBoundary';

/**
 * App Root Component
 * 
 * Wraps the entire app with necessary providers and error boundaries.
 * Provides production-ready error handling and recovery.
 * 
 * @author Driver App Team
 * @version 2.0.0 (Production-Ready)
 */
export default function App() {
  return (
    <ErrorBoundary
      componentName="App"
      title="App Error"
      message="The app encountered an unexpected error. Please restart the app."
      onError={(error, errorInfo) => {
        // Log critical app-level errors
        console.error('Critical app error:', error, errorInfo);
      }}
      onRetry={() => {
        // Force app reload on critical error
        // In production, you might want to reload the app
        console.log('Attempting to recover from app error...');
      }}
    >
      <ThemeProvider>
        <AppProvider>
          <AppNavigator />
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
