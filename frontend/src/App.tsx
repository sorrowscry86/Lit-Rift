import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';

// Contexts
import { AuthProvider } from './contexts/AuthContext';

// Components (keep these as direct imports - small and always needed)
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorFallback from './components/ErrorFallback';
import LoadingSpinner from './components/LoadingSpinner';
import { logReactError } from './utils/errorLogger';

// Lazy-loaded Pages (code splitting by route)
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const PasswordResetPage = lazy(() => import('./pages/PasswordResetPage'));
const ProjectPage = lazy(() => import('./pages/ProjectPage'));
const EditorPage = lazy(() => import('./pages/EditorPage'));
const StoryBiblePage = lazy(() => import('./pages/StoryBiblePage'));
const VisualPlanningPage = lazy(() => import('./pages/VisualPlanningPage').then(module => ({ default: module.VisualPlanningPage })));
const ContinuityPage = lazy(() => import('./pages/ContinuityPage').then(module => ({ default: module.ContinuityPage })));

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
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error to error tracking service
    logReactError(error, errorInfo, {
      component: 'App',
    });
  };

  return (
    <ErrorBoundary fallback={<ErrorFallback />} onError={handleError}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Suspense fallback={<LoadingSpinner fullPage message="Loading..." />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/reset-password" element={<PasswordResetPage />} />

                {/* Protected routes - require authentication */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/project/:id"
                  element={
                    <ProtectedRoute>
                      <ProjectPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/project/:id/editor"
                  element={
                    <ProtectedRoute>
                      <EditorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/project/:id/story-bible"
                  element={
                    <ProtectedRoute>
                      <StoryBiblePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/project/:projectId/planning"
                  element={
                    <ProtectedRoute>
                      <VisualPlanningPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/project/:projectId/continuity"
                  element={
                    <ProtectedRoute>
                      <ContinuityPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
