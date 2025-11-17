# Sentry Setup Guide

Sentry is now integrated for production error tracking. Follow these steps to complete the setup:

## 1. Create a Sentry Account

1. Go to [https://sentry.io](https://sentry.io)
2. Sign up for a free account (includes 5,000 errors/month)
3. Create a new project and select **React** as the platform

## 2. Get Your DSN

1. After creating the project, you'll see your DSN (Data Source Name)
2. It looks like: `https://[KEY]@[ORG].ingest.sentry.io/[PROJECT_ID]`
3. Copy this DSN - you'll need it for the next step

## 3. Configure Environment Variables

Add the following to your `.env` file (create one if it doesn't exist):

```bash
# Sentry Configuration
REACT_APP_SENTRY_DSN=https://your_key@your_org.ingest.sentry.io/your_project_id
REACT_APP_SENTRY_ENVIRONMENT=development
```

For production, set:
```bash
REACT_APP_SENTRY_ENVIRONMENT=production
```

## 4. Verify Integration

### In Development:
1. Start the app: `npm start`
2. You should see in the console: `✅ Sentry initialized in development mode`
3. Or if DSN is not configured: `Sentry DSN not configured. Running without error tracking.`

### Test Error Reporting:
1. Open your browser console
2. Trigger an error (e.g., click a button that throws an error)
3. Check your Sentry dashboard at [https://sentry.io/](https://sentry.io/)
4. You should see the error appear within seconds

## 5. Features Enabled

### ✅ Automatic Error Capture
- All uncaught JavaScript errors
- Unhandled promise rejections
- React component errors (via ErrorBoundary)

### ✅ Contextual Information
- User information (when logged in)
  - User ID
  - Email
  - Username
- Error context (component, action, etc.)
- Stack traces
- Browser information
- URL where error occurred

### ✅ Performance Monitoring
- Tracks page load performance
- Transaction sampling: 100% in development, 10% in production
- Custom Web Vitals already integrated

### ✅ Privacy & Security
- Sensitive data filtered from URLs (tokens, passwords)
- User consent handling
- PII masking ready

## 6. How It Works

### Automatic Integration Points:

**1. ErrorBoundary Component**
```typescript
// Automatically captures React errors
<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

**2. API Error Logging**
```typescript
// services/api.ts automatically logs API errors
api.interceptors.response.use(
  response => response,
  error => {
    logApiError(endpoint, error);
    return Promise.reject(error);
  }
);
```

**3. Manual Error Logging**
```typescript
import { errorLogger } from './utils/errorLogger';

// Log errors manually
errorLogger.log(error, ErrorLevel.ERROR, {
  component: 'MyComponent',
  action: 'fetchData'
});
```

**4. User Context**
```typescript
// Automatically set when user logs in
// Automatically cleared when user logs out
// See: contexts/AuthContext.tsx
```

## 7. Viewing Errors

1. Go to your Sentry dashboard: https://[your-org].sentry.io
2. Click on your React project
3. View:
   - **Issues** - All errors grouped by type
   - **Performance** - Page load times, transactions
   - **Releases** - Errors per release version
   - **Alerts** - Configure notifications

## 8. Best Practices

### ✅ DO:
- Check Sentry regularly for production errors
- Set up email/Slack alerts for critical errors
- Use error grouping and filtering
- Tag releases to track which version has issues
- Add breadcrumbs for complex user flows

### ❌ DON'T:
- Commit your `.env` file with real DSN
- Log sensitive user data
- Send test errors to production
- Ignore Sentry quota limits

## 9. Cost Management

**Free Tier Limits:**
- 5,000 errors/month
- 10,000 performance units/month
- 1 project
- 7 days data retention

**Tips to stay within limits:**
- Use sampling (already configured: 10% in production)
- Filter out non-critical errors
- Group similar errors
- Upgrade to paid plan if needed ($26/month for 50k errors)

## 10. Troubleshooting

### "Sentry DSN not configured"
✅ This is normal in development without DSN
✅ Add `REACT_APP_SENTRY_DSN` to `.env` file

### Errors not appearing in Sentry
- Check your DSN is correct
- Ensure you're in production mode or environment is set
- Check browser console for Sentry initialization message
- Verify your Sentry project is not paused

### Too many errors
- Adjust sampling rate in `frontend/src/config/sentry.ts`
- Add more items to `ignoreErrors` array
- Filter out browser extension errors (already configured)

## 11. Next Steps

1. **Set up Alerts**: Configure Slack/email notifications
2. **Source Maps**: Upload source maps for better stack traces
3. **Releases**: Tag deployments with release versions
4. **Custom Context**: Add project-specific context
5. **Performance Monitoring**: Deep dive into slow pages

## Resources

- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Error Boundary Best Practices](https://docs.sentry.io/platforms/javascript/guides/react/features/error-boundary/)
- [Performance Monitoring](https://docs.sentry.io/platforms/javascript/guides/react/performance/)
