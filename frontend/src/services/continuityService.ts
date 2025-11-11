import api from './api';

export interface ContinuityIssue {
  id: string;
  type: 'character' | 'timeline' | 'location';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedScenes: string[];
  affectedEntities: string[];
  resolved: boolean;
  createdAt: string;
}

export interface ContinuityCheckResult {
  totalIssues: number;
  issuesBySeverity: {
    high: number;
    medium: number;
    low: number;
  };
  issuesByType: {
    character: number;
    timeline: number;
    location: number;
  };
  issues: ContinuityIssue[];
}

export interface ContinuityCheckStatus {
  status: 'running' | 'completed' | 'failed';
  progress?: number;
  message?: string;
}

/**
 * Run a continuity check on a project
 */
export async function runContinuityCheck(projectId: string): Promise<ContinuityCheckResult> {
  const response = await api.post(`/api/continuity/check/${projectId}`);
  return response.data;
}

/**
 * Get all continuity issues for a project
 */
export async function getContinuityIssues(
  projectId: string,
  filters?: {
    type?: 'character' | 'timeline' | 'location';
    severity?: 'low' | 'medium' | 'high';
    resolved?: boolean;
  }
): Promise<ContinuityIssue[]> {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.severity) params.append('severity', filters.severity);
  if (filters?.resolved !== undefined) params.append('resolved', String(filters.resolved));

  const response = await api.get(`/api/continuity/issues/${projectId}?${params.toString()}`);
  return response.data.issues || [];
}

/**
 * Mark a continuity issue as resolved
 */
export async function resolveIssue(projectId: string, issueId: string): Promise<void> {
  await api.patch(`/api/continuity/issues/${projectId}/${issueId}/resolve`);
}

/**
 * Dismiss a continuity issue
 */
export async function dismissIssue(projectId: string, issueId: string): Promise<void> {
  await api.delete(`/api/continuity/issues/${projectId}/${issueId}`);
}

/**
 * Get check status (for long-running checks)
 */
export async function getCheckStatus(projectId: string): Promise<ContinuityCheckStatus> {
  const response = await api.get(`/api/continuity/check/${projectId}/status`);
  return response.data;
}
