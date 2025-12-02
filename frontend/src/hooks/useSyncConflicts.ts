import { useEffect, useState, useCallback } from 'react';

interface Conflict {
  id: number;
  document_id: string;
  local_version: number;
  cloud_version: number;
  local_device_id: string;
  cloud_device_id: string;
  local_timestamp: string;
  cloud_timestamp: string;
  local_preview?: string;
  cloud_preview?: string;
  status: string;
}

interface UseSyncConflictsOptions {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function useSyncConflicts(options?: UseSyncConflictsOptions) {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch pending conflicts
  const refreshConflicts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sync/conflicts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConflicts(data.conflicts || []);
      } else {
        console.error('Failed to fetch conflicts:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch conflicts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Resolve conflict
  const resolveConflict = useCallback(async (conflictId: number, choice: 'local' | 'cloud') => {
    setSyncing(true);
    try {
      const response = await fetch('/api/sync/resolve-conflict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ conflict_id: conflictId, choice })
      });

      if (response.ok) {
        options?.onSuccess?.(`Using ${choice} version`);
        await refreshConflicts();
      } else {
        options?.onError?.('Failed to resolve conflict');
      }
    } catch (error) {
      options?.onError?.('Error resolving conflict');
    } finally {
      setSyncing(false);
    }
  }, [refreshConflicts, options]);

  // Listen for sync events (polling)
  useEffect(() => {
    refreshConflicts();
    const interval = setInterval(refreshConflicts, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [refreshConflicts]);

  return { conflicts, resolveConflict, syncing, loading, refreshConflicts };
}
