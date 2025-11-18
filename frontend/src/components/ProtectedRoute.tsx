import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component - Wraps routes that require authentication
 *
 * Usage:
 *   <Route path="/protected" element={
 *     <ProtectedRoute>
 *       <ProtectedPage />
 *     </ProtectedRoute>
 *   } />
 *
 * If user is not authenticated, redirects to /login
 * If user is authenticated, renders children
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
}
