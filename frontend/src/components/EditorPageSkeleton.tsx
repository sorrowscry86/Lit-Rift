import React from 'react';
import {
  Container,
  Box,
  Paper,
  AppBar,
  Toolbar,
  Grid,
  Skeleton,
} from '@mui/material';

/**
 * EditorPageSkeleton Component
 *
 * Displays a skeleton loading state for the EditorPage with three panels:
 * - Sidebar with scene list placeholders
 * - Main editor area with title and content placeholders
 * - AI Assistant panel with form placeholders
 */
const EditorPageSkeleton: React.FC = () => {
  return (
    <Box>
      <AppBar position="static" color="default">
        <Toolbar>
          <Skeleton variant="rectangular" width={100} height={36} sx={{ mr: 2, borderRadius: 1 }} />
          <Skeleton variant="text" width={100} sx={{ flexGrow: 1 }} />
          <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl">
        <Grid container spacing={2} sx={{ py: 2, height: 'calc(100vh - 64px)' }}>
          {/* Sidebar Skeleton */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Skeleton variant="text" width={80} height={32} />
                <Skeleton variant="rectangular" width={60} height={30} sx={{ borderRadius: 1 }} />
              </Box>

              {/* Scene list skeletons */}
              {[1, 2, 3, 4, 5].map((i) => (
                <Box
                  key={i}
                  sx={{
                    p: 1,
                    mb: 1,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="text" width="40%" height={16} />
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Main Editor Skeleton */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2, borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="100%" height="calc(100% - 100px)" sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width={100} height={20} sx={{ mt: 1 }} />
            </Paper>
          </Grid>

          {/* AI Assistant Panel Skeleton */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
              <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Skeleton variant="text" width={80} height={20} sx={{ mb: 1 }} />
                <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                  <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 2 }} />
                </Box>
              </Box>

              <Skeleton variant="rectangular" width="100%" height={90} sx={{ mb: 2, borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2, borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2, borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="100%" height={36} sx={{ borderRadius: 1 }} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default EditorPageSkeleton;
