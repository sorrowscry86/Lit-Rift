/**
 * App.tsx Integration Example
 *
 * This file shows how to integrate Phase 2 sync features into App.tsx
 *
 * Steps:
 * 1. Import SyncStatusContainer
 * 2. Add to app header/toolbar
 * 3. Component handles everything automatically
 */

import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { SyncStatusContainer } from './components/SyncStatusContainer';

export function App() {
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            LitRift
          </Typography>

          {/* Add sync status to header */}
          <Box sx={{ ml: 'auto' }}>
            <SyncStatusContainer
              onConflictResolved={() => {
                console.log('Conflict resolved');
                // Optional: Refresh editor content, show notification, etc.
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Rest of your app */}
      <main>
        {/* Your routes, pages, etc. */}
      </main>
    </div>
  );
}

/**
 * That's it! The SyncStatusContainer will:
 * 1. Start the background sync worker on mount
 * 2. Connect to WebSocket for real-time notifications
 * 3. Show sync status (synced, syncing, offline, conflicts)
 * 4. Automatically display conflict resolution modal
 * 5. Handle conflict resolution via API
 *
 * No additional code needed!
 */
