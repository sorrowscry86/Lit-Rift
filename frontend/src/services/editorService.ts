import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create special API instance for AI operations with longer timeout
const aiApi = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 120 seconds for AI generation
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
aiApi.interceptors.request.use(
  async (config) => {
    // Get current user and Firebase ID token
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add error handling for AI operations
aiApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'AI generation timed out. Please try a shorter request.';
    } else if (error.response?.status === 401) {
      error.message = 'Authentication required. Please log in.';
      // Redirect to login page on authentication failure
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    } else if (error.response?.status === 429) {
      error.message = 'Rate limit exceeded. Please wait before trying again.';
    } else if (error.response?.data?.error) {
      error.message = error.response.data.error;
    }
    return Promise.reject(error);
  }
);

export interface GenerateSceneRequest {
  project_id: string;
  scene_id?: string;
  prompt: string;
  tone?: string;
  length?: string;
  characters?: string[];
  location_id?: string;
}

export interface GenerateDialogueRequest {
  project_id: string;
  characters: string[];
  situation: string;
}

export interface RewriteRequest {
  text: string;
  instruction: string;
  project_id?: string;
}

export interface ContinueRequest {
  text: string;
  project_id: string;
  scene_id?: string;
  direction?: string;
}

export const editorAPI = {
  generateScene: (data: GenerateSceneRequest) =>
    aiApi.post('/api/editor/generate-scene', data),

  generateDialogue: (data: GenerateDialogueRequest) =>
    aiApi.post('/api/editor/generate-dialogue', data),

  rewrite: (data: RewriteRequest) =>
    aiApi.post('/api/editor/rewrite', data),

  expand: (text: string, projectId?: string) =>
    aiApi.post('/api/editor/expand', { text, project_id: projectId }),

  summarize: (text: string) =>
    aiApi.post('/api/editor/summarize', { text }),

  continue: (data: ContinueRequest) =>
    aiApi.post('/api/editor/continue', data),
};
