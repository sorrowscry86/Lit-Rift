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
import { useToast } from '../contexts/ToastContext';

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
  const { showError, showSuccess } = useToast();

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
    // Optimistic UI: Create temporary project with optimistic ID
    const optimisticId = `temp-${Date.now()}`;
    const optimisticProject: Project = {
      id: optimisticId,
      title: newProject.title,
      author: newProject.author,
      genre: newProject.genre || 'Unspecified',
      description: newProject.description || '',
      status: 'draft',
      target_word_count: 50000,
      current_word_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      setCreating(true);

      // Immediately add optimistic project to UI
      setProjects([...projects, optimisticProject]);
      setOpenDialog(false);
      setNewProject({ title: '', author: '', genre: '', description: '' });

      // Make API call
      const response = await projectAPI.create(newProject);

      // Replace optimistic project with real data
      setProjects(prevProjects =>
        prevProjects.map(p => p.id === optimisticId ? response.data : p)
      );

      showSuccess(`Project "${response.data.title}" created successfully!`);
      navigate(`/project/${response.data.id}`);
    } catch (err: any) {
      console.error('Failed to create project:', err);

      // Rollback: Remove optimistic project on error
      setProjects(prevProjects =>
        prevProjects.filter(p => p.id !== optimisticId)
      );

      const errorMessage = err.response?.data?.error || 'Failed to create project. Please try again.';
      showError(errorMessage);
      logError(err, {
        component: 'HomePage',
        action: 'createProject',
        projectData: newProject,
      });

      // Reopen dialog so user can retry
      setOpenDialog(true);
      setNewProject(newProject);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" fontWeight="bold">
            Lit-Rift
          </Typography>
          <Box component="nav" sx={{ display: 'flex', alignItems: 'center', gap: 2 }} aria-label="Main navigation">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              aria-label="Create new project"
            >
              New Project
            </Button>
            <UserMenu />
          </Box>
        </Box>

        <Typography variant="h6" component="p" color="text.secondary" sx={{ mb: 4 }} role="doc-subtitle">
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
          <Grid container spacing={3} component="section" aria-label="Projects">
            {projects.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No projects yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Create your first project to get started
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    aria-label="Create your first project"
                  >
                    Create Project
                  </Button>
                </Box>
              </Grid>
            ) : (
              projects.map((project) => (
                <Grid item xs={12} md={6} lg={4} key={project.id}>
                  <Card component="article" aria-label={`Project: ${project.title}`}>
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
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }} aria-label={`Progress: ${project.current_word_count} of ${project.target_word_count} words`}>
                      {project.current_word_count} / {project.target_word_count} words
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => navigate(`/project/${project.id}`)}
                      aria-label={`Open project ${project.title}`}
                    >
                      Open
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
            )}
          </Grid>
        )}
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="create-project-dialog-title"
        aria-describedby="create-project-dialog-description"
      >
        <DialogTitle id="create-project-dialog-title">Create New Project</DialogTitle>
        <DialogContent id="create-project-dialog-description">
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            sx={{ mb: 2 }}
            required
            aria-required="true"
            inputProps={{ 'aria-label': 'Project title' }}
          />
          <TextField
            margin="dense"
            label="Author"
            fullWidth
            variant="outlined"
            value={newProject.author}
            onChange={(e) => setNewProject({ ...newProject, author: e.target.value })}
            sx={{ mb: 2 }}
            required
            aria-required="true"
            inputProps={{ 'aria-label': 'Author name' }}
          />
          <TextField
            margin="dense"
            label="Genre"
            fullWidth
            variant="outlined"
            value={newProject.genre}
            onChange={(e) => setNewProject({ ...newProject, genre: e.target.value })}
            sx={{ mb: 2 }}
            inputProps={{ 'aria-label': 'Genre' }}
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
            inputProps={{ 'aria-label': 'Project description' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={creating} aria-label="Cancel project creation">
            Cancel
          </Button>
          <Button
            onClick={handleCreateProject}
            variant="contained"
            disabled={creating || !newProject.title || !newProject.author}
            aria-label="Create new project"
            aria-busy={creating}
          >
            {creating ? <CircularProgress size={24} aria-label="Creating project" /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HomePage;