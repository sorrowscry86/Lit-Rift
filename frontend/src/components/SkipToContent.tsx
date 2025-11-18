import React from 'react';
import { Box } from '@mui/material';

/**
 * SkipToContent Component
 *
 * Provides a skip link for keyboard and screen reader users to bypass navigation
 * and jump directly to main content. This is a WCAG 2.1 Level A requirement.
 *
 * Usage:
 * - Add <SkipToContent /> at the very top of your app
 * - Add id="main-content" to your main content container
 * - The link is visually hidden until focused with Tab key
 */
export default function SkipToContent() {
  return (
    <Box
      component="a"
      href="#main-content"
      sx={{
        position: 'absolute',
        left: '-9999px',
        zIndex: 9999,
        padding: '1rem',
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        textDecoration: 'none',
        borderRadius: '0 0 4px 0',
        fontWeight: 600,
        '&:focus': {
          left: 0,
          top: 0,
        },
      }}
    >
      Skip to main content
    </Box>
  );
}
