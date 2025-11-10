import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  AppBar,
  Toolbar,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { sceneAPI, Scene, characterAPI, Character } from '../services/storyBibleService';
import { editorAPI } from '../services/editorService';

const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [content, setContent] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [tone, setTone] = useState('neutral');
  const [length, setLength] = useState('medium');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadScenes(id);
      loadCharacters(id);
    }
  }, [id]);

  const loadScenes = async (projectId: string) => {
    try {
      const response = await sceneAPI.list(projectId);
      setScenes(response.data);
      if (response.data.length > 0) {
        setCurrentScene(response.data[0]);
        setContent(response.data[0].content);
      }
    } catch (error) {
      console.error('Failed to load scenes:', error);
    }
  };

  const loadCharacters = async (projectId: string) => {
    try {
      const response = await characterAPI.list(projectId);
      setCharacters(response.data);
    } catch (error) {
      console.error('Failed to load characters:', error);
    }
  };

  const handleGenerateAI = async () => {
    if (!id || !aiPrompt) return;

    setLoading(true);
    try {
      const response = await editorAPI.generateScene({
        project_id: id,
        scene_id: currentScene?.id,
        prompt: aiPrompt,
        tone,
        length,
      });

      if (response.data.success) {
        setContent(content + '\n\n' + response.data.content);
      }
    } catch (error) {
      console.error('Failed to generate content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveScene = async () => {
    if (!id || !currentScene) return;

    try {
      await sceneAPI.update(id, currentScene.id, { content });
      alert('Scene saved successfully!');
    } catch (error) {
      console.error('Failed to save scene:', error);
    }
  };

  const handleCreateNewScene = async () => {
    if (!id) return;

    try {
      const response = await sceneAPI.create(id, {
        title: 'New Scene',
        content: '',
        sequence: scenes.length,
        status: 'draft',
      });
      
      const newScene = response.data;
      setScenes([...scenes, newScene]);
      setCurrentScene(newScene);
      setContent('');
    } catch (error) {
      console.error('Failed to create scene:', error);
    }
  };

  return (
    <Box>
      <AppBar position="static" color="default">
        <Toolbar>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/project/${id}`)}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Editor
          </Typography>
          <Button variant="contained" onClick={handleSaveScene}>
            Save
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl">
        <Grid container spacing={2} sx={{ py: 2, height: 'calc(100vh - 64px)' }}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Scenes</Typography>
                <Button size="small" onClick={handleCreateNewScene}>
                  New
                </Button>
              </Box>
              {scenes.map((scene) => (
                <Box
                  key={scene.id}
                  sx={{
                    p: 1,
                    mb: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    bgcolor: currentScene?.id === scene.id ? 'primary.dark' : 'background.paper',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                  onClick={() => {
                    setCurrentScene(scene);
                    setContent(scene.content);
                  }}
                >
                  <Typography variant="body2">{scene.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {scene.word_count} words
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Main Editor */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {currentScene && (
                <>
                  <TextField
                    label="Scene Title"
                    value={currentScene.title}
                    onChange={(e) =>
                      setCurrentScene({ ...currentScene, title: e.target.value })
                    }
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    multiline
                    rows={25}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing your story..."
                    sx={{ flexGrow: 1 }}
                  />
                  <Typography variant="caption" sx={{ mt: 1 }}>
                    {content.split(/\s+/).filter(Boolean).length} words
                  </Typography>
                </>
              )}
            </Paper>
          </Grid>

          {/* AI Assistant Panel */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                AI Assistant
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Context
                </Typography>
                {currentScene?.characters.length ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {currentScene.characters.map((charId) => {
                      const char = characters.find((c) => c.id === charId);
                      return char ? (
                        <Chip key={charId} label={char.name} size="small" />
                      ) : null;
                    })}
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    No characters selected
                  </Typography>
                )}
              </Box>

              <TextField
                label="AI Prompt"
                multiline
                rows={3}
                fullWidth
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe what you want to generate..."
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Tone</InputLabel>
                <Select value={tone} onChange={(e) => setTone(e.target.value)}>
                  <MenuItem value="neutral">Neutral</MenuItem>
                  <MenuItem value="dramatic">Dramatic</MenuItem>
                  <MenuItem value="lighthearted">Lighthearted</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="action">Action</MenuItem>
                  <MenuItem value="contemplative">Contemplative</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Length</InputLabel>
                <Select value={length} onChange={(e) => setLength(e.target.value)}>
                  <MenuItem value="short">Short (200-300 words)</MenuItem>
                  <MenuItem value="medium">Medium (400-600 words)</MenuItem>
                  <MenuItem value="long">Long (800-1000 words)</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                fullWidth
                startIcon={<AutoAwesomeIcon />}
                onClick={handleGenerateAI}
                disabled={loading || !aiPrompt}
              >
                {loading ? 'Generating...' : 'Generate'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default EditorPage;