import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  TextField,
  Button,
  AppBar,
  Toolbar,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';

/**
 * SettingsPage Component
 *
 * User preferences and settings management.
 * Features:
 * - Theme preference (light/dark)
 * - Auto-save interval
 * - Default project settings
 * - Notification preferences
 * - AI generation defaults
 */

interface UserPreferences {
  autoSave: boolean;
  autoSaveInterval: number; // seconds
  defaultWordCount: number;
  defaultGenre: string;
  aiTone: string;
  aiLength: string;
  showTipsOnStartup: boolean;
  enableKeyboardShortcuts: boolean;
  enableSoundEffects: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  autoSave: true,
  autoSaveInterval: 30,
  defaultWordCount: 50000,
  defaultGenre: 'Fantasy',
  aiTone: 'neutral',
  aiLength: 'medium',
  showTipsOnStartup: true,
  enableKeyboardShortcuts: true,
  enableSoundEffects: false,
};

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const { showSuccess, showError } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = () => {
    try {
      const saved = localStorage.getItem('user-preferences');
      if (saved) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handleChange = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('user-preferences', JSON.stringify(preferences));
      setHasChanges(false);
      showSuccess('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      showError('Failed to save settings. Please try again.');
    }
  };

  const handleReset = () => {
    setPreferences(DEFAULT_PREFERENCES);
    setHasChanges(true);
    showSuccess('Settings reset to defaults');
  };

  return (
    <Box>
      <AppBar position="static" color="default">
        <Toolbar>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Settings
          </Typography>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          {/* User Info */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{currentUser?.email}</Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                User ID
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {currentUser?.uid}
              </Typography>
            </Box>
          </Paper>

          {/* Appearance */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Appearance
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={mode === 'dark'}
                    onChange={toggleTheme}
                  />
                }
                label={`Dark Mode (Currently: ${mode === 'dark' ? 'Dark' : 'Light'})`}
              />
            </FormGroup>
          </Paper>

          {/* Editor Preferences */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Editor
            </Typography>

            <FormGroup sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.autoSave}
                    onChange={(e) => handleChange('autoSave', e.target.checked)}
                  />
                }
                label="Auto-save"
              />
            </FormGroup>

            {preferences.autoSave && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <FormLabel>Auto-save Interval</FormLabel>
                <Select
                  value={preferences.autoSaveInterval}
                  onChange={(e) => handleChange('autoSaveInterval', Number(e.target.value))}
                >
                  <MenuItem value={10}>Every 10 seconds</MenuItem>
                  <MenuItem value={30}>Every 30 seconds</MenuItem>
                  <MenuItem value={60}>Every minute</MenuItem>
                  <MenuItem value={300}>Every 5 minutes</MenuItem>
                </Select>
              </FormControl>
            )}

            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.enableKeyboardShortcuts}
                    onChange={(e) => handleChange('enableKeyboardShortcuts', e.target.checked)}
                  />
                }
                label="Enable Keyboard Shortcuts"
              />
            </FormGroup>
          </Paper>

          {/* Default Project Settings */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Default Project Settings
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <FormLabel>Default Genre</FormLabel>
              <Select
                value={preferences.defaultGenre}
                onChange={(e) => handleChange('defaultGenre', e.target.value)}
              >
                <MenuItem value="Fantasy">Fantasy</MenuItem>
                <MenuItem value="Science Fiction">Science Fiction</MenuItem>
                <MenuItem value="Mystery">Mystery</MenuItem>
                <MenuItem value="Romance">Romance</MenuItem>
                <MenuItem value="Thriller">Thriller</MenuItem>
                <MenuItem value="Horror">Horror</MenuItem>
                <MenuItem value="Literary Fiction">Literary Fiction</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Default Word Count Target"
              type="number"
              value={preferences.defaultWordCount}
              onChange={(e) => handleChange('defaultWordCount', Number(e.target.value))}
              InputProps={{ inputProps: { min: 1000, max: 500000, step: 1000 } }}
            />
          </Paper>

          {/* AI Generation Defaults */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              AI Generation Defaults
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <FormLabel>Default Tone</FormLabel>
              <Select
                value={preferences.aiTone}
                onChange={(e) => handleChange('aiTone', e.target.value)}
              >
                <MenuItem value="neutral">Neutral</MenuItem>
                <MenuItem value="dramatic">Dramatic</MenuItem>
                <MenuItem value="lighthearted">Lighthearted</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="action">Action</MenuItem>
                <MenuItem value="contemplative">Contemplative</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Default Length</FormLabel>
              <Select
                value={preferences.aiLength}
                onChange={(e) => handleChange('aiLength', e.target.value)}
              >
                <MenuItem value="short">Short (200-300 words)</MenuItem>
                <MenuItem value="medium">Medium (400-600 words)</MenuItem>
                <MenuItem value="long">Long (800-1000 words)</MenuItem>
              </Select>
            </FormControl>
          </Paper>

          {/* Notifications & Tips */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notifications & Tips
            </Typography>

            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.showTipsOnStartup}
                    onChange={(e) => handleChange('showTipsOnStartup', e.target.checked)}
                  />
                }
                label="Show tips on startup"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.enableSoundEffects}
                    onChange={(e) => handleChange('enableSoundEffects', e.target.checked)}
                  />
                }
                label="Enable sound effects"
              />
            </FormGroup>
          </Paper>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleReset}
            >
              Reset to Defaults
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!hasChanges}
            >
              Save Changes
            </Button>
          </Box>

          {hasChanges && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              You have unsaved changes. Don't forget to save!
            </Alert>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default SettingsPage;
