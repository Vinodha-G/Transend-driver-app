import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { logRenderError, getUserFriendlyMessage } from '../../utils/errorLogger';
import { colors, commonStyles } from '../../styles/commonStyles';
import { spacing, componentSizes, responsive } from '../../utils/responsiveDimensions';

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 * 
 * Features:
 * - Catches render errors and lifecycle errors
 * - Logs errors with context for debugging
 * - Displays user-friendly error message
 * - Provides retry functionality
 * - Theme-aware styling
 * 
 * @author Driver App Team
 * @version 2.0.0 (Production-Ready)
 */
class ErrorBoundary extends React.Component {
  state = { 
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging and monitoring
    logRenderError(
      this.props.componentName || 'Unknown Component',
      error,
      errorInfo,
      {
        screen: this.props.screen,
        action: this.props.action,
      }
    );

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Store error info for display
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      // Use ErrorFallback component for consistent error UI
      return (
        <ErrorFallback
          title={this.props.title}
          message={this.props.message || getUserFriendlyMessage(this.state.error)}
          onRetry={this.handleRetry}
          showDetails={__DEV__ && this.state.error}
          error={this.state.error}
          errorInfo={this.state.errorInfo}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Error Fallback Component
 * 
 * Displays a user-friendly error message with retry option.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Error title
 * @param {string} props.message - Error message
 * @param {Function} props.onRetry - Retry callback
 * @param {boolean} props.showDetails - Show error details (dev only)
 * @param {Error} props.error - Error object
 * @param {Object} props.errorInfo - Error info
 */
const ErrorFallback = ({ title, message, onRetry, showDetails, error, errorInfo }) => {
  const { theme } = useTheme();

  return (
    <SafeAreaView 
      style={[commonStyles.container, { backgroundColor: theme.background }]} 
      edges={['top', 'bottom']}
    >
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={theme.error} />
        <Text style={[styles.errorTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>{message}</Text>
        
        {showDetails && error && (
          <View style={[styles.errorDetails, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.errorDetailsTitle, { color: theme.text }]}>Error Details (Dev Only):</Text>
            <Text style={[styles.errorDetailsText, { color: theme.textSecondary }]}>
              {error.toString()}
            </Text>
            {errorInfo?.componentStack && (
              <Text style={[styles.errorDetailsText, { color: theme.textSecondary }]}>
                {errorInfo.componentStack}
              </Text>
            )}
          </View>
        )}

        <Pressable
          onPress={onRetry}
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Retry loading the screen"
          accessibilityHint="Double tap to try loading the screen again"
        >
          <Ionicons name="refresh" size={20} color={theme.textLight || '#FFFFFF'} />
          <Text style={[styles.retryText, { color: theme.textLight || '#FFFFFF' }]}>Retry</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  onError: PropTypes.func,
  onRetry: PropTypes.func,
  componentName: PropTypes.string,
  screen: PropTypes.string,
  action: PropTypes.string,
};

ErrorBoundary.defaultProps = {
  title: 'Something went wrong',
  message: 'An error occurred while loading this screen. Please try again.',
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  errorTitle: {
    fontSize: responsive(24, 28, 20),
    fontWeight: 'bold',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: responsive(16, 18, 14),
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  errorDetails: {
    width: '100%',
    maxHeight: 200,
    padding: spacing.md,
    borderRadius: componentSizes.cardBorderRadius,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  errorDetailsTitle: {
    fontSize: responsive(14, 16, 12),
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  errorDetailsText: {
    fontSize: responsive(12, 14, 10),
    fontFamily: 'monospace',
    marginBottom: spacing.xs,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: componentSizes.buttonBorderRadius,
    minHeight: componentSizes.buttonHeight,
    gap: spacing.sm,
    elevation: componentSizes.cardElevation,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  retryText: {
    fontSize: responsive(16, 18, 14),
    fontWeight: '600',
  },
});

export default ErrorBoundary;
