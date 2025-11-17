import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  fullPage?: boolean;
}

/**
 * LoadingSpinner component - Reusable loading indicator
 *
 * Features:
 * - Material-UI CircularProgress
 * - Optional loading message
 * - Configurable size
 * - Full-page or inline mode
 *
 * Usage:
 *   <LoadingSpinner /> - Basic spinner
 *   <LoadingSpinner message="Loading projects..." /> - With message
 *   <LoadingSpinner fullPage /> - Full page overlay
 */
export default function LoadingSpinner({
  message = 'Loading...',
  size = 40,
  fullPage = false,
}: LoadingSpinnerProps) {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        ...(fullPage && {
          minHeight: '100vh',
          width: '100%',
        }),
        ...(!fullPage && {
          py: 8,
        }),
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  return content;
}
