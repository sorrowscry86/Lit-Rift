import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  AlertTitle,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ServiceStatus {
  status: 'healthy' | 'unhealthy' | 'degraded' | 'error' | 'unknown';
  last_check: string | null;
  message: string;
  response_time_ms?: number;
  available_models?: number;
}

interface HealthData {
  status: string;
  timestamp: string;
  services: {
    firebase: ServiceStatus;
    firestore: ServiceStatus;
    gemini_ai: ServiceStatus;
    socketio: ServiceStatus;
  };
  summary: {
    total_services: number;
    healthy_count: number;
    unhealthy_count: number;
    degraded_count: number;
  };
}

const DiagnosticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealthData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/diagnostics/health`);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      const data = await response.json();
      setHealthData(data);
      setLastUpdate(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch health data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  // Auto-refresh every 10 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchHealthData();
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchHealthData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 40 }} />;
      case 'degraded':
        return <WarningIcon sx={{ color: 'warning.main', fontSize: 40 }} />;
      case 'unhealthy':
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main', fontSize: 40 }} />;
      default:
        return <InfoIcon sx={{ color: 'grey.500', fontSize: 40 }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'unhealthy':
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getServiceDisplayName = (serviceName: string) => {
    const names: { [key: string]: string } = {
      firebase: 'Firebase Admin SDK',
      firestore: 'Cloud Firestore Database',
      gemini_ai: 'Gemini AI API',
      socketio: 'WebSocket Server',
    };
    return names[serviceName] || serviceName;
  };

  const getTroubleshootingTip = (serviceName: string, status: ServiceStatus) => {
    if (status.status === 'healthy') return null;

    const tips: { [key: string]: string } = {
      firebase: 'Check FIREBASE_CONFIG environment variable. Ensure service account key is valid.',
      firestore: 'Verify Firebase project has Firestore enabled. Check network connectivity.',
      gemini_ai: 'Verify GOOGLE_API_KEY environment variable is set correctly. Check API quota limits.',
      socketio: 'WebSocket server should auto-start with Flask app. Check for port conflicts.',
    };

    return tips[serviceName];
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            System Diagnostics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time monitoring of backend services and components
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Tooltip title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}>
            <Button
              variant={autoRefresh ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setAutoRefresh(!autoRefresh)}
              startIcon={<TimelineIcon />}
            >
              {autoRefresh ? 'Live' : 'Manual'}
            </Button>
          </Tooltip>
          <Tooltip title="Refresh now">
            <IconButton onClick={fetchHealthData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </Box>
      </Box>

      {/* Loading indicator */}
      {loading && !healthData && <LinearProgress sx={{ mb: 2 }} />}

      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Connection Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Last update info */}
      {healthData && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Typography>
            <Chip
              icon={getStatusIcon(healthData.status).type === CheckCircleIcon ? <CheckCircleIcon /> : 
                    getStatusIcon(healthData.status).type === WarningIcon ? <WarningIcon /> : <ErrorIcon />}
              label={`Overall Status: ${healthData.status.toUpperCase()}`}
              color={getStatusColor(healthData.status) as any}
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
        </Paper>
      )}

      {/* Summary Stats */}
      {healthData && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Total Services
                </Typography>
                <Typography variant="h4">{healthData.summary.total_services}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.dark' }}>
              <CardContent>
                <Typography color="white" gutterBottom variant="body2">
                  Healthy
                </Typography>
                <Typography variant="h4" color="white">
                  {healthData.summary.healthy_count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.dark' }}>
              <CardContent>
                <Typography color="white" gutterBottom variant="body2">
                  Degraded
                </Typography>
                <Typography variant="h4" color="white">
                  {healthData.summary.degraded_count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'error.dark' }}>
              <CardContent>
                <Typography color="white" gutterBottom variant="body2">
                  Unhealthy
                </Typography>
                <Typography variant="h4" color="white">
                  {healthData.summary.unhealthy_count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Service Status Cards */}
      {healthData && (
        <Grid container spacing={3}>
          {Object.entries(healthData.services).map(([serviceName, serviceStatus]) => (
            <Grid item xs={12} md={6} key={serviceName}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ mr: 2 }}>
                      {getStatusIcon(serviceStatus.status)}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {getServiceDisplayName(serviceName)}
                      </Typography>
                      <Chip
                        label={serviceStatus.status.toUpperCase()}
                        color={getStatusColor(serviceStatus.status) as any}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Status:</strong> {serviceStatus.message}
                  </Typography>

                  {serviceStatus.response_time_ms !== undefined && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Response Time:</strong> {serviceStatus.response_time_ms}ms
                    </Typography>
                  )}

                  {serviceStatus.available_models !== undefined && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Available Models:</strong> {serviceStatus.available_models}
                    </Typography>
                  )}

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Last Checked:</strong> {formatTimestamp(serviceStatus.last_check)}
                  </Typography>

                  {/* Troubleshooting tip */}
                  {serviceStatus.status !== 'healthy' && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <AlertTitle>Troubleshooting</AlertTitle>
                      {getTroubleshootingTip(serviceName, serviceStatus) || 'Check service logs for more details.'}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Help Section */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom>
          About System Diagnostics
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          This dashboard monitors the health and status of all backend services in real-time. 
          Services are checked every 10 seconds when auto-refresh is enabled.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Status Indicators:</strong>
        </Typography>
        <Box sx={{ pl: 2 }}>
          <Typography variant="body2" color="text.secondary">
            • <strong style={{ color: '#4caf50' }}>Healthy:</strong> Service is functioning normally
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong style={{ color: '#ff9800' }}>Degraded:</strong> Service is operational but with reduced functionality
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong style={{ color: '#f44336' }}>Unhealthy/Error:</strong> Service is not functioning correctly
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default DiagnosticsPage;
