import React from 'react';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface AIGenerationPanelProps {
  onGenerate: () => void;
  loading?: boolean;
}

const AIGenerationPanel: React.FC<AIGenerationPanelProps> = ({ onGenerate, loading = false }) => {
  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 350,
        maxHeight: '60vh',
        overflow: 'auto',
        p: 2,
        boxShadow: 6,
        zIndex: 1000,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">AI Assistant</Typography>
        <IconButton size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Typography variant="body2" color="text.secondary">
        AI generation panel content goes here.
      </Typography>
    </Paper>
  );
};

export default AIGenerationPanel;