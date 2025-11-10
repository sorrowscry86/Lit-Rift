import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';

// Pages
import HomePage from './pages/HomePage';
import ProjectPage from './pages/ProjectPage';
import EditorPage from './pages/EditorPage';
import StoryBiblePage from './pages/StoryBiblePage';
import { VisualPlanningPage } from './pages/VisualPlanningPage';
import { ContinuityPage } from './pages/ContinuityPage';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
    },
    secondary: {
      main: '#ec4899',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/project/:id/editor" element={<EditorPage />} />
          <Route path="/project/:id/story-bible" element={<StoryBiblePage />} />
          <Route path="/project/:projectId/planning" element={<VisualPlanningPage />} />
          <Route path="/project/:projectId/continuity" element={<ContinuityPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
