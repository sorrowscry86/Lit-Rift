/**
 * Sync Status Container
 *
 * Connects SyncStatus component to sync worker state and conflicts.
 * Displays real-time sync status in app header.
 */

import React, { useState, useEffect } from 'react';
import { SyncStatus } from './SyncStatus';
import { useSyncWorker } from '../hooks/useSyncWorker';
import { useSyncConflicts } from '../hooks/useSyncConflicts';
import { ConflictResolutionModal } from './ConflictResolutionModal';

interface SyncStatusContainerProps {
  onConflictResolved?: () => void;
}

export function SyncStatusContainer({ onConflictResolved }: SyncStatusContainerProps) {
  const { isRunning, isOnline, lastSync } = useSyncWorker();
  const { conflicts, resolveConflict, syncing } = useSyncConflicts();

  const [showConflictModal, setShowConflictModal] = useState(false);
  const [currentConflict, setCurrentConflict] = useState<any>(null);

  // Listen for real-time conflict events
  useEffect(() => {
    const handleConflict = (event: CustomEvent) => {
      const conflict = event.detail;
      console.log('Conflict event received:', conflict);

      // Show modal for first conflict
      if (conflicts.length === 0) {
        setCurrentConflict(conflict);
        setShowConflictModal(true);
      }
    };

    window.addEventListener('sync:conflict', handleConflict as EventListener);

    return () => {
      window.removeEventListener('sync:conflict', handleConflict as EventListener);
    };
  }, [conflicts.length]);

  // Auto-show modal if conflicts exist
  useEffect(() => {
    if (conflicts.length > 0 && !currentConflict) {
      setCurrentConflict(conflicts[0]);
      setShowConflictModal(true);
    }
  }, [conflicts, currentConflict]);

  const handleResolveConflict = async (conflictId: number, choice: 'local' | 'cloud') => {
    await resolveConflict(conflictId, choice);
    setShowConflictModal(false);
    setCurrentConflict(null);

    if (onConflictResolved) {
      onConflictResolved();
    }

    // Show next conflict if any
    if (conflicts.length > 1) {
      const nextConflict = conflicts.find(c => c.id !== conflictId);
      if (nextConflict) {
        setCurrentConflict(nextConflict);
        setShowConflictModal(true);
      }
    }
  };

  const handleShowConflicts = () => {
    if (conflicts.length > 0) {
      setCurrentConflict(conflicts[0]);
      setShowConflictModal(true);
    }
  };

  const getStatus = (): 'synced' | 'syncing' | 'conflict' | 'offline' => {
    if (!isOnline) return 'offline';
    if (conflicts.length > 0) return 'conflict';
    if (syncing || !isRunning) return 'syncing';
    return 'synced';
  };

  return (
    <>
      <SyncStatus
        status={getStatus()}
        conflictCount={conflicts.length}
        onShowConflicts={handleShowConflicts}
      />

      {currentConflict && (
        <ConflictResolutionModal
          conflict={currentConflict}
          open={showConflictModal}
          onClose={() => setShowConflictModal(false)}
          onResolve={handleResolveConflict}
        />
      )}
    </>
  );
}
