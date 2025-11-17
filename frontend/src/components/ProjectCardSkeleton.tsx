import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Skeleton,
  Box,
} from '@mui/material';

/**
 * ProjectCardSkeleton component - Loading skeleton for project cards
 *
 * Features:
 * - Matches ProjectCard layout
 * - Animated loading effect
 * - Material-UI Skeleton components
 * - Improves perceived performance
 *
 * Usage:
 *   <Grid item xs={12} md={6} lg={4}>
 *     <ProjectCardSkeleton />
 *   </Grid>
 */
export default function ProjectCardSkeleton() {
  return (
    <Card>
      <CardContent>
        {/* Project title */}
        <Skeleton variant="text" width="80%" height={40} sx={{ mb: 1 }} />

        {/* Genre and author */}
        <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />

        {/* Description */}
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="90%" height={20} />

        {/* Word count */}
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="text" width="40%" height={20} />
        </Box>
      </CardContent>
      <CardActions>
        {/* Open button */}
        <Skeleton variant="rectangular" width={60} height={30} sx={{ borderRadius: 1 }} />
      </CardActions>
    </Card>
  );
}
