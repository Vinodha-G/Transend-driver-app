# Driver App - API Integration Guide

This guide explains how to use the comprehensive API integration that has been implemented in the Driver App.

## 🚀 Overview

The Driver App now includes complete API integration with the following features:

- **Real-time Dashboard Data**: Job statistics and counts from API
- **Profile Management**: View and update driver profile information
- **Document Management**: Upload and manage driver documents
- **Job Status Updates**: Accept, pickup, and deliver jobs via API
- **Notification System**: Real-time notifications with read/unread tracking
- **Loading States**: Comprehensive loading and error handling
- **Pull-to-Refresh**: Refresh data on all screens

## 📁 API Layer Structure

```
src/api/
├── client.js           # Axios configuration, interceptors, error handling
├── endpoints.js        # All API endpoint definitions
├── services.js         # API service functions (driver, job, notification)
└── index.js           # Central export point for all API functionality
```

## 🔧 Getting Started

### 1. Install Dependencies

```bash
npm install axios expo-document-picker
```

### 2. Environment Configuration

The API client is configured to use the development environment by default:

```javascript
// In src/api/client.js
const ENVIRONMENTS = {
  development: 'https://devtrans.transend.ca/api',
  staging: 'https://stagingapi.transend.ca/api',
  production: 'https://api.transend.ca/api'
};
```

Change `CURRENT_ENVIRONMENT` to switch between environments.

### 3. Authentication (Optional)

Set authentication token when user logs in:

```javascript
import { setAuthToken } from '../api';

// After successful login
setAuthToken(loginResponse.token);
```

## 📊 Implemented APIs

### Driver Profile APIs

#### Get Driver Profile
```javascript
// GET /driver/profile
const { user, loadDriverProfile } = useApp();

// Load profile data
await loadDriverProfile();

// Access profile data
console.log(user.first_name, user.last_name, user.email);
```

#### Update Driver Profile
```javascript
// POST /driver/profile/update
const { updateUserProfile } = useApp();

const success = await updateUserProfile({
  first_name: 'John',
  last_name: 'Driver',
  email: 'john@example.com',
  phone: '+1234567890',
  address: '123 Main St'
});
```

### Dashboard & Jobs APIs

#### Get Dashboard Data
```javascript
// POST /driver/dashboard
const { dashboardData, jobStats, loadDashboardData } = useApp();

// Load dashboard data
await loadDashboardData();

// Access job statistics
console.log('New Orders:', jobStats.newOrders);
console.log('Accepted:', jobStats.accepted);
console.log('Picked Up:', jobStats.pickedup);
console.log('Delivered:', jobStats.delivered);
```

#### Job Status Updates
```javascript
// Update job status through various APIs
const { updateJobStatus } = useApp();

// Accept a job
await updateJobStatus(jobId, 'accepted');

// Mark as picked up
await updateJobStatus(jobId, 'pickedup');

// Mark as delivered
await updateJobStatus(jobId, 'delivered');
```

### Document Management APIs

#### Get Documents
```javascript
// POST /driver/documents
const { documents, loadDriverDocuments } = useApp();

// Load documents
await loadDriverDocuments();

// Access document URLs
console.log('Insurance:', documents.insurance);
console.log('License Front:', documents.driver_license_front);
```

#### Upload Documents
```javascript
// POST /driver/documents/update
const { updateDriverDocuments } = useApp();

const documentFiles = {
  insurance: {
    uri: 'file://path/to/insurance.pdf',
    type: 'application/pdf',
    name: 'insurance.pdf'
  }
};

const success = await updateDriverDocuments(documentFiles);
```

### Attendance API

#### Mark Driver Absent
```javascript
// POST /driver/mark-absent
const { markDriverAbsent } = useApp();

const success = await markDriverAbsent({
  reason: 'Sick leave',
  date: '2025-09-10'
});
```

## 🎯 Using APIs in Components

### Screen-Level Integration

```javascript
import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';

const MyScreen = ({ navigation }) => {
  const {
    user,
    dashboardData,
    loading,
    errors,
    loadDashboardData,
    refreshAllData,
    isLoading,
    getError
  } = useApp();

  // Load data when screen focuses
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboardData();
    });
    return unsubscribe;
  }, [navigation, loadDashboardData]);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    await refreshAllData();
  };

  // Check loading state
  if (isLoading('dashboard')) {
    return <LoadingSpinner />;
  }

  // Check for errors
  const error = getError('dashboard');
  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isLoading('dashboard')}
          onRefresh={handleRefresh}
        />
      }
    >
      {/* Your content */}
    </ScrollView>
  );
};
```

### Form Integration

