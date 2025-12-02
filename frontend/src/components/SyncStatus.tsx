import React from 'react';
import {
  Box,
  CircularProgress,
  Tooltip,
  Badge,
  IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import WarningIcon from '@mui/icons-material/Warning';
import CloudOffIcon from '@mui/icons-material/CloudOff';

type SyncStatusType = 'synced' | 'syncing' | 'conflict' | 'offline';

interface SyncStatusProps {
  status: SyncStatusType;
  conflictCount?: number;
  onShowConflicts?: () => void;
}

export function SyncStatus({ status, conflictCount = 0, onShowConflicts }: SyncStatusProps) {
  if (status === 'synced') {
    return (
      <Tooltip title="All changes synced">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon sx={{ color: 'success.main', fontSize: '1.2rem' }} />
          <span style={{ fontSize: '0.85rem', color: '#666' }}>Synced</span>
        </Box>
      </Tooltip>
    );
  }

  if (status === 'syncing') {
    return (
      <Tooltip title="Syncing changes...">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <span style={{ fontSize: '0.85rem', color: '#666' }}>Syncing...</span>
        </Box>
      </Tooltip>
    );
  }

  if (status === 'conflict') {
    return (
      <Tooltip title={`${conflictCount} document(s) need resolution`}>
        <Badge badgeContent={conflictCount} color="error">
          <IconButton
            size="small"
            onClick={onShowConflicts}
            sx={{ color: 'warning.main' }}
          >
            <WarningIcon fontSize="small" />
          </IconButton>
        </Badge>
      </Tooltip>
    );
  }

  if (status === 'offline') {
    return (
      <Tooltip title="Offline mode - changes will sync when online">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudOffIcon sx={{ color: 'info.main', fontSize: '1.2rem' }} />
          <span style={{ fontSize: '0.85rem', color: '#666' }}>Offline</span>
        </Box>
      </Tooltip>
    );
  }

  return null;
}
