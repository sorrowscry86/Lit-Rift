import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as firebaseAuth from 'firebase/auth';
import * as sentry from '../config/sentry';

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
  sendEmailVerification: jest.fn(),
}));

// Mock Firebase config
jest.mock('../config/firebase', () => ({
  auth: {},
  isOfflineMode: false,
}));

// Mock Sentry
jest.mock('../config/sentry', () => ({
  setSentryUser: jest.fn(),
  clearSentryUser: jest.fn(),
}));

describe('AuthContext', () => {
  const mockSignInWithEmailAndPassword = firebaseAuth.signInWithEmailAndPassword as jest.MockedFunction<
    typeof firebaseAuth.signInWithEmailAndPassword
  >;
  const mockCreateUserWithEmailAndPassword = firebaseAuth.createUserWithEmailAndPassword as jest.MockedFunction<
    typeof firebaseAuth.createUserWithEmailAndPassword
  >;
  const mockSignOut = firebaseAuth.signOut as jest.MockedFunction<typeof firebaseAuth.signOut>;
  const mockOnAuthStateChanged = firebaseAuth.onAuthStateChanged as jest.MockedFunction<
    typeof firebaseAuth.onAuthStateChanged
  >;
  const mockSignInWithPopup = firebaseAuth.signInWithPopup as jest.MockedFunction<
    typeof firebaseAuth.signInWithPopup
  >;
  const mockSendEmailVerification = firebaseAuth.sendEmailVerification as jest.MockedFunction<
    typeof firebaseAuth.sendEmailVerification
  >;
  const mockSetSentryUser = sentry.setSentryUser as jest.MockedFunction<typeof sentry.setSentryUser>;
  const mockClearSentryUser = sentry.clearSentryUser as jest.MockedFunction<typeof sentry.clearSentryUser>;

  const mockUser = {
    uid: 'test-uid-123',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true,
    getIdToken: jest.fn().mockResolvedValue('mock-token-abc123'),
} as unknown as firebaseAuth.User;

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for onAuthStateChanged - no user logged in
    mockOnAuthStateChanged.mockImplementation((auth, callback: any) => {
      if (typeof callback === 'function') {
        callback(null);
      }
      return jest.fn(); // unsubscribe function
    });
  });

  // Test component to access AuthContext
  const TestComponent = ({ onRender }: { onRender?: (context: any) => void }) => {
    const context = useAuth();

    React.useEffect(() => {
      if (onRender) {
        onRender(context);
      }
    }, [context, onRender]);

    return (
      <div>
        <div data-testid="current-user">{context.currentUser?.email || 'null'}</div>
        <div data-testid="loading">{context.loading ? 'true' : 'false'}</div>
      </div>
    );
  };

  describe('Provider Initialization', () => {
    test('provides auth context to children', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('current-user')).toHaveTextContent('null');
    });

    test('throws error when useAuth is used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      console.error = originalError;
    });

    test('sets loading to false after auth state is determined', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });
  });

  describe('Authentication State', () => {
    test('updates currentUser when auth state changes to logged in', async () => {
      let authCallback: any;
      mockOnAuthStateChanged.mockImplementation((auth, callback: any) => {
        authCallback = callback;
        callback(null); // Initially no user
        return jest.fn();
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Initially no user
      expect(screen.getByTestId('current-user')).toHaveTextContent('null');

      // Simulate user login
      act(() => {
        authCallback(mockUser);
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-user')).toHaveTextContent('test@example.com');
      });
    });

    test('updates currentUser when auth state changes to logged out', async () => {
      let authCallback: any;
      mockOnAuthStateChanged.mockImplementation((auth, callback: any) => {
        authCallback = callback;
        callback(mockUser); // Initially logged in
        return jest.fn();
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-user')).toHaveTextContent('test@example.com');
      });

      // Simulate user logout
      act(() => {
        authCallback(null);
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-user')).toHaveTextContent('null');
      });
    });

    test('sets Sentry user context when user logs in', async () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback: any) => {
        callback(mockUser);
        return jest.fn();
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockSetSentryUser).toHaveBeenCalledWith({
          id: 'test-uid-123',
          email: 'test@example.com',
          username: 'Test User',
        });
      });
    });

    test('clears Sentry user context when user logs out', async () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback: any) => {
        callback(null);
        return jest.fn();
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockClearSentryUser).toHaveBeenCalled();
      });
    });
  });

  describe('Login Function', () => {
    test('successfully logs in with email and password', async () => {
      mockSignInWithEmailAndPassword.mockResolvedValue({} as any);

      let capturedContext: any;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (capturedContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => expect(capturedContext).toBeDefined());

      await act(async () => {
        await capturedContext.login('test@example.com', 'password123');
      });

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith({}, 'test@example.com', 'password123');
    });

    test('throws error on failed login', async () => {
      const error = new Error('Invalid credentials');
      mockSignInWithEmailAndPassword.mockRejectedValue(error);

      let capturedContext: any;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (capturedContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => expect(capturedContext).toBeDefined());

      await expect(capturedContext.login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('Signup Function', () => {
    test('successfully signs up with email and password', async () => {
      const userCredential = {
        user: mockUser,
      };
      mockCreateUserWithEmailAndPassword.mockResolvedValue(userCredential as any);
      mockSendEmailVerification.mockResolvedValue();

      let capturedContext: any;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (capturedContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => expect(capturedContext).toBeDefined());

      await act(async () => {
        await capturedContext.signup('newuser@example.com', 'password123');
      });

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith({}, 'newuser@example.com', 'password123');
      expect(mockSendEmailVerification).toHaveBeenCalledWith(mockUser);
    });

    test('continues signup even if email verification fails', async () => {
      const userCredential = {
        user: mockUser,
      };
      mockCreateUserWithEmailAndPassword.mockResolvedValue(userCredential as any);
      mockSendEmailVerification.mockRejectedValue(new Error('Email service error'));

      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      let capturedContext: any;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (capturedContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => expect(capturedContext).toBeDefined());

      // Should not throw even if verification fails
      await act(async () => {
        await capturedContext.signup('newuser@example.com', 'password123');
      });

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error sending verification email:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    test('throws error on failed signup', async () => {
      const error = new Error('Email already in use');
      mockCreateUserWithEmailAndPassword.mockRejectedValue(error);

      let capturedContext: any;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (capturedContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => expect(capturedContext).toBeDefined());

      await expect(capturedContext.signup('existing@example.com', 'password123')).rejects.toThrow(
        'Email already in use'
      );
    });
  });

  describe('Logout Function', () => {
    test('successfully logs out', async () => {
      mockSignOut.mockResolvedValue();

      let capturedContext: any;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (capturedContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => expect(capturedContext).toBeDefined());

      await act(async () => {
        await capturedContext.logout();
      });

      expect(mockSignOut).toHaveBeenCalledWith({});
    });

    test('throws error on failed logout', async () => {
      const error = new Error('Logout failed');
      mockSignOut.mockRejectedValue(error);

      let capturedContext: any;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (capturedContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => expect(capturedContext).toBeDefined());

      await expect(capturedContext.logout()).rejects.toThrow('Logout failed');
    });
  });

  describe('Google Login Function', () => {
    test('successfully logs in with Google', async () => {
      mockSignInWithPopup.mockResolvedValue({} as any);

      let capturedContext: any;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (capturedContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => expect(capturedContext).toBeDefined());

      await act(async () => {
        await capturedContext.loginWithGoogle();
      });

      expect(mockSignInWithPopup).toHaveBeenCalledWith({}, expect.any(Object));
    });

    test('throws error on failed Google login', async () => {
      const error = new Error('Popup closed');
      mockSignInWithPopup.mockRejectedValue(error);

      let capturedContext: any;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (capturedContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => expect(capturedContext).toBeDefined());

      await expect(capturedContext.loginWithGoogle()).rejects.toThrow('Popup closed');
    });
  });

  describe('Get ID Token Function', () => {
    test('getIdToken function is available in context', async () => {
      let capturedContext: any;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (capturedContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => expect(capturedContext).toBeDefined());

      // Verify getIdToken function exists
      expect(typeof capturedContext.getIdToken).toBe('function');
    });

    test('returns null when user is not logged in', async () => {
      let capturedContext: any;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (capturedContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => expect(capturedContext).toBeDefined());

      const token = await capturedContext.getIdToken();

      expect(token).toBeNull();
    });

    test('returns null and logs error when getIdToken fails', async () => {
      const mockUserWithFailingToken = {
        ...mockUser,
        getIdToken: jest.fn().mockRejectedValue(new Error('Token expired')),
      };

      mockOnAuthStateChanged.mockImplementation((auth, callback: any) => {
        callback(mockUserWithFailingToken);
        return jest.fn();
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      let capturedContext: any;
      render(
        <AuthProvider>
          <TestComponent onRender={(ctx) => (capturedContext = ctx)} />
        </AuthProvider>
      );

      await waitFor(() => expect(capturedContext).toBeDefined());
      await waitFor(() => expect(capturedContext.currentUser).not.toBeNull());

      const token = await capturedContext.getIdToken();

      expect(token).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting ID token:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Cleanup', () => {
    test('unsubscribes from auth state changes on unmount', () => {
      const unsubscribeMock = jest.fn();
      mockOnAuthStateChanged.mockReturnValue(unsubscribeMock);

      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });
});
