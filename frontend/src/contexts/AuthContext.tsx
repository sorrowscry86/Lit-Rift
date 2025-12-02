import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, isOfflineMode } from '../config/firebase';
import { setSentryUser, clearSentryUser } from '../config/sentry';

// Mock user for offline mode
interface OfflineUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  getIdToken: () => Promise<string>;
}

interface AuthContextType {
  currentUser: User | OfflineUser | null;
  loading: boolean;
  isOffline: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export AuthContext for testing purposes
export { AuthContext };

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

// Create offline user from localStorage
const getOfflineUser = (): OfflineUser | null => {
  const storedUser = localStorage.getItem('litrift_offline_user');
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  }
  return null;
};

const saveOfflineUser = (user: OfflineUser) => {
  localStorage.setItem('litrift_offline_user', JSON.stringify(user));
};

const clearOfflineUser = () => {
  localStorage.removeItem('litrift_offline_user');
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | OfflineUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Login with email and password
  const login = async (email: string, password: string) => {
    if (isOfflineMode) {
      // Offline mode: create local user session
      const offlineUser: OfflineUser = {
        uid: `offline_${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        emailVerified: true,
        getIdToken: async () => 'offline_token',
      };
      saveOfflineUser(offlineUser);
      setCurrentUser(offlineUser);
      return;
    }
    
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Sign up with email and password
  const signup = async (email: string, password: string) => {
    if (isOfflineMode) {
      // Offline mode: create local user
      const offlineUser: OfflineUser = {
        uid: `offline_${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        emailVerified: true,
        getIdToken: async () => 'offline_token',
      };
      saveOfflineUser(offlineUser);
      setCurrentUser(offlineUser);
      return;
    }
    
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Send email verification after signup
    if (userCredential.user) {
      try {
        await sendEmailVerification(userCredential.user);
      } catch (error) {
        console.error('Error sending verification email:', error);
        // Don't fail signup if verification email fails
      }
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    if (isOfflineMode) {
      throw new Error('Google login is not available in offline mode. Please configure Firebase.');
    }
    
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  // Logout
  const logout = async () => {
    if (isOfflineMode) {
      clearOfflineUser();
      setCurrentUser(null);
      return;
    }
    
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }
    await signOut(auth);
  };

  // Get ID token with automatic refresh
  const getIdToken = async (): Promise<string | null> => {
    if (!currentUser) {
      return null;
    }
    
    if (isOfflineMode) {
      return 'offline_token';
    }
    
    try {
      // forceRefresh: false - Firebase will automatically refresh if needed
      const token = await (currentUser as User).getIdToken(false);
      return token;
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    if (isOfflineMode) {
      // Offline mode: check localStorage for existing user
      const offlineUser = getOfflineUser();
      setCurrentUser(offlineUser);
      setLoading(false);
      return;
    }
    
    if (!auth) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);

      // Set or clear Sentry user context
      if (user) {
        setSentryUser({
          id: user.uid,
          email: user.email || undefined,
          username: user.displayName || undefined,
        });
      } else {
        clearSentryUser();
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    isOffline: isOfflineMode,
    login,
    signup,
    logout,
    loginWithGoogle,
    getIdToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
