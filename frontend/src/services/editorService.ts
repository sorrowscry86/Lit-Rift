import api from './api';

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
    api.post('/api/editor/generate-scene', data),
  
  generateDialogue: (data: GenerateDialogueRequest) => 
    api.post('/api/editor/generate-dialogue', data),
  
  rewrite: (data: RewriteRequest) => 
    api.post('/api/editor/rewrite', data),
  
  expand: (text: string, projectId?: string) => 
    api.post('/api/editor/expand', { text, project_id: projectId }),
  
  summarize: (text: string) => 
    api.post('/api/editor/summarize', { text }),
  
  continue: (data: ContinueRequest) => 
    api.post('/api/editor/continue', data),
};
