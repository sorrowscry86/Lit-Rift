import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import BookIcon from '@mui/icons-material/Book';
import { projectAPI, Project } from '../services/storyBibleService';

const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  const loadProject = async (projectId: string) => {
    try {
      const response = await projectAPI.get(projectId);
      setProject(response.data);
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  if (!project) {
    return (
      <Container>
        <Box sx={{ py: 4 }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box>
      <AppBar position="static" color="default">
        <Toolbar>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {project.title}
          </Typography>
          <Button
            startIcon={<EditIcon />}
            variant="contained"
            onClick={() => navigate(`/project/${id}/editor`)}
            sx={{ mr: 2 }}
          >
            Editor
          </Button>
          <Button
            startIcon={<BookIcon />}
            variant="outlined"
            onClick={() => navigate(`/project/${id}/story-bible`)}
          >
            Story Bible
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            {project.title}
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            {project.genre} • {project.author}
          </Typography>
          <Typography sx={{ mt: 2 }}>
            {project.description}
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Progress</Typography>
            <Typography>
              {project.current_word_count} / {project.target_word_count} words
              ({Math.round((project.current_word_count / project.target_word_count) * 100)}%)
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Tabs value={tab} onChange={(e, v) => setTab(v)}>
              <Tab label="Overview" />
              <Tab label="Scenes" />
              <Tab label="Planning" />
            </Tabs>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ProjectPage;