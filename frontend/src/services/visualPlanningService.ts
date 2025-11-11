import api from './api';

export interface CorkboardItem {
  id: string;
  type: 'note' | 'scene' | 'character' | 'plot_point';
  title: string;
  content: string;
  position: {
    x: number;
    y: number;
  };
  color?: string;
  linkedIds?: string[];
}

export interface MatrixCell {
  row: number;
  col: number;
  content: string;
  sceneId?: string;
}

export interface MatrixStructure {
  rows: string[];
  cols: string[];
  cells: MatrixCell[];
}

export interface OutlineNode {
  id: string;
  title: string;
  content: string;
  level: number;
  children?: OutlineNode[];
  sceneId?: string;
}

export interface CorkboardLayout {
  id?: string;
  projectId: string;
  items: CorkboardItem[];
  name: string;
}

/**
 * Fetch corkboard layout for a project
 */
export async function getCorkboard(projectId: string): Promise<CorkboardLayout> {
  const response = await api.get(`/api/planning/corkboard/${projectId}`);
  return response.data;
}

/**
 * Save corkboard layout
 */
export async function saveCorkboard(projectId: string, items: CorkboardItem[]): Promise<void> {
  await api.post(`/api/planning/corkboard/${projectId}`, { items });
}

/**
 * Add item to corkboard
 */
export async function addCorkboardItem(
  projectId: string,
  item: Omit<CorkboardItem, 'id'>
): Promise<CorkboardItem> {
  const response = await api.post(`/api/planning/corkboard/${projectId}/items`, item);
  return response.data;
}

/**
 * Update corkboard item position
 */
export async function updateCorkboardItem(
  projectId: string,
  itemId: string,
  updates: Partial<CorkboardItem>
): Promise<void> {
  await api.patch(`/api/planning/corkboard/${projectId}/items/${itemId}`, updates);
}

/**
 * Delete corkboard item
 */
export async function deleteCorkboardItem(projectId: string, itemId: string): Promise<void> {
  await api.delete(`/api/planning/corkboard/${projectId}/items/${itemId}`);
}

/**
 * Fetch matrix view for a project
 */
export async function getMatrix(projectId: string): Promise<MatrixStructure> {
  const response = await api.get(`/api/planning/matrix/${projectId}`);
  return response.data;
}

/**
 * Generate matrix structure automatically
 */
export async function generateMatrix(projectId: string): Promise<MatrixStructure> {
  const response = await api.post(`/api/planning/matrix/${projectId}/generate`);
  return response.data;
}

/**
 * Update matrix cell
 */
export async function updateMatrixCell(
  projectId: string,
  row: number,
  col: number,
  content: string
): Promise<void> {
  await api.patch(`/api/planning/matrix/${projectId}/cells`, { row, col, content });
}

/**
 * Fetch outline for a project
 */
export async function getOutline(projectId: string): Promise<OutlineNode[]> {
  const response = await api.get(`/api/planning/outline/${projectId}`);
  return response.data.outline || [];
}

/**
 * Generate outline from plot points
 */
export async function generateOutline(projectId: string): Promise<OutlineNode[]> {
  const response = await api.post(`/api/planning/outline/${projectId}/generate`);
  return response.data.outline || [];
}

/**
 * Update outline structure
 */
export async function updateOutline(projectId: string, outline: OutlineNode[]): Promise<void> {
  await api.post(`/api/planning/outline/${projectId}`, { outline });
}

/**
 * Export outline to markdown
 */
export async function exportOutlineToMarkdown(projectId: string): Promise<string> {
  const response = await api.get(`/api/planning/outline/${projectId}/export`);
  return response.data.markdown || '';
}
