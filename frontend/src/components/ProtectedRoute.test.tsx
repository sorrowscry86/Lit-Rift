import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthContext } from '../contexts/AuthContext';
import { User } from 'firebase/auth';

describe('ProtectedRoute', () => {
  const TestComponent = () => <div>Protected Content</div>;
  const LoginComponent = () => <div>Login Page</div>;

  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
  } as User;

  const renderProtectedRoute = (currentUser: User | null) => {
    const authContextValue = {
      currentUser,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      loginWithGoogle: jest.fn(),
      resetPassword: jest.fn(),
      loading: false,
    };

    return render(
      <BrowserRouter>
        <AuthContext.Provider value={authContextValue}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <TestComponent />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginComponent />} />
          </Routes>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  describe('Authentication Flow', () => {
    test('renders children when user is authenticated', () => {
      renderProtectedRoute(mockUser);

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    test('redirects to login when user is not authenticated', () => {
      renderProtectedRoute(null);

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    test('redirects to login with replace flag', () => {
      // This test verifies that the Navigate component uses replace
      // We can't directly test the replace prop, but we can verify the redirect happens
      renderProtectedRoute(null);

      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  describe('Different User States', () => {
    test('handles authenticated user with minimal profile', () => {
      const minimalUser = {
        uid: 'test-uid',
        email: null,
        displayName: null,
      } as User;

      renderProtectedRoute(minimalUser);

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    test('handles authenticated user with full profile', () => {
      const fullUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        emailVerified: true,
      } as User;

      renderProtectedRoute(fullUser);

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    test('redirects when currentUser becomes null', () => {
      const { rerender } = render(
        <BrowserRouter>
          <AuthContext.Provider
            value={{
              currentUser: mockUser,
              login: jest.fn(),
              signup: jest.fn(),
              logout: jest.fn(),
              loginWithGoogle: jest.fn(),
              resetPassword: jest.fn(),
              loading: false,
            }}
          >
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <TestComponent />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<LoginComponent />} />
            </Routes>
          </AuthContext.Provider>
        </BrowserRouter>
      );

      // Initially authenticated
      expect(screen.getByText('Protected Content')).toBeInTheDocument();

      // User logs out
      rerender(
        <BrowserRouter>
          <AuthContext.Provider
            value={{
              currentUser: null,
              login: jest.fn(),
              signup: jest.fn(),
              logout: jest.fn(),
              loginWithGoogle: jest.fn(),
              resetPassword: jest.fn(),
              loading: false,
            }}
          >
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <TestComponent />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<LoginComponent />} />
            </Routes>
          </AuthContext.Provider>
        </BrowserRouter>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Children Rendering', () => {
    test('renders single child component', () => {
      renderProtectedRoute(mockUser);

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    test('renders multiple children', () => {
      const authContextValue = {
        currentUser: mockUser,
        login: jest.fn(),
        signup: jest.fn(),
        logout: jest.fn(),
        loginWithGoogle: jest.fn(),
        resetPassword: jest.fn(),
        loading: false,
      };

      render(
        <BrowserRouter>
          <AuthContext.Provider value={authContextValue}>
            <ProtectedRoute>
              <div>First Child</div>
              <div>Second Child</div>
            </ProtectedRoute>
          </AuthContext.Provider>
        </BrowserRouter>
      );

      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
    });

    test('renders complex nested components', () => {
      const ComplexComponent = () => (
        <div>
          <h1>Title</h1>
          <p>Paragraph</p>
          <button>Action</button>
        </div>
      );

      const authContextValue = {
        currentUser: mockUser,
        login: jest.fn(),
        signup: jest.fn(),
        logout: jest.fn(),
        loginWithGoogle: jest.fn(),
        resetPassword: jest.fn(),
        loading: false,
      };

      render(
        <BrowserRouter>
          <AuthContext.Provider value={authContextValue}>
            <ProtectedRoute>
              <ComplexComponent />
            </ProtectedRoute>
          </AuthContext.Provider>
        </BrowserRouter>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });
});
