/**
 * Test utilities for React Testing Library
 *
 * Provides custom render functions and utilities for testing
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Create a test theme
const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

/**
 * Custom render function that includes common providers
 */
interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );
};

/**
 * Custom render with all providers
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

/**
 * Custom render with Auth provider
 * Note: Use this sparingly as Firebase can be tricky in test environments
 * For most tests, mock auth state instead
 */
const renderWithAuth = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // For now, this is the same as customRender
  // AuthProvider requires Firebase which has issues in Jest environment
  // Tests that need auth should mock the auth context instead
  return customRender(ui, options);
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render, renderWithAuth };

/**
 * Mock IntersectionObserver for LazyImage tests
 */
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver as any;
};

/**
 * Trigger IntersectionObserver callback
 */
export const triggerIntersection = (element: Element, isIntersecting: boolean = true) => {
  const mockIntersectionObserverInstance = (window.IntersectionObserver as any).mock.results[0]?.value;
  if (mockIntersectionObserverInstance) {
    const callback = (window.IntersectionObserver as any).mock.calls[0][0];
    callback([
      {
        target: element,
        isIntersecting,
        intersectionRatio: isIntersecting ? 1 : 0,
      },
    ]);
  }
};

/**
 * Wait for async updates
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Mock Firebase auth for testing
 */
export const mockFirebaseAuth = () => {
  return {
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
  };
};

/**
 * Create mock user
 */
export const createMockUser = (overrides = {}) => ({
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  ...overrides,
});

/**
 * Suppress console errors in tests
 */
export const suppressConsoleError = () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });
};

/**
 * Mock axios for API tests
 */
export const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
};
