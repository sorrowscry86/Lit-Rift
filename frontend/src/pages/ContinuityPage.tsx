import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  LinearProgress
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import { IssueDashboard } from '../components/Continuity/IssueDashboard';
import {
  runContinuityCheck,
  getContinuityIssues,
  resolveIssue,
  dismissIssue,
  ContinuityIssue
} from '../services/continuityService';

export const ContinuityPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<ContinuityIssue[]>([]);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  useEffect(() => {
    if (projectId) {
      loadIssues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const loadIssues = async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const fetchedIssues = await getContinuityIssues(projectId);
      setIssues(fetchedIssues);
    } catch (err: any) {
      setError(err.message || 'Failed to load continuity issues');
    } finally {
      setLoading(false);
    }
  };

  const handleRunCheck = async () => {
    if (!projectId) return;

    setChecking(true);
    setError(null);

    try {
      const result = await runContinuityCheck(projectId);
      setIssues(result.issues);
      setLastCheckTime(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to run continuity check');
    } finally {
      setChecking(false);
    }
  };

  const handleResolve = async (issueId: string) => {
    if (!projectId) return;

    try {
      await resolveIssue(projectId, issueId);
      setIssues(
        issues.map(issue =>
          issue.id === issueId ? { ...issue, resolved: true } : issue
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to resolve issue');
    }
  };

  const handleDismiss = async (issueId: string) => {
    if (!projectId) return;

    try {
      await dismissIssue(projectId, issueId);
      setIssues(issues.filter(issue => issue.id !== issueId));
    } catch (err: any) {
      setError(err.message || 'Failed to dismiss issue');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Continuity Tracker
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI-powered consistency checking for your story
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadIssues}
              disabled={checking}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleRunCheck}
              disabled={checking}
            >
              {checking ? 'Checking...' : 'Run Check'}
            </Button>
          </Box>
        </Box>

        {lastCheckTime && (
          <Typography variant="caption" color="text.secondary">
            Last checked: {lastCheckTime.toLocaleString()}
          </Typography>
        )}
      </Box>

      {/* Progress Bar */}
      {checking && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Running continuity check...
          </Typography>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            This may take a few moments. The AI is analyzing your characters, timeline, and locations.
          </Typography>
        </Paper>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Info Box */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" fontWeight="bold" gutterBottom>
          How Continuity Tracking Works
        </Typography>
        <Typography variant="body2" component="div">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>
              <strong>Character Consistency:</strong> Checks for inconsistencies in character descriptions,
              traits, and behaviors across scenes
            </li>
            <li>
              <strong>Timeline Logic:</strong> Validates that events happen in a logical order and
              time references make sense
            </li>
            <li>
              <strong>Location Accuracy:</strong> Ensures location descriptions and details remain
              consistent throughout your story
            </li>
          </ul>
        </Typography>
      </Alert>

      {/* Dashboard */}
      <Paper sx={{ p: 3 }}>
        <IssueDashboard
          issues={issues}
          onResolve={handleResolve}
          onDismiss={handleDismiss}
        />
      </Paper>

      {/* Empty State */}
      {!checking && issues.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Issues Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Click "Run Check" to analyze your story for continuity issues.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            The AI will review your entire Story Bible and manuscript to find potential inconsistencies.
          </Typography>
        </Box>
      )}
    </Container>
  );
};
