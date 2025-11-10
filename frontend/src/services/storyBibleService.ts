import api from './api';

export interface Project {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  status: string;
  target_word_count: number;
  current_word_count: number;
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  traits: string[];
  backstory: string;
  relationships: { [key: string]: string };
  appearances: string[];
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  type: string;
  parent_location_id?: string;
  attributes: { [key: string]: string };
  scenes: string[];
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface LoreEntry {
  id: string;
  title: string;
  category: string;
  content: string;
  related_entries: string[];
  related_characters: string[];
  related_locations: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface PlotPoint {
  id: string;
  title: string;
  description: string;
  act: number;
  sequence: number;
  status: string;
  related_characters: string[];
  related_locations: string[];
  related_lore: string[];
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Scene {
  id: string;
  title: string;
  content: string;
  chapter_id?: string;
  sequence: number;
  characters: string[];
  location_id?: string;
  plot_points: string[];
  word_count: number;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

// Project API
export const projectAPI = {
  list: () => api.get<Project[]>('/api/story-bible/projects'),
  create: (data: Partial<Project>) => api.post<Project>('/api/story-bible/projects', data),
  get: (id: string) => api.get<Project>(`/api/story-bible/projects/${id}`),
};

// Character API
export const characterAPI = {
  list: (projectId: string) => 
    api.get<Character[]>(`/api/story-bible/projects/${projectId}/characters`),
  create: (projectId: string, data: Partial<Character>) => 
    api.post<Character>(`/api/story-bible/projects/${projectId}/characters`, data),
  get: (projectId: string, id: string) => 
    api.get<Character>(`/api/story-bible/projects/${projectId}/characters/${id}`),
  update: (projectId: string, id: string, data: Partial<Character>) => 
    api.put<Character>(`/api/story-bible/projects/${projectId}/characters/${id}`, data),
  delete: (projectId: string, id: string) => 
    api.delete(`/api/story-bible/projects/${projectId}/characters/${id}`),
};

// Location API
export const locationAPI = {
  list: (projectId: string) => 
    api.get<Location[]>(`/api/story-bible/projects/${projectId}/locations`),
  create: (projectId: string, data: Partial<Location>) => 
    api.post<Location>(`/api/story-bible/projects/${projectId}/locations`, data),
  get: (projectId: string, id: string) => 
    api.get<Location>(`/api/story-bible/projects/${projectId}/locations/${id}`),
  update: (projectId: string, id: string, data: Partial<Location>) => 
    api.put<Location>(`/api/story-bible/projects/${projectId}/locations/${id}`, data),
};

// Lore API
export const loreAPI = {
  list: (projectId: string) => 
    api.get<LoreEntry[]>(`/api/story-bible/projects/${projectId}/lore`),
  create: (projectId: string, data: Partial<LoreEntry>) => 
    api.post<LoreEntry>(`/api/story-bible/projects/${projectId}/lore`, data),
};

// Plot API
export const plotAPI = {
  list: (projectId: string) => 
    api.get<PlotPoint[]>(`/api/story-bible/projects/${projectId}/plot-points`),
  create: (projectId: string, data: Partial<PlotPoint>) => 
    api.post<PlotPoint>(`/api/story-bible/projects/${projectId}/plot-points`, data),
};

// Scene API
export const sceneAPI = {
  list: (projectId: string) => 
    api.get<Scene[]>(`/api/story-bible/projects/${projectId}/scenes`),
  create: (projectId: string, data: Partial<Scene>) => 
    api.post<Scene>(`/api/story-bible/projects/${projectId}/scenes`, data),
  get: (projectId: string, id: string) => 
    api.get<Scene>(`/api/story-bible/projects/${projectId}/scenes/${id}`),
  update: (projectId: string, id: string, data: Partial<Scene>) => 
    api.put<Scene>(`/api/story-bible/projects/${projectId}/scenes/${id}`, data),
  getContext: (projectId: string, id: string) => 
    api.get(`/api/story-bible/projects/${projectId}/scenes/${id}/context`),
};
