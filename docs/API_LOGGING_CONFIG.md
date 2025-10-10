# API Logging Configuration

## Overview
The API client logging has been optimized to reduce console noise while maintaining visibility into errors and important warnings.

## Logging Levels

### Current Configuration (Default)
```javascript
const LOG_CONFIG = {
  ENABLE_REQUEST_LOGS: false,    // Disabled to reduce noise
  ENABLE_RESPONSE_LOGS: false,   // Disabled to reduce noise
  ENABLE_ERROR_LOGS: true,       // Always show errors
  ENABLE_WARNING_LOGS: true,     // Always show warnings
};
```

## What You'll See in Console

### ✅ **Kept (Important)**
- **Errors**: Authentication failures, server errors, network issues
- **Warnings**: HTML responses, rate limiting, missing endpoints
- **Validation Errors**: Data type mismatches and schema violations

### ❌ **Removed (Noise)**
- Successful API request details
- Successful API response payloads
- Individual retry attempts (only final failure)

## Examples

### Before (Noisy)
```
🚀 API Request: { method: 'POST', url: '/dashboard', data: {...} }
✅ API Response: { status: 200, data: {...massive payload...} }
🔄 Retrying request (1/3)...
🔄 Retrying request (2/3)...
```

### After (Clean)
```
⚠️ API returned HTML instead of JSON - endpoint may not exist
🔐 Authentication expired. Please log in again.
```

## Enabling Debug Mode

To enable detailed logging for debugging:

```javascript
// In src/api/client.js
const LOG_CONFIG = {
  ENABLE_REQUEST_LOGS: true,     // Enable for debugging
  ENABLE_RESPONSE_LOGS: true,    // Enable for debugging
  ENABLE_ERROR_LOGS: true,
  ENABLE_WARNING_LOGS: true,
};
```

## Warning Types

- **🔐** Authentication issues
- **🚫** Permission denied
- **📭** Resource not found
- **⏱️** Rate limit exceeded
- **🔧** Server errors
- **⚠️** API endpoint issues

This configuration maintains debugging capability while keeping the console clean during normal operation.