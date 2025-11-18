import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PasswordResetPage from './PasswordResetPage';
import { sendPasswordResetEmail } from 'firebase/auth';

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  sendPasswordResetEmail: jest.fn(),
}));

// Mock firebase config
jest.mock('../config/firebase', () => ({
  auth: {},
}));

const mockSendPasswordResetEmail = sendPasswordResetEmail as jest.MockedFunction<typeof sendPasswordResetEmail>;

describe('PasswordResetPage', () => {
  const renderPasswordResetPage = () => {
    return render(
      <BrowserRouter>
        <PasswordResetPage />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders password reset form with all elements', () => {
      renderPasswordResetPage();

      expect(screen.getByText('Lit-Rift')).toBeInTheDocument();
      expect(screen.getByText('AI-Powered Novel Writing')).toBeInTheDocument();
      expect(screen.getByText('Reset Password')).toBeInTheDocument();
      expect(screen.getByText(/enter your email address and we'll send you a link/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });

    test('renders back to login link', () => {
      renderPasswordResetPage();

      expect(screen.getByText(/back to login/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('shows error when email field is empty', async () => {
      renderPasswordResetPage();

      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter your email address')).toBeInTheDocument();
      });

      expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
    });

    test('shows error for invalid email format', async () => {
      renderPasswordResetPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });

      expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
    });

    test('accepts valid email format', async () => {
      mockSendPasswordResetEmail.mockResolvedValue();
      renderPasswordResetPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSendPasswordResetEmail).toHaveBeenCalled();
      });
    });
  });

  describe('Password Reset Flow', () => {
    test('successfully sends password reset email', async () => {
      mockSendPasswordResetEmail.mockResolvedValue();
      renderPasswordResetPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSendPasswordResetEmail).toHaveBeenCalled();
        expect(screen.getByText(/password reset email sent! check your inbox and spam folder/i)).toBeInTheDocument();
      });

      // Email field should be cleared on success
      expect(emailInput).toHaveValue('');
    });

    test('handles user-not-found error', async () => {
      mockSendPasswordResetEmail.mockRejectedValue({ code: 'auth/user-not-found' });
      renderPasswordResetPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('No account found with this email address')).toBeInTheDocument();
      });
    });

    test('handles invalid-email error from Firebase', async () => {
      mockSendPasswordResetEmail.mockRejectedValue({ code: 'auth/invalid-email' });
      renderPasswordResetPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      // Use a valid-looking email that Firebase will reject
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });
    });

    test('handles too-many-requests error', async () => {
      mockSendPasswordResetEmail.mockRejectedValue({ code: 'auth/too-many-requests' });
      renderPasswordResetPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Too many password reset attempts. Please try again later')).toBeInTheDocument();
      });
    });

    test('handles generic error', async () => {
      mockSendPasswordResetEmail.mockRejectedValue({ code: 'auth/unknown-error' });
      renderPasswordResetPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to send password reset email. Please try again')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('disables form during submission', async () => {
      mockSendPasswordResetEmail.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      renderPasswordResetPage();

      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      // Check that input is disabled during loading
      expect(emailInput.disabled).toBe(true);

      await waitFor(() => {
        expect(mockSendPasswordResetEmail).toHaveBeenCalled();
      });
    });

    test('shows loading spinner during submission', async () => {
      mockSendPasswordResetEmail.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      renderPasswordResetPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      // Should show loading spinner
      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Submissions', () => {
    test('can send multiple reset emails', async () => {
      mockSendPasswordResetEmail.mockResolvedValue();
      renderPasswordResetPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      // First submission
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password reset email sent/i)).toBeInTheDocument();
      });

      // Second submission
      fireEvent.change(emailInput, { target: { value: 'another@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSendPasswordResetEmail).toHaveBeenCalledTimes(2);
      });
    });

    test('clears success message when error occurs', async () => {
      mockSendPasswordResetEmail.mockResolvedValueOnce();
      mockSendPasswordResetEmail.mockRejectedValueOnce({ code: 'auth/user-not-found' });

      renderPasswordResetPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      // First submission - success
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password reset email sent/i)).toBeInTheDocument();
      });

      // Second submission - error
      fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/password reset email sent/i)).not.toBeInTheDocument();
        expect(screen.getByText('No account found with this email address')).toBeInTheDocument();
      });
    });

    test('clears error when new submission succeeds', async () => {
      mockSendPasswordResetEmail.mockRejectedValueOnce({ code: 'auth/user-not-found' });
      mockSendPasswordResetEmail.mockResolvedValueOnce();

      renderPasswordResetPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      // First submission - error
      fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('No account found with this email address')).toBeInTheDocument();
      });

      // Second submission - success
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('No account found with this email address')).not.toBeInTheDocument();
        expect(screen.getByText(/password reset email sent/i)).toBeInTheDocument();
      });
    });
  });
});
