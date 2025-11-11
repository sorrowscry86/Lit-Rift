import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  Collapse,
  Tooltip,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonIcon from '@mui/icons-material/Person';
import TimelineIcon from '@mui/icons-material/Timeline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { ContinuityIssue } from '../../services/continuityService';

interface IssueDashboardProps {
  issues: ContinuityIssue[];
  onResolve: (issueId: string) => Promise<void>;
  onDismiss: (issueId: string) => Promise<void>;
}

interface IssueCardProps {
  issue: ContinuityIssue;
  onResolve: (issueId: string) => Promise<void>;
  onDismiss: (issueId: string) => Promise<void>;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onResolve, onDismiss }) => {
  const [expanded, setExpanded] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'character':
        return <PersonIcon fontSize="small" />;
      case 'timeline':
        return <TimelineIcon fontSize="small" />;
      case 'location':
        return <LocationOnIcon fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Card
      sx={{
        opacity: issue.resolved ? 0.6 : 1,
        borderLeft: 4,
        borderLeftColor: issue.resolved
          ? 'success.main'
          : getSeverityColor(issue.severity) + '.main'
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {getTypeIcon(issue.type)}
            <Chip
              label={issue.type.toUpperCase()}
              size="small"
              variant="outlined"
            />
            <Chip
              label={issue.severity.toUpperCase()}
              size="small"
              color={getSeverityColor(issue.severity) as any}
            />
            {issue.resolved && (
              <Chip
                label="RESOLVED"
                size="small"
                color="success"
                icon={<CheckCircleIcon />}
              />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary">
            {new Date(issue.createdAt).toLocaleDateString()}
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ mb: 1 }}>
          {issue.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Affected: {issue.affectedScenes.length} scene(s)
          </Typography>
          {issue.affectedScenes.length > 0 && (
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          )}
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="caption" fontWeight="bold">
              Affected Scenes:
            </Typography>
            <Box sx={{ mt: 1 }}>
              {issue.affectedScenes.map((sceneId, idx) => (
                <Chip
                  key={idx}
                  label={sceneId}
                  size="small"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
            </Box>
            {issue.affectedEntities.length > 0 && (
              <>
                <Typography variant="caption" fontWeight="bold" sx={{ mt: 1, display: 'block' }}>
                  Affected Entities:
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {issue.affectedEntities.map((entityId, idx) => (
                    <Chip
                      key={idx}
                      label={entityId}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              </>
            )}
          </Box>
        </Collapse>
      </CardContent>

      {!issue.resolved && (
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Tooltip title="Mark as resolved">
            <Button
              size="small"
              startIcon={<CheckCircleIcon />}
              onClick={() => onResolve(issue.id)}
            >
              Resolve
            </Button>
          </Tooltip>
          <Tooltip title="Dismiss this issue">
            <IconButton
              size="small"
              onClick={() => onDismiss(issue.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>
      )}
    </Card>
  );
};

export const IssueDashboard: React.FC<IssueDashboardProps> = ({
  issues,
  onResolve,
  onDismiss
}) => {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [showResolved, setShowResolved] = useState(false);

  const filteredIssues = issues.filter(issue => {
    if (typeFilter !== 'all' && issue.type !== typeFilter) return false;
    if (severityFilter !== 'all' && issue.severity !== severityFilter) return false;
    if (!showResolved && issue.resolved) return false;
    return true;
  });

  const stats = {
    total: issues.length,
    unresolved: issues.filter(i => !i.resolved).length,
    high: issues.filter(i => i.severity === 'high' && !i.resolved).length,
    medium: issues.filter(i => i.severity === 'medium' && !i.resolved).length,
    low: issues.filter(i => i.severity === 'low' && !i.resolved).length
  };

  return (
    <Box>
      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {stats.total}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Issues
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {stats.unresolved}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Unresolved
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="error.main">
              {stats.high}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              High Priority
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {stats.medium}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Medium Priority
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main">
              {stats.low}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Low Priority
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="character">Character</MenuItem>
                <MenuItem value="timeline">Timeline</MenuItem>
                <MenuItem value="location">Location</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Severity</InputLabel>
              <Select
                value={severityFilter}
                label="Severity"
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <MenuItem value="all">All Severities</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant={showResolved ? 'contained' : 'outlined'}
              onClick={() => setShowResolved(!showResolved)}
              fullWidth
            >
              {showResolved ? 'Hide' : 'Show'} Resolved
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Issues List */}
      {filteredIssues.length === 0 ? (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body1" fontWeight="bold">
            No Issues Found!
          </Typography>
          <Typography variant="body2">
            {issues.length === 0
              ? 'Run a continuity check to analyze your story.'
              : 'All issues matching your filters have been resolved.'}
          </Typography>
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onResolve={onResolve}
              onDismiss={onDismiss}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};
