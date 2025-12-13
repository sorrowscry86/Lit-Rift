# System Diagnostics Dashboard Guide

## Overview

The System Diagnostics Dashboard is a real-time monitoring tool that provides detailed insights into the health and status of all backend services and components. It helps developers and operators quickly identify issues, understand system health, and troubleshoot problems.

![Diagnostics Dashboard](https://github.com/user-attachments/assets/9ddfea15-6521-446c-89cb-46bcb0557b18)

## Features

### Real-Time Monitoring
- **Auto-refresh**: Updates service status every 10 seconds automatically
- **Manual refresh**: On-demand refresh with a single click
- **Live status indicators**: Color-coded badges showing service health at a glance
- **Timestamp tracking**: Shows when each service was last checked

### Service Health Checks
The dashboard monitors the following services:

1. **Firebase Admin SDK**
   - Checks if Firebase is properly initialized
   - Validates service account configuration

2. **Cloud Firestore Database**
   - Tests database connectivity
   - Measures response times
   - Verifies read/write operations

3. **Gemini AI API**
   - Validates API key configuration
   - Checks API connectivity
   - Lists available AI models
   - Measures response times

4. **WebSocket Server**
   - Verifies SocketIO server status
   - Monitors real-time connection capabilities

### Visual Indicators

The dashboard uses a color-coded system to quickly communicate service status:

- **🟢 Green (Healthy)**: Service is functioning normally
- **🟠 Orange (Degraded)**: Service is operational but with reduced functionality
- **🔴 Red (Unhealthy/Error)**: Service is not functioning correctly

### Summary Statistics

At the top of the dashboard, you'll find summary cards showing:
- **Total Services**: Total number of monitored services
- **Healthy Count**: Number of services operating normally
- **Degraded Count**: Number of services with reduced functionality
- **Unhealthy Count**: Number of services that are down or failing

### Troubleshooting Tips

Each service card includes contextual troubleshooting information when issues are detected:

- **Firebase Admin SDK**: Check `FIREBASE_CONFIG` environment variable and service account key
- **Firestore Database**: Verify Firebase project has Firestore enabled and check network connectivity
- **Gemini AI API**: Verify `GOOGLE_API_KEY` environment variable and check API quota limits
- **WebSocket Server**: Check for port conflicts and server configuration

## Accessing the Dashboard

### Via User Menu
1. Log in to your Lit-Rift account
2. Click on your user avatar in the top-right corner
3. Select **"System Diagnostics"** from the dropdown menu

### Direct URL
Navigate directly to: `http://your-domain.com/diagnostics`

**Note**: You must be authenticated to access the diagnostics dashboard.

## API Endpoints

The diagnostics dashboard connects to the following backend API endpoints:

### General Health Check
```
GET /api/diagnostics/health
```

Returns overall system health and status of all services.

**Response Example:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-12T11:54:22.466405",
  "services": {
    "firebase": {
      "status": "healthy",
      "last_check": "2025-12-12T11:54:22.466376",
      "message": "Firebase Admin SDK initialized successfully"
    },
    "firestore": {
      "status": "healthy",
      "last_check": "2025-12-12T11:54:22.466385",
      "message": "Connected successfully (response time: 45.23ms)",
      "response_time_ms": 45.23
    },
    "gemini_ai": {
      "status": "healthy",
      "last_check": "2025-12-12T11:54:22.466396",
      "message": "API connected successfully (response time: 120.45ms)",
      "response_time_ms": 120.45,
      "available_models": 15
    },
    "socketio": {
      "status": "healthy",
      "last_check": "2025-12-12T11:54:22.466399",
      "message": "WebSocket server running"
    }
  },
  "summary": {
    "total_services": 4,
    "healthy_count": 4,
    "unhealthy_count": 0,
    "degraded_count": 0
  }
}
```

### Detailed Health Information
```
GET /api/diagnostics/health/detailed
```

Returns detailed health information including environment configuration.

### Service-Specific Health Check
```
GET /api/diagnostics/health/service/{service_name}
```

Returns health status for a specific service.

**Available services:**
- `firebase`
- `firestore`
- `gemini_ai`
- `socketio`

## Status Definitions

### Healthy
- All checks passed successfully
- Service is fully operational
- Response times are within acceptable limits
- No configuration issues detected

### Degraded
- Service is partially operational
- Some features may not be available
- Response times may be slower than normal
- Minor configuration issues detected

### Unhealthy
- Service is not operational
- Critical configuration missing
- Connection failures
- Service unavailable or returning errors

## Common Issues and Solutions

### Firebase Admin SDK Not Initialized

**Symptoms:**
- Firebase service shows "Unhealthy" status
- Message: "Firebase Admin SDK not initialized"

**Solutions:**
1. Verify `FIREBASE_CONFIG` environment variable is set
2. Check that the service account key JSON file exists and is valid
3. Ensure the Firebase project ID matches your configuration
4. Verify file permissions on the service account key

### Firestore Connection Failed

**Symptoms:**
- Firestore service shows "Unhealthy" status
- Message: "Database connection failed" or "Firebase not initialized"

**Solutions:**
1. Verify Firebase is properly initialized first
2. Check that Firestore is enabled in your Firebase project
3. Verify network connectivity to Firebase servers
4. Check Firestore security rules
5. Verify you have sufficient Firebase quota

### Gemini AI API Not Configured

**Symptoms:**
- Gemini AI service shows "Unhealthy" status
- Message: "GOOGLE_API_KEY not configured"

**Solutions:**
1. Set the `GOOGLE_API_KEY` environment variable
2. Verify the API key is valid and active
3. Check your Google Cloud project has the Generative AI API enabled
4. Verify you haven't exceeded API quota limits
5. Check for any API key restrictions or IP allowlisting

### WebSocket Server Issues

**Symptoms:**
- WebSocket service shows "Unhealthy" status
- Real-time features not working

**Solutions:**
1. Check for port conflicts (default: 5000)
2. Verify Flask-SocketIO is properly installed
3. Check firewall rules for WebSocket connections
4. Verify CORS configuration allows WebSocket connections

## Performance Metrics

The dashboard tracks and displays performance metrics for applicable services:

### Response Time
- **Good**: < 100ms
- **Acceptable**: 100-500ms
- **Slow**: 500-1000ms
- **Poor**: > 1000ms

### Auto-Refresh Interval
- Default: 10 seconds
- Can be toggled on/off using the "Live" button
- Manual refresh available at any time

## Development and Debugging

### Using the Dashboard During Development

The diagnostics dashboard is particularly useful during development:

1. **Service Configuration**: Quickly verify all required environment variables are set
2. **Integration Testing**: Confirm all external services are accessible
3. **Performance Monitoring**: Track response times to identify bottlenecks
4. **Deployment Verification**: Confirm all services are healthy after deployment

### Mock Mode

When environment variables are not configured (e.g., in development without credentials), services will show as "Unhealthy" with clear messages about what's missing. This is expected behavior and helps identify configuration issues quickly.

### Adding New Service Checks

To add monitoring for additional services:

1. **Backend**: Update `/backend/routes/health.py`
   - Add a new check function (e.g., `check_new_service_status()`)
   - Add the service to the `service_status` dictionary
   - Call the check function in the health endpoints

2. **Frontend**: Update `/frontend/src/pages/DiagnosticsPage.tsx`
   - Update the `ServiceStatus` interface if needed
   - Add display name in `getServiceDisplayName()`
   - Add troubleshooting tip in `getTroubleshootingTip()`

## Security Considerations

- The diagnostics dashboard requires authentication
- Sensitive information (API keys, credentials) is never displayed
- Only shows boolean flags indicating presence of configuration
- Environment information is limited to non-sensitive data

## Best Practices

1. **Check Before Deployment**: Always verify all services are healthy before deploying to production
2. **Monitor Response Times**: Watch for increasing response times as an early warning of performance issues
3. **Review Regularly**: Check the dashboard periodically, especially after configuration changes
4. **Auto-Refresh for Monitoring**: Enable auto-refresh when actively monitoring system health
5. **Use Troubleshooting Tips**: Follow the contextual tips provided for each service issue

## Technical Implementation

### Backend
- **Framework**: Flask with Blueprint pattern
- **Health Checks**: Individual check functions for each service
- **Caching**: Status updates cached for efficient repeated checks
- **Error Handling**: Comprehensive try-catch blocks with detailed error messages

### Frontend
- **Framework**: React with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: React hooks (useState, useEffect, useCallback)
- **Auto-Refresh**: setInterval with cleanup
- **Responsive Design**: Mobile-friendly grid layout

## Future Enhancements

Potential improvements for the diagnostics dashboard:

- [ ] Historical data and trends (24-hour charts)
- [ ] Alert notifications for service degradation
- [ ] Export diagnostic reports
- [ ] Integration with external monitoring tools (Datadog, New Relic)
- [ ] Performance graphs and visualizations
- [ ] Custom health check intervals
- [ ] Service dependency mapping
- [ ] Incident history and logs

## Support

If you encounter issues with the diagnostics dashboard:

1. Check the browser console for JavaScript errors
2. Verify the backend server is running
3. Check backend logs for API errors
4. Ensure you're authenticated
5. Try clearing browser cache and refreshing

For additional help, see the main [README.md](README.md) or open an issue on GitHub.

---

**Last Updated**: December 2025  
**Version**: 1.0.0
