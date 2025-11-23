import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthContext } from './contexts/AuthContext';

// Mock AuthProvider to avoid loading state issue
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthContext.Provider value={{
      currentUser: null,
      loading: false,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      loginWithGoogle: jest.fn(),
      getIdToken: jest.fn()
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// We need to mock the real AuthProvider used in App.tsx
jest.mock('./contexts/AuthContext', () => ({
  ...jest.requireActual('./contexts/AuthContext'),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider-mock">{children}</div>
  ),
  useAuth: () => ({
    currentUser: null,
    loading: false
  })
}));

test('renders app without crashing', () => {
  render(<App />);
  // The app renders a main content box with id "main-content"
  // and a SkipToContent link.
  const mainElement = screen.getByRole('main');
  expect(mainElement).toBeInTheDocument();
});
