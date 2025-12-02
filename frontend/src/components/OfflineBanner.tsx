import React, { useState, useEffect } from 'react';
import { Alert, Snackbar, Box } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import WifiIcon from '@mui/icons-material/Wifi';

/**
 * OfflineBanner Component
 *
 * Displays a banner when the user goes offline and hides it when back online.
 * Uses browser online/offline events to track connectivity status.
 */
const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [showOnlineAlert, setShowOnlineAlert] = useState(false);

  // Log online status for debugging
  console.debug('OfflineBanner: isOnline =', isOnline);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
      setShowOnlineAlert(true);

      // Hide the "back online" message after 3 seconds
      setTimeout(() => {
        setShowOnlineAlert(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
      setShowOnlineAlert(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    if (!navigator.onLine) {
      setShowOfflineAlert(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* Persistent offline banner */}
      {showOfflineAlert && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
          }}
        >
          <Alert
            severity="warning"
            icon={<WifiOffIcon />}
            sx={{
              borderRadius: 0,
              '& .MuiAlert-message': {
                width: '100%',
                textAlign: 'center',
              },
            }}
          >
            You are offline. Some features may be unavailable.
          </Alert>
        </Box>
      )}

      {/* Temporary "back online" notification */}
      <Snackbar
        open={showOnlineAlert}
        autoHideDuration={3000}
        onClose={() => setShowOnlineAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          icon={<WifiIcon />}
          onClose={() => setShowOnlineAlert(false)}
          sx={{ width: '100%' }}
        >
          You are back online!
        </Alert>
      </Snackbar>
    </>
  );
};

export default OfflineBanner;