```javascript
const ProfileForm = () => {
  const { user, updateUserProfile, isLoading } = useApp();
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleSubmit = async () => {
    const success = await updateUserProfile(formData);
    if (success) {
      Alert.alert('Success', 'Profile updated!');
    }
  };

  return (
    <View>
      <TextInput
        value={formData.first_name}
        onChangeText={(text) => setFormData(prev => ({ ...prev, first_name: text }))}
        placeholder="First Name"
      />
      {/* Other form fields */}
      <TouchableOpacity 
        onPress={handleSubmit}
        disabled={isLoading('profileUpdate')}
      >
        <Text>
          {isLoading('profileUpdate') ? 'Updating...' : 'Update Profile'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

## 🔄 State Management

### Global State Structure

```javascript
const AppContext = {
  // Data States
  user: null,                    // Driver profile data
  jobs: [],                      // Job list
  notifications: [],             // Notifications
  documents: {},                 // Document URLs
  dashboardData: {},             // Dashboard statistics

  // Loading States
  loading: {
    profile: false,
    dashboard: false,
    documents: false,
    profileUpdate: false,
    documentUpdate: false
  },

  // Error States
  errors: {
    profile: null,
    dashboard: null,
    documents: null,
    profileUpdate: null,
    documentUpdate: null
  },

  // Functions
  loadDriverProfile: () => {},
  loadDashboardData: () => {},
  updateUserProfile: () => {},
  refreshAllData: () => {},
  // ... more functions
};
```

### Helper Functions

```javascript
const { isLoading, getError, clearError } = useApp();

// Check if any operation is loading
if (isLoading('dashboard')) {
  // Show loading spinner
}

// Get error for specific operation
const error = getError('profileUpdate');
if (error) {
  Alert.alert('Error', error);
}

// Clear error when handled
clearError('profileUpdate');
```

## 📱 Updated Screens

### 1. CurrentJobScreen
- **Real-time job data** from dashboard API
- **Job action buttons** with API integration (Start/Complete)
- **Loading states** and error handling
- **Pull-to-refresh** functionality

### 2. HomeScreen
- **Live statistics** from dashboard API
- **New jobs list** from API
- **Real-time updates** when navigating to screen
- **Pull-to-refresh** to update all data

### 3. ProfileSettingScreen
- **API-integrated profile updates**
- **Form validation** with proper error handling
- **Loading states** during API calls
- **Success/error feedback** with alerts

### 4. DocumentsScreen (New)
- **Document upload** with file picker
- **View uploaded documents** in browser
- **Real-time status** indicators
- **Progress tracking** for uploads

### 5. APITestScreen (Development)
- **Test all APIs** individually
- **View API responses** and errors
- **Current context data** display
- **Useful for debugging** API integration

## 🛠️ Error Handling

### API-Level Error Handling
```javascript
// Automatic error handling in API client
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different error types
    if (error.response?.status === 401) {
      // Clear auth token, redirect to login
    }
    return Promise.reject(standardizedError);
  }
);
```

### Component-Level Error Handling
```javascript
const MyComponent = () => {
  const { getError, clearError } = useApp();
  
  useEffect(() => {
    const error = getError('dashboard');
    if (error) {
      Alert.alert(
        'Error',
        error,
        [
          { text: 'Cancel', onPress: () => clearError('dashboard') },
          { text: 'Retry', onPress: () => loadDashboardData() }
        ]
      );
    }
  }, [getError('dashboard')]);
};
```

## 🔄 Pull-to-Refresh Implementation

All major screens now support pull-to-refresh:

```javascript
<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={isLoading('dashboard')}
      onRefresh={handleRefresh}
      colors={[colors.themeColor]}
      tintColor={colors.themeColor}
    />
  }
>
  {/* Content */}
</ScrollView>
```

## 📋 Loading States

### Button Loading States
```javascript
<TouchableOpacity
  style={[
    styles.button,
    loading && styles.disabledButton
  ]}
  onPress={handleAction}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator size="small" color={colors.white} />
  ) : (
    <Text>Action Button</Text>
  )}
</TouchableOpacity>
```

### Screen Loading States
```javascript
if (isLoading('dashboard') && !currentData) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.themeColor} />
      <Text>Loading...</Text>
    </View>
  );
}
```

## 🧪 Testing APIs

Use the `APITestScreen` component to test all APIs:

1. Navigate to the API Test Screen
2. View current context data
3. Test individual API calls
4. View results and error messages
5. Clear results to reset

## 📝 API Response Format

All APIs return a consistent format:

```javascript
{
  success: boolean,
  message: string,
  data: any,
  error?: any  // Only on errors
}
```

Example API responses:

```javascript
// Success Response
{
  success: true,
  message: "Profile updated successfully",
  data: { user: { id: 91, first_name: "John", ... } }
}

// Error Response
{
  success: false,
  message: "Driver not found",
  data: [],
  error: { status: 404, originalError: ... }
}
```

## 🔐 Security Considerations

1. **Authentication**: Tokens are managed automatically
2. **Request Interceptors**: Add auth headers to all requests
3. **Error Handling**: Sensitive data is not exposed in errors
4. **File Uploads**: File size and type validation
5. **Environment Variables**: Different API endpoints for different environments

## 🚀 Future Enhancements

1. **Offline Support**: Cache API responses for offline access
2. **Real-time Updates**: WebSocket integration for live updates
3. **Advanced Error Retry**: Exponential backoff for failed requests
4. **Data Persistence**: Store user data locally with AsyncStorage
5. **Push Notifications**: Real-time notification delivery

## 📞 Support

For API integration support:
- Check console logs for detailed error information
- Use the API Test Screen for debugging
- Review network requests in development tools
- Verify API endpoint configurations

---

This implementation provides a robust, production-ready API integration for the Driver App with comprehensive error handling, loading states, and user feedback.
