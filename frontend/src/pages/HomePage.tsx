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
  Alert,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { projectAPI, Project } from '../services/storyBibleService';
import UserMenu from '../components/UserMenu';
import EmailVerificationBanner from '../components/EmailVerificationBanner';
import ProjectCardSkeleton from '../components/ProjectCardSkeleton';
import { logError } from '../utils/errorLogger';

const HomePage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
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
      setLoading(true);
      setError(null);
      const response = await projectAPI.list();
      setProjects(response.data);
    } catch (err: any) {
      console.error('Failed to load projects:', err);
      const errorMessage = err.response?.data?.error || 'Failed to load projects. Please try again.';
      setError(errorMessage);
      logError(err, {
        component: 'HomePage',
        action: 'loadProjects',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      setCreating(true);
      const response = await projectAPI.create(newProject);
      setProjects([...projects, response.data]);
      setOpenDialog(false);
      setNewProject({ title: '', author: '', genre: '', description: '' });
      navigate(`/project/${response.data.id}`);
    } catch (err: any) {
      console.error('Failed to create project:', err);
      const errorMessage = err.response?.data?.error || 'Failed to create project. Please try again.';
      alert(errorMessage); // TODO: Replace with better error UI (Snackbar)
      logError(err, {
        component: 'HomePage',
        action: 'createProject',
        projectData: newProject,
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" fontWeight="bold">
            Lit-Rift
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              New Project
            </Button>
            <UserMenu />
          </Box>
        </Box>

        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          AI-Powered Novel Creation
        </Typography>

        <EmailVerificationBanner />

        {/* Error state */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={loadProjects}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Loading state */}
        {loading && (
          <Grid container spacing={3}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} md={6} lg={4} key={i}>
                <ProjectCardSkeleton />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Projects grid */}
        {!loading && !error && (
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

            {projects.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    No projects yet. Create your first novel!
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
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
          <Button onClick={() => setOpenDialog(false)} disabled={creating}>
            Cancel
          </Button>
          <Button onClick={handleCreateProject} variant="contained" disabled={creating}>
            {creating ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HomePage;