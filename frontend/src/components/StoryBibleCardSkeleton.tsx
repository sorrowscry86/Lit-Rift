import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Skeleton,
  Box,
} from '@mui/material';

/**
 * StoryBibleCardSkeleton Component
 *
 * Generic skeleton for StoryBible cards (characters, locations, lore, plot points).
 * Displays loading placeholders for card title, description, and metadata.
 */
interface StoryBibleCardSkeletonProps {
  variant?: 'character' | 'location' | 'lore' | 'plot';
}

const StoryBibleCardSkeleton: React.FC<StoryBibleCardSkeletonProps> = ({ variant = 'character' }) => {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />

        {variant === 'location' && (
          <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
        )}

        {variant === 'lore' && (
          <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
        )}

        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="90%" height={20} />
        <Skeleton variant="text" width="80%" height={20} />

        {variant === 'character' && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" width={65} height={24} sx={{ borderRadius: 2 }} />
          </Box>
        )}

        {variant === 'plot' && (
          <Box sx={{ mt: 2 }}>
            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 2 }} />
          </Box>
        )}
      </CardContent>
      <CardActions>
        <Skeleton variant="text" width={50} height={30} />
        <Skeleton variant="text" width={50} height={30} />
      </CardActions>
    </Card>
  );
};

export default StoryBibleCardSkeleton;
