import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import App from './App';
import { AuthContext } from './contexts/AuthContext';

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

// Mock lazy loaded components to avoid Suspense issues
jest.mock('./pages/LoginPage', () => {
  return function MockLoginPage() {
    return <div data-testid="login-page">Login Page</div>;
  };
});

jest.mock('./pages/SignupPage', () => {
  return function MockSignupPage() {
    return <div data-testid="signup-page">Signup Page</div>;
  };
});

jest.mock('./pages/PasswordResetPage', () => {
  return function MockPasswordResetPage() {
    return <div data-testid="password-reset-page">Password Reset Page</div>;
  };
});

jest.mock('./pages/HomePage', () => {
  return function MockHomePage() {
    return <div data-testid="home-page">Home Page</div>;
  };
});

test('renders app without crashing', async () => {
  await act(async () => {
    render(<App />);
  });
  
  // Wait for the app to fully render
  await waitFor(() => {
    // The app renders a main content box with id "main-content"
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
  });
});
