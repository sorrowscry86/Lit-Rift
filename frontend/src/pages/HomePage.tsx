import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { projectAPI, Project } from '../services/storyBibleService';

const HomePage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    author: '',
    genre: '',
    description: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectAPI.list();
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleCreateProject = async () => {
    try {
      const response = await projectAPI.create(newProject);
      setProjects([...projects, response.data]);
      setOpenDialog(false);
      setNewProject({ title: '', author: '', genre: '', description: '' });
      navigate(`/project/${response.data.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" fontWeight="bold">
            Lit-Rift
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            New Project
          </Button>
        </Box>

        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          AI-Powered Novel Creation
        </Typography>

        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {project.title}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    {project.genre} • {project.author}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    {project.description || 'No description'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    {project.current_word_count} / {project.target_word_count} words
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate(`/project/${project.id}`)}>
                    Open
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {projects.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No projects yet. Create your first novel!
            </Typography>
          </Box>
        )}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Author"
            fullWidth
            variant="outlined"
            value={newProject.author}
            onChange={(e) => setNewProject({ ...newProject, author: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Genre"
            fullWidth
            variant="outlined"
            value={newProject.genre}
            onChange={(e) => setNewProject({ ...newProject, genre: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateProject} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HomePage;