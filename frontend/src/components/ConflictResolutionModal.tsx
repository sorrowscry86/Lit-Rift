import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Card,
  Typography,
  Stack,
  Chip
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SaveIcon from '@mui/icons-material/Save';

interface Conflict {
  id: number;
  document_id: string;
  local_version: number;
  cloud_version: number;
  local_device_id: string;
  cloud_device_id: string;
  local_timestamp: string;
  cloud_timestamp: string;
  local_preview?: string;
  cloud_preview?: string;
}

interface ConflictResolutionModalProps {
  conflict: Conflict | null;
  onResolve: (conflictId: number, choice: 'local' | 'cloud') => Promise<void>;
  open: boolean;
  onClose?: () => void;
}

export function ConflictResolutionModal({
  conflict,
  onResolve,
  open,
  onClose
}: ConflictResolutionModalProps) {
  const [loading, setLoading] = useState(false);

  if (!conflict) return null;

  const handleResolve = async (choice: 'local' | 'cloud') => {
    setLoading(true);
    try {
      await onResolve(conflict.id, choice);
      if (onClose) onClose();
    } finally {
      setLoading(false);
    }
  };

  const localDate = new Date(conflict.local_timestamp);
  const cloudDate = new Date(conflict.cloud_timestamp);

  return (
    <Dialog open={open} maxWidth="sm" fullWidth onClose={onClose}>
      <DialogTitle>
        Document Edited on Another Device
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            <strong>{conflict.document_id}</strong> was edited in two places. Choose which version to keep.
          </Typography>

          {/* Local Version */}
          <Card variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">
                  <SaveIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Your Version
                </Typography>
                <Chip
                  label={`v${conflict.local_version}`}
                  size="small"
                  variant="outlined"
                />
              </Stack>

              <Typography variant="caption" color="textSecondary">
                Edited on {conflict.local_device_id} at{' '}
                {localDate.toLocaleString()}
              </Typography>

              <Box sx={{
                bgcolor: 'action.hover',
                p: 1,
                borderRadius: 1,
                maxHeight: '100px',
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {typeof conflict.local_preview === 'string'
                  ? conflict.local_preview.substring(0, 200)
                  : 'No preview available'
                }
              </Box>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={() => handleResolve('local')}
                disabled={loading}
              >
                Keep My Version
              </Button>
            </Stack>
          </Card>

          {/* Cloud Version */}
          <Card variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">
                  <CloudDownloadIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Latest Version
                </Typography>
                <Chip
                  label={`v${conflict.cloud_version}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Stack>

              <Typography variant="caption" color="textSecondary">
                Edited on {conflict.cloud_device_id} at{' '}
                {cloudDate.toLocaleString()}
              </Typography>

              <Box sx={{
                bgcolor: 'action.hover',
                p: 1,
                borderRadius: 1,
                maxHeight: '100px',
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {typeof conflict.cloud_preview === 'string'
                  ? conflict.cloud_preview.substring(0, 200)
                  : 'No preview available'
                }
              </Box>

              <Button
                fullWidth
                variant="contained"
                startIcon={<CloudDownloadIcon />}
                onClick={() => handleResolve('cloud')}
                disabled={loading}
              >
                Use Latest Version
              </Button>
            </Stack>
          </Card>

          <Typography variant="caption" color="textSecondary">
            💡 Tip: The version with the later timestamp is typically the most recent edit.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
