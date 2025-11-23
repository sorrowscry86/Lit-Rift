import React from 'react';
import {
  Container,
  Box,
  AppBar,
  Toolbar,
  Skeleton,
  Tabs,
  Tab,
  Grid,
} from '@mui/material';
import StoryBibleCardSkeleton from './StoryBibleCardSkeleton';

/**
 * StoryBiblePageSkeleton Component
 *
 * Displays a skeleton loading state for the StoryBiblePage with:
 * - AppBar with back button and title
 * - Tabs for navigation
 * - Grid of card skeletons
 */
const StoryBiblePageSkeleton: React.FC = () => {
  return (
    <Box>
      <AppBar position="static" color="default">
        <Toolbar>
          <Skeleton variant="rectangular" width={100} height={36} sx={{ mr: 2, borderRadius: 1 }} />
          <Skeleton variant="text" width={120} sx={{ flexGrow: 1 }} />
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl">
        <Box sx={{ py: 2 }}>
          <Tabs value={0}>
            <Tab label="Characters" />
            <Tab label="Locations" />
            <Tab label="Lore" />
            <Tab label="Plot" />
          </Tabs>

          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Skeleton variant="text" width={150} height={40} />
              <Skeleton variant="rectangular" width={160} height={36} sx={{ borderRadius: 1 }} />
            </Box>

            <Grid container spacing={2}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Grid item xs={12} md={6} lg={4} key={i}>
                  <StoryBibleCardSkeleton variant="character" />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default StoryBiblePageSkeleton;
