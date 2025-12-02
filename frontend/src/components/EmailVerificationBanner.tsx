import React, { useState } from 'react';
import {
  Alert,
  Button,
  Snackbar,
  Box,
} from '@mui/material';
import { sendEmailVerification, User } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';

/**
 * EmailVerificationBanner component
 *
 * Displays a banner when user's email is not verified
 * Allows users to resend verification email
 */
export default function EmailVerificationBanner() {
  const { currentUser, isOffline } = useAuth();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Don't show if no user, email is already verified, or in offline mode
  if (!currentUser || currentUser.emailVerified || isOffline) {
    return null;
  }

  const handleResendVerification = async () => {
    if (!currentUser || isOffline) return;

    try {
      setLoading(true);
      // Only Firebase User has sendEmailVerification method
      await sendEmailVerification(currentUser as User);

      setSnackbar({
        open: true,
        message: 'Verification email sent! Check your inbox and spam folder.',
        severity: 'success',
      });
    } catch (err: any) {
      console.error('Error sending verification email:', err);

      let errorMessage = 'Failed to send verification email. Please try again later.';

      if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Alert
        severity="warning"
        sx={{
          mb: 2,
          borderRadius: 1,
        }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={handleResendVerification}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Resend Email'}
          </Button>
        }
      >
        <Box>
          <strong>Email not verified</strong>
          <br />
          Please verify your email address to access all features. Check your inbox for the verification link.
        </Box>
      </Alert>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
