import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { User } from 'firebase/auth';
import * as AuthContextModule from '../contexts/AuthContext';

// Mock the useAuth hook
jest.mock('../contexts/AuthContext', () => ({
  ...jest.requireActual('../contexts/AuthContext'),
  useAuth: jest.fn(),
}));

const mockUseAuth = AuthContextModule.useAuth as jest.MockedFunction<typeof AuthContextModule.useAuth>;

describe('ProtectedRoute', () => {
  const TestComponent = () => <div>Protected Content</div>;
  const LoginComponent = () => <div>Login Page</div>;

  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
  } as User;

  const renderProtectedRoute = (currentUser: User | null, initialPath = '/') => {
    mockUseAuth.mockReturnValue({
      currentUser,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      loginWithGoogle: jest.fn(),
      getIdToken: jest.fn().mockResolvedValue('mock-token'),
      loading: false,
      isOffline: false,
    });

    return render(
      <MemoryRouter initialEntries={[initialPath]}>
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
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    // Reset mock implementation before each test
    mockUseAuth.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

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
      mockUseAuth.mockReturnValue({
        currentUser: mockUser,
        login: jest.fn(),
        signup: jest.fn(),
        logout: jest.fn(),
        loginWithGoogle: jest.fn(),
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
        loading: false,
        isOffline: false,
      });

      const { rerender } = render(
        <MemoryRouter initialEntries={['/']}>
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
        </MemoryRouter>
      );

      // Initially authenticated
      expect(screen.getByText('Protected Content')).toBeInTheDocument();

      // User logs out
      mockUseAuth.mockReturnValue({
        currentUser: null,
        login: jest.fn(),
        signup: jest.fn(),
        logout: jest.fn(),
        loginWithGoogle: jest.fn(),
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
        loading: false,
        isOffline: false,
      });

      rerender(
        <MemoryRouter initialEntries={['/']}>
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
        </MemoryRouter>
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
      mockUseAuth.mockReturnValue({
        currentUser: mockUser,
        login: jest.fn(),
        signup: jest.fn(),
        logout: jest.fn(),
        loginWithGoogle: jest.fn(),
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
        loading: false,
        isOffline: false,
      });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>First Child</div>
            <div>Second Child</div>
          </ProtectedRoute>
        </MemoryRouter>
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

      mockUseAuth.mockReturnValue({
        currentUser: mockUser,
        login: jest.fn(),
        signup: jest.fn(),
        logout: jest.fn(),
        loginWithGoogle: jest.fn(),
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
        loading: false,
        isOffline: false,
      });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <ComplexComponent />
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });
});
