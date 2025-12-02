/**
 * Editor Sync Hook
 *
 * Handles saving documents with offline-first sync.
 * Documents are saved to local SQLite first, then queued for cloud sync.
 *
 * Usage:
 * const { saveDocument, isSaving } = useEditorSync();
 * await saveDocument(docId, content, title);
 */

import { useState, useCallback } from 'react';

interface SaveResult {
  success: boolean;
  conflicts?: Array<{ doc_id: string }>;
  error?: string;
}

export function useEditorSync() {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const userId = localStorage.getItem('user_id');
  const token = localStorage.getItem('token');

  /**
   * Save document with offline-first sync
   *
   * Flow:
   * 1. Save to local SQLite (instant, optimistic)
   * 2. Add to sync queue
   * 3. Background worker will sync to cloud
   * 4. If conflict detected, user will see modal
   */
  const saveDocument = useCallback(async (
    docId: string,
    content: string,
    title?: string
  ): Promise<SaveResult> => {
    if (!userId) {
      return { success: false, error: 'No user ID' };
    }

    setIsSaving(true);

    try {
      // Save and push to sync queue
      const response = await fetch('/api/sync/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId,
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          documents: [{
            doc_id: docId,
            content,
            title
          }]
        })
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error };
      }

      const result = await response.json();

      // Check for conflicts
      if (result.conflicts && result.conflicts.length > 0) {
        console.warn('Conflicts detected:', result.conflicts);
        return {
          success: true,
          conflicts: result.conflicts
        };
      }

      setLastSaved(new Date());
      return { success: true };

    } catch (error) {
      console.error('Save failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setIsSaving(false);
    }
  }, [userId, token]);

  /**
   * Load document (from local or cloud)
   */
  const loadDocument = useCallback(async (docId: string): Promise<{
    content?: string;
    title?: string;
    version?: number;
    last_edited?: string;
    error?: string;
  }> => {
    if (!userId) {
      return { error: 'No user ID' };
    }

    try {
      // Try to load from local first (faster)
      const response = await fetch(`/api/sync/document/${docId}`, {
        headers: {
          'X-User-ID': userId,
          'Authorization': `Bearer ${token || ''}`,
        }
      });

      if (!response.ok) {
        return { error: 'Document not found' };
      }

      const doc = await response.json();
      return {
        content: doc.content,
        title: doc.title,
        version: doc.version,
        last_edited: doc.last_edited
      };

    } catch (error) {
      console.error('Load failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [userId, token]);

  return {
    saveDocument,
    loadDocument,
    isSaving,
    lastSaved
  };
}
