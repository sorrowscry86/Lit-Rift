/**
 * EditorPage Integration Example
 *
 * Shows how to integrate offline-first sync into the editor.
 */

import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Snackbar, Alert, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useEditorSync } from '../hooks/useEditorSync';

interface EditorPageProps {
  documentId: string;
}

export function EditorPage({ documentId }: EditorPageProps) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  const { saveDocument, loadDocument, isSaving, lastSaved } = useEditorSync();

  // Load document on mount
  useEffect(() => {
    const load = async () => {
      const result = await loadDocument(documentId);

      if (result.error) {
        setSnackbar({
          open: true,
          message: `Failed to load: ${result.error}`,
          severity: 'error'
        });
        return;
      }

      if (result.content) setContent(result.content);
      if (result.title) setTitle(result.title);
    };

    load();
  }, [documentId, loadDocument]);

  // Save handler
  const handleSave = async () => {
    const result = await saveDocument(documentId, content, title);

    if (!result.success) {
      setSnackbar({
        open: true,
        message: `Save failed: ${result.error}`,
        severity: 'error'
      });
      return;
    }

    if (result.conflicts && result.conflicts.length > 0) {
      setSnackbar({
        open: true,
        message: 'Conflict detected - please resolve in the modal',
        severity: 'warning'
      });
      return;
    }

    setSnackbar({
      open: true,
      message: 'Saved successfully',
      severity: 'success'
    });
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (content.trim() && !isSaving) {
        handleSave();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [content, isSaving]);

  // Save on Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Title */}
      <TextField
        fullWidth
        label="Document Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Editor */}
      <TextField
        fullWidth
        multiline
        rows={20}
        label="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Save Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>

        {lastSaved && (
          <span style={{ fontSize: '0.875rem', color: '#666' }}>
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

/**
 * Key Features:
 * 1. ✅ Offline-first: Saves to local SQLite first
 * 2. ✅ Auto-save every 30 seconds
 * 3. ✅ Keyboard shortcut (Ctrl+S / Cmd+S)
 * 4. ✅ Loading indicator while saving
 * 5. ✅ Last saved timestamp
 * 6. ✅ Conflict notifications (modal handled by SyncStatusContainer)
 * 7. ✅ Error handling with snackbar
 *
 * The document will:
 * - Save instantly to local database
 * - Queue for background sync (every 30s)
 * - Show conflict modal if edited on another device
 * - Work completely offline
 */
