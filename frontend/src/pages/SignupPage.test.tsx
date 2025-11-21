import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignupPage from './SignupPage';
import { AuthContext } from '../contexts/AuthContext';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('SignupPage', () => {
  const mockSignup = jest.fn();
  const mockLoginWithGoogle = jest.fn();

  const renderSignupPage = () => {
    const authContextValue = {
      currentUser: null,
      login: jest.fn(),
      signup: mockSignup,
      logout: jest.fn(),
      loginWithGoogle: mockLoginWithGoogle,
      getIdToken: jest.fn().mockResolvedValue(null),
      loading: false,
    };

    return render(
      <BrowserRouter>
        <AuthContext.Provider value={authContextValue}>
          <SignupPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders signup form with all elements', () => {
      renderSignupPage();

      expect(screen.getByText('Lit-Rift')).toBeInTheDocument();
      expect(screen.getByText('AI-Powered Novel Writing')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      // Password input exists (using getElementById since label text includes asterisk)
      expect(document.querySelector('#password')).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    });

    test('renders link to login page', () => {
      renderSignupPage();

      expect(screen.getByText(/already have an account\? sign in/i)).toBeInTheDocument();
    });

    test('shows password helper text', () => {
      renderSignupPage();

      expect(screen.getByText('At least 6 characters')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('shows error when fields are empty', async () => {
      renderSignupPage();

      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
      });

      expect(mockSignup).not.toHaveBeenCalled();
    });

    test('shows error for invalid email format', async () => {
      renderSignupPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = document.querySelector('#password') as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });

      expect(mockSignup).not.toHaveBeenCalled();
    });

    test('shows error when password is too short', async () => {
      renderSignupPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = document.querySelector('#password') as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: '12345' } });
      fireEvent.change(confirmPasswordInput, { target: { value: '12345' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument();
      });

      expect(mockSignup).not.toHaveBeenCalled();
    });

    test('shows error when passwords do not match', async () => {
      renderSignupPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = document.querySelector('#password') as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });

      expect(mockSignup).not.toHaveBeenCalled();
    });

    test('accepts valid form data', async () => {
      mockSignup.mockResolvedValue({});
      renderSignupPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = document.querySelector('#password') as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });
  });

  describe('Email/Password Signup', () => {
    test('successfully creates account with valid credentials', async () => {
      mockSignup.mockResolvedValue({});
      renderSignupPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = document.querySelector('#password') as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    test('handles email-already-in-use error', async () => {
      mockSignup.mockRejectedValue({ code: 'auth/email-already-in-use' });
      renderSignupPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = document.querySelector('#password') as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('An account with this email already exists')).toBeInTheDocument();
      });
    });

    test('handles invalid-email error from Firebase', async () => {
      mockSignup.mockRejectedValue({ code: 'auth/invalid-email' });
      renderSignupPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = document.querySelector('#password') as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      // Use valid-looking email that Firebase will reject
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });
    });

    test('handles weak-password error', async () => {
      mockSignup.mockRejectedValue({ code: 'auth/weak-password' });
      renderSignupPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = document.querySelector('#password') as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      // Use a password that passes local validation (6+ chars) but Firebase considers weak
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'weakpw' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'weakpw' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password is too weak. Please use at least 6 characters')).toBeInTheDocument();
      });
    });

    test('handles operation-not-allowed error', async () => {
      mockSignup.mockRejectedValue({ code: 'auth/operation-not-allowed' });
      renderSignupPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = document.querySelector('#password') as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email/password accounts are not enabled. Please contact support')).toBeInTheDocument();
      });
    });

    test('handles generic error', async () => {
      mockSignup.mockRejectedValue({ code: 'auth/unknown-error' });
      renderSignupPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = document.querySelector('#password') as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to create account. Please try again')).toBeInTheDocument();
      });
    });
  });

  describe('Google Signup', () => {
    test('successfully signs up with Google', async () => {
      mockLoginWithGoogle.mockResolvedValue({});
      renderSignupPage();

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockLoginWithGoogle).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    test('handles popup-closed-by-user error', async () => {
      mockLoginWithGoogle.mockRejectedValue({ code: 'auth/popup-closed-by-user' });
      renderSignupPage();

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText('Signup cancelled')).toBeInTheDocument();
      });
    });

    test('handles popup-blocked error', async () => {
      mockLoginWithGoogle.mockRejectedValue({ code: 'auth/popup-blocked' });
      renderSignupPage();

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText('Please allow popups for this site to use Google signup')).toBeInTheDocument();
      });
    });

    test('handles account-exists-with-different-credential error', async () => {
      mockLoginWithGoogle.mockRejectedValue({ code: 'auth/account-exists-with-different-credential' });
      renderSignupPage();

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText('An account already exists with this email using a different sign-in method')).toBeInTheDocument();
      });
    });

    test('handles generic Google signup error', async () => {
      mockLoginWithGoogle.mockRejectedValue({ code: 'auth/unknown-error' });
      renderSignupPage();

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to sign up with Google. Please try again')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('disables form during submission', async () => {
      mockSignup.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      renderSignupPage();

      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      const passwordInput = document.querySelector('#password') as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Check that inputs are disabled during loading
      expect(emailInput.disabled).toBe(true);
      expect(passwordInput.disabled).toBe(true);
      expect(confirmPasswordInput.disabled).toBe(true);

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalled();
      });
    });

    test('shows loading spinner during signup', async () => {
      mockSignup.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      renderSignupPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = document.querySelector('#password') as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Should show loading spinner
      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });
  });
});
