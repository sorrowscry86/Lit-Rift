import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

/**
 * ErrorFallback component - Beautiful error UI for ErrorBoundary
 *
 * Features:
 * - Material-UI styled error page
 * - "Go Home" and "Try Again" buttons
 * - Shows error details in development
 * - User-friendly messaging
 */
export default function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
    if (resetError) {
      resetError();
    }
  };

  const handleTryAgain = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            width: '100%',
          }}
        >
          <ErrorOutlineIcon
            sx={{
              fontSize: 80,
              color: 'error.main',
              mb: 2,
            }}
          />

          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Oops! Something went wrong
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            We encountered an unexpected error. Don't worry, your data is safe.
            Please try refreshing the page or going back to the home page.
          </Typography>

          {process.env.NODE_ENV === 'development' && error && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                textAlign: 'left',
                backgroundColor: 'background.default',
              }}
            >
              <Typography variant="caption" component="div" sx={{ mb: 1, fontWeight: 600 }}>
                Error Details (Development Only):
              </Typography>
              <Typography
                variant="caption"
                component="pre"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: 'error.main',
                }}
              >
                {error.toString()}
              </Typography>
            </Paper>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              size="large"
            >
              Go Home
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleTryAgain}
              size="large"
            >
              Try Again
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
