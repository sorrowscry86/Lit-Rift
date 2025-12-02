/**
 * Background Sync Worker Hook
 *
 * Manages background synchronization worker and real-time conflict notifications.
 *
 * Prerequisites:
 * - npm install socket.io-client@4.7.2
 * - Backend running with SocketIO support
 *
 * Usage:
 * const { isRunning, isOnline, lastSync } = useSyncWorker();
 */

import { useEffect, useState, useCallback, useRef } from 'react';

// Socket.IO types (install: npm install socket.io-client @types/socket.io-client)
// @ts-ignore - will be available after npm install
// import io, { Socket } from 'socket.io-client';

interface SyncConflict {
  conflict_id: number;
  doc_id: string;
  local_version: number;
  cloud_version: number;
  local_device: string;
  cloud_device: string;
  local_timestamp: string;
  cloud_timestamp: string;
}

interface SyncWorkerStatus {
  isRunning: boolean;
  isOnline: boolean;
  lastSync: string | null;
  socket: any | null; // Will be Socket type after socket.io-client is installed
}

export function useSyncWorker(): SyncWorkerStatus {
  const [isRunning, setIsRunning] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [socket, setSocket] = useState<any | null>(null);
  const socketRef = useRef<any>(null);

  const userId = localStorage.getItem('user_id');
  const token = localStorage.getItem('token');

  // Start background worker on mount
  useEffect(() => {
    if (!userId || !token) {
      console.warn('useSyncWorker: No user_id or token found');
      return;
    }

    const startWorker = async () => {
      try {
        const response = await fetch('/api/sync/start-worker', {
          method: 'POST',
          headers: {
            'X-User-ID': userId,
            'Authorization': `Bearer ${token}`,
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIsRunning(true);
          console.log('Background sync worker started:', data);
        } else {
          console.error('Failed to start sync worker:', response.statusText);
        }
      } catch (error) {
        console.error('Failed to start sync worker:', error);
      }
    };

    startWorker();
  }, [userId, token]);

  // Connect WebSocket for real-time conflict notifications
  useEffect(() => {
    if (!userId) return;

    // Check if socket.io-client is installed
    const hasSocketIO = typeof window !== 'undefined' && (window as any).io;

    if (!hasSocketIO) {
      console.warn('socket.io-client not installed. Run: npm install socket.io-client');
      console.warn('Real-time conflict notifications will not work until socket.io-client is installed.');
      return;
    }

    try {
      // @ts-ignore - socket.io will be available after npm install
      const io = (window as any).io || require('socket.io-client');

      const newSocket = io('http://localhost:5000', {
        auth: { user_id: userId },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10
      });

      // Listen for conflict events
      newSocket.on('sync:conflict', (conflict: SyncConflict) => {
        console.log('Conflict detected:', conflict);

        // Dispatch custom event for conflict modal
        window.dispatchEvent(
          new CustomEvent('sync:conflict', { detail: conflict })
        );
      });

      newSocket.on('connect', () => {
        console.log('Sync WebSocket connected');
        setIsOnline(true);

        // Explicitly join user room
        newSocket.emit('join', { user_id: userId });
      });

      newSocket.on('disconnect', () => {
        console.log('Sync WebSocket disconnected');
        setIsOnline(false);
      });

      newSocket.on('connect_error', (error: Error) => {
        console.error('WebSocket connection error:', error);
        setIsOnline(false);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      console.warn('Install socket.io-client: npm install socket.io-client');
    }
  }, [userId]);

  // Fetch worker status periodically
  useEffect(() => {
    if (!userId || !isRunning) return;

    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/sync/worker-status', {
          headers: {
            'X-User-ID': userId,
            'Authorization': `Bearer ${token || ''}`,
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.last_sync_time) {
            setLastSync(data.last_sync_time);
          }
          if (typeof data.is_online === 'boolean') {
            setIsOnline(data.is_online);
          }
        }
      } catch (error) {
        console.error('Failed to fetch worker status:', error);
      }
    };

    // Initial fetch
    fetchStatus();

    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30000);

    return () => clearInterval(interval);
  }, [userId, token, isRunning]);

  return {
    isRunning,
    isOnline,
    lastSync,
    socket
  };
}
