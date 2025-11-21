# Authentication Test Permissions

## Overview

This document outlines the permissions and configurations required to run authentication tests for the Lit-Rift application.

## Current Test Setup

### ✅ Tests Run Successfully WITHOUT External Permissions

All authentication tests (84 tests total) run successfully in a **fully mocked environment** without requiring:
- Active Firebase connection
- Real Firebase authentication credentials
- Network access
- Google OAuth credentials
- Email service access

### Test Files
- `LoginPage.test.tsx` - 19 tests
- `SignupPage.test.tsx` - 21 tests
- `PasswordResetPage.test.tsx` - 15 tests
- `ProtectedRoute.test.tsx` - 13 tests (corrected - was 9 tests)
- `AuthContext.test.tsx` - 20 tests

**Total: 84 passing tests**

## Mock Configuration

### Firebase Mocking
**Location:** `frontend/src/setupTests.ts`

```typescript
jest.mock('./config/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
  },
}));
```

**Purpose:** Prevents Firebase SDK initialization during tests, eliminating the need for Firebase credentials.

### Sentry Mocking
**Location:** `frontend/src/setupTests.ts`

```typescript
jest.mock('./config/sentry', () => ({
  initSentry: jest.fn(),
  setSentryUser: jest.fn(),
  clearSentryUser: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
}));
```

**Purpose:** Prevents Sentry error tracking initialization during tests.

## Permissions Currently NOT Required

### ❌ Firebase Permissions
- **Firebase Project Access** - Not required (fully mocked)
- **Firebase Authentication API** - Not required (fully mocked)
- **Firebase Firestore Rules** - Not required (no database calls in auth tests)
- **Firebase Storage Rules** - Not required (not tested)

### ❌ Google OAuth Permissions
- **Google Cloud Console Access** - Not required (mocked)
- **OAuth 2.0 Client ID** - Not required (mocked)
- **Google Sign-In API** - Not required (mocked)

### ❌ Network Permissions
- **Internet Access** - Not required (no network calls)
- **Firewall Rules** - Not required
- **CORS Configuration** - Not required

### ❌ Local Environment Permissions
- **File System Write Access** - Only for test reports (standard Jest)
- **Environment Variables** - Not required for tests
  - `REACT_APP_FIREBASE_*` variables are not needed
  - Tests run without `.env` file

## Permissions That WOULD Improve Testing (Optional)

### 🔄 Integration Testing (Future Enhancement)

If you want to add **integration tests** that actually connect to Firebase:

#### Required Firebase Permissions:
1. **Firebase Project Access**
   - Project Owner or Editor role
   - Access to Firebase Console

2. **Firebase Authentication Configuration**
   - Email/Password authentication enabled
   - Google Sign-In provider enabled
   - Test user accounts created

3. **Firebase Authentication API Access**
   - Authentication API enabled in Google Cloud Console
   - API quota sufficient for test runs

4. **Firebase Environment Variables**
   ```env
   REACT_APP_FIREBASE_API_KEY=your-test-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-test-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-test-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-test-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

5. **Google OAuth Configuration**
   - OAuth 2.0 Client ID for testing
   - Authorized domains configured
   - Test users whitelisted

6. **Firebase Security Rules** (for protected endpoints)
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow authenticated users to read/write
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

### 🚀 CI/CD Testing Permissions

For running tests in CI/CD pipelines:

1. **GitHub Actions Secrets** (if using GitHub Actions)
   - `FIREBASE_SERVICE_ACCOUNT` - Service account JSON for test project
   - `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account key

2. **Firebase Service Account**
   - Service account with Authentication Admin role
   - JSON key file stored securely
   - Permissions to create/delete test users

3. **Rate Limiting Considerations**
   - Firebase Authentication has rate limits
   - May need to implement test user pooling
   - Consider using Firebase Emulator Suite for unlimited testing

## Firebase Emulator Suite (Recommended for Local Integration Tests)

### Benefits:
- No Firebase project required
- No authentication credentials needed
- Unlimited test execution
- Faster test runs (local)
- No rate limiting

### Setup:
```bash
npm install -g firebase-tools
firebase init emulators
firebase emulators:start --only auth
```

### Configuration:
```typescript
// src/config/firebase.test.ts
import { connectAuthEmulator } from 'firebase/auth';

if (process.env.NODE_ENV === 'test' && process.env.USE_EMULATOR) {
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

## Current Test Approach: Unit Tests with Mocks

### ✅ Advantages:
1. **Fast Execution** - Tests run in ~12 seconds
2. **No External Dependencies** - No Firebase/Google/network required
3. **Reliable** - No flaky tests due to network issues
4. **Cost-Free** - No Firebase usage costs
5. **Privacy-Friendly** - No real user data
6. **CI/CD Friendly** - No secrets management needed

### ⚠️ Limitations:
1. **Mock Behavior** - Tests Firebase mock, not real Firebase
2. **No Real Authentication** - Can't catch Firebase-specific issues
3. **No OAuth Flow** - Google Sign-In popup not tested end-to-end
4. **No Network Errors** - Network failure scenarios not tested

## Recommendations

### For Development (Current Approach) ✅
- Continue using mocked unit tests
- Fast feedback loop
- No permissions required

### For Pre-Production (Future Enhancement) 🔄
- Add Firebase Emulator Suite tests
- Test against emulated Firebase Auth
- Still no external permissions required

### For Production Validation (Optional) 🚀
- Create separate Firebase test project
- Use service account for automation
- Run integration tests against real Firebase
- Store credentials securely in CI/CD

## Running Tests

### Current Setup (No Permissions Required)
```bash
cd frontend
npm test -- --testPathPattern="LoginPage|SignupPage|PasswordResetPage|ProtectedRoute|AuthContext"
```

### With Firebase Emulator (Local Integration Tests)
```bash
# Terminal 1: Start emulator
firebase emulators:start --only auth

# Terminal 2: Run tests with emulator
USE_EMULATOR=true npm test
```

## Security Notes

### Secrets Management
If adding integration tests:
1. **Never commit Firebase credentials to git**
2. Use environment variables or secret managers
3. Rotate service account keys regularly
4. Use separate Firebase projects for test/prod
5. Implement least-privilege access

### Test Data
1. Use fake/generated data only
2. Clean up test users after runs
3. Don't use production user emails
4. Implement test data isolation

## Troubleshooting

### Tests Fail with "Firebase not initialized"
✅ **Solution:** This shouldn't happen with current mocks. Check `setupTests.ts`.

### Tests Timeout
✅ **Solution:** Current tests complete in ~12s. If timeout occurs, check mock setup.

### "Module not found: firebase/auth"
✅ **Solution:** Run `npm install` in frontend directory.

## Summary

### Current State ✅
**ALL 84 authentication tests run successfully WITHOUT any external permissions or credentials.**

The test suite uses comprehensive mocking to eliminate all external dependencies while maintaining high test quality and coverage.

### Future Enhancements (Optional) 🔄
Integration tests with Firebase Emulator or real Firebase would require additional setup but would provide end-to-end validation of authentication flows.

---

**Last Updated:** 2025-11-20
**Test Suite Version:** 84 tests passing
**Permissions Required:** NONE (fully mocked)
