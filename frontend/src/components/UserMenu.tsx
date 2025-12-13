import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
} from '@mui/material';
import {
  Logout,
  Settings,
  Brightness4,
  Brightness7,
  BugReport,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

/**
 * UserMenu component - Displays user profile menu with logout
 *
 * Features:
 * - Shows user email and avatar
 * - Logout functionality
 * - Profile settings link (placeholder)
 * - Material-UI dropdown menu
 */
export default function UserMenu() {
  const { currentUser, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleMenuClose();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/settings');
  };

  const handleDiagnostics = () => {
    handleMenuClose();
    navigate('/diagnostics');
  };

  if (!currentUser) {
    return null;
  }

  // Get user initials for avatar
  const getInitials = (email: string): string => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <>
      <IconButton
        onClick={handleMenuOpen}
        size="small"
        sx={{ ml: 2 }}
        aria-controls={anchorEl ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={anchorEl ? 'true' : undefined}
        aria-label="Open user account menu"
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
          {getInitials(currentUser.email || 'U')}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 220,
            overflow: 'visible',
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User info header */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {currentUser.displayName || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {currentUser.email}
          </Typography>
        </Box>

        <Divider />

        {/* Settings */}
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>

        {/* Diagnostics */}
        <MenuItem onClick={handleDiagnostics}>
          <ListItemIcon>
            <BugReport fontSize="small" />
          </ListItemIcon>
          <ListItemText>System Diagnostics</ListItemText>
        </MenuItem>

        {/* Theme toggle */}
        <MenuItem onClick={toggleTheme}>
          <ListItemIcon>
            {mode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</ListItemText>
        </MenuItem>

        <Divider />

        {/* Logout */}
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
