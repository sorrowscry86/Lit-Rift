import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthContext } from '../contexts/AuthContext';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('LoginPage', () => {
  const mockLogin = jest.fn();
  const mockLoginWithGoogle = jest.fn();

  const renderLoginPage = () => {
    const authContextValue = {
      currentUser: null,
      login: mockLogin,
      signup: jest.fn(),
      logout: jest.fn(),
      loginWithGoogle: mockLoginWithGoogle,
      getIdToken: jest.fn().mockResolvedValue(null),
      loading: false,
      isOffline: false,
    };

    return render(
      <BrowserRouter>
        <AuthContext.Provider value={authContextValue}>
          <LoginPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders login form with all elements', () => {
      renderLoginPage();

      expect(screen.getByText('Lit-Rift')).toBeInTheDocument();
      expect(screen.getByText('AI-Powered Novel Writing')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    });

    test('renders links to signup and password reset', () => {
      renderLoginPage();

      expect(screen.getByText(/don't have an account\? sign up/i)).toBeInTheDocument();
      expect(screen.getByText(/forgot password\?/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('shows error when fields are empty', async () => {
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });

    test('shows error for invalid email format', async () => {
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });

    test('accepts valid email format', async () => {
      mockLogin.mockResolvedValue({});
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });
  });

  describe('Email/Password Login', () => {
    test('successfully logs in with valid credentials', async () => {
      mockLogin.mockResolvedValue({});
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    test('handles user-not-found error', async () => {
      mockLogin.mockRejectedValue({ code: 'auth/user-not-found' });
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('No account found with this email')).toBeInTheDocument();
      });
    });

    test('handles wrong-password error', async () => {
      mockLogin.mockRejectedValue({ code: 'auth/wrong-password' });
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Incorrect password')).toBeInTheDocument();
      });
    });

    test('handles invalid-email error from Firebase', async () => {
      mockLogin.mockRejectedValue({ code: 'auth/invalid-email' });
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Use valid-looking email that Firebase will reject
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });
    });

    test('handles user-disabled error', async () => {
      mockLogin.mockRejectedValue({ code: 'auth/user-disabled' });
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('This account has been disabled')).toBeInTheDocument();
      });
    });

    test('handles too-many-requests error', async () => {
      mockLogin.mockRejectedValue({ code: 'auth/too-many-requests' });
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Too many failed login attempts. Please try again later')).toBeInTheDocument();
      });
    });

    test('handles generic error', async () => {
      mockLogin.mockRejectedValue({ code: 'auth/unknown-error' });
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to log in. Please check your credentials and try again')).toBeInTheDocument();
      });
    });

    test('disables form during submission', async () => {
      mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Check that inputs are disabled during loading
      expect(emailInput.disabled).toBe(true);
      expect(passwordInput.disabled).toBe(true);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    });
  });

  describe('Google Login', () => {
    test('successfully logs in with Google', async () => {
      mockLoginWithGoogle.mockResolvedValue({});
      renderLoginPage();

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockLoginWithGoogle).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    test('handles popup-closed-by-user error', async () => {
      mockLoginWithGoogle.mockRejectedValue({ code: 'auth/popup-closed-by-user' });
      renderLoginPage();

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText('Login cancelled')).toBeInTheDocument();
      });
    });

    test('handles popup-blocked error', async () => {
      mockLoginWithGoogle.mockRejectedValue({ code: 'auth/popup-blocked' });
      renderLoginPage();

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText('Please allow popups for this site to use Google login')).toBeInTheDocument();
      });
    });

    test('handles generic Google login error', async () => {
      mockLoginWithGoogle.mockRejectedValue({ code: 'auth/unknown-error' });
      renderLoginPage();

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to log in with Google. Please try again')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('shows loading spinner during email login', async () => {
      mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Should show loading spinner
      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });

    test('clears error when new submission starts', async () => {
      mockLogin.mockRejectedValueOnce({ code: 'auth/wrong-password' });
      mockLogin.mockResolvedValueOnce({});

      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // First attempt - wrong password
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Incorrect password')).toBeInTheDocument();
      });

      // Second attempt - correct password
      fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Incorrect password')).not.toBeInTheDocument();
      });
    });
  });
});
