import React from 'react';
import {
  Container,
  Box,
  AppBar,
  Toolbar,
  Skeleton,
  Tabs,
  Tab,
} from '@mui/material';

/**
 * ProjectPageSkeleton Component
 *
 * Displays a skeleton loading state for the ProjectPage with:
 * - AppBar with navigation buttons
 * - Project title, genre, author, description
 * - Progress stats
 * - Tabs for different sections
 */
const ProjectPageSkeleton: React.FC = () => {
  return (
    <Box>
      <AppBar position="static" color="default">
        <Toolbar>
          <Skeleton variant="rectangular" width={100} height={36} sx={{ mr: 2, borderRadius: 1 }} />
          <Skeleton variant="text" width={200} sx={{ flexGrow: 1 }} />
          <Skeleton variant="rectangular" width={100} height={36} sx={{ mr: 2, borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={120} height={36} sx={{ mr: 1, borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={100} height={36} sx={{ mr: 1, borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={110} height={36} sx={{ borderRadius: 1 }} />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* Project title */}
          <Skeleton variant="text" width="60%" height={48} sx={{ mb: 1 }} />

          {/* Genre and author */}
          <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />

          {/* Description */}
          <Box sx={{ mt: 2 }}>
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="90%" height={20} />
            <Skeleton variant="text" width="70%" height={20} />
          </Box>

          {/* Progress section */}
          <Box sx={{ mt: 4 }}>
            <Skeleton variant="text" width={100} height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={200} height={24} />
          </Box>

          {/* Tabs */}
          <Box sx={{ mt: 4 }}>
            <Tabs value={0}>
              <Tab label="Overview" />
              <Tab label="Scenes" />
              <Tab label="Planning" />
            </Tabs>
          </Box>

          {/* Content area placeholder */}
          <Box sx={{ mt: 3 }}>
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ProjectPageSkeleton;
