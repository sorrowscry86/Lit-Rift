# Lit-Rift Component Documentation

## Table of Contents

1. [Component Architecture](#component-architecture)
2. [Core Components](#core-components)
3. [Authentication Components](#authentication-components)
4. [UI Components](#ui-components)
5. [Context Providers](#context-providers)
6. [Custom Hooks](#custom-hooks)
7. [Styling Guide](#styling-guide)

---

## Component Architecture

Lit-Rift follows a modern React component architecture with:

- **Functional Components** with React Hooks
- **TypeScript** for type safety
- **Material-UI** for consistent design
- **Context API** for global state management
- **React Router** for navigation

### Directory Structure

```
frontend/src/
├── components/       # Reusable UI components
│   ├── ErrorBoundary.tsx
│   ├── LoadingSpinner.tsx
│   ├── LazyImage.tsx
│   ├── ProtectedRoute.tsx
│   ├── SkipToContent.tsx
│   └── UserMenu.tsx
├── contexts/         # Context providers
│   ├── AuthContext.tsx
│   └── ToastContext.tsx
├── pages/            # Page-level components
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── PasswordResetPage.tsx
│   └── ProjectEditorPage.tsx
├── utils/            # Utility functions
│   ├── api.ts
│   ├── errorLogger.ts
│   └── performanceMonitoring.ts
└── styles/           # Global styles
    └── accessibility.css
```

---

## Core Components

### App.tsx

Main application component with routing and providers.

**Features:**
- Route configuration with lazy loading
- Authentication provider wrapping
- Toast notification provider
- Skip-to-content accessibility link
- Loading boundaries with Suspense

**Usage:**
```tsx
function App() {
  return (
    <SkipToContent />
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner fullPage />}>
            <Routes>
              {/* Routes */}
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}
```

---

### ErrorBoundary

Catches and handles React errors gracefully.

**Props:**
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;  // Custom error UI
}
```

**Usage:**
```tsx
<ErrorBoundary fallback={<CustomErrorPage />}>
  <YourComponent />
</ErrorBoundary>
```

**Features:**
- Automatic error logging to Sentry
- Graceful fallback UI
- Error recovery with reload button
- Stack trace logging in development

**State:**
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
```

---

### LoadingSpinner

Displays loading state with optional full-page overlay.

**Props:**
```typescript
interface LoadingSpinnerProps {
  size?: number;           // Spinner size (default: 40)
  fullPage?: boolean;      // Full-page overlay (default: false)
  message?: string;        // Loading message
  color?: 'primary' | 'secondary' | 'inherit';
}
```

**Usage:**
```tsx
// Inline spinner
<LoadingSpinner size={24} message="Loading..." />

// Full-page overlay
<LoadingSpinner fullPage message="Loading your projects..." />
```

**Features:**
- Material-UI CircularProgress
- Optional overlay with backdrop
- Customizable size and color
- Accessibility labels

---

### LazyImage

Optimized image component with lazy loading and WebP support.

**Props:**
```typescript
interface LazyImageProps {
  src: string;                    // Image URL
  webpSrc?: string;              // WebP version URL
  alt: string;                   // Alt text (required)
  width?: string | number;       // Width (default: '100%')
  height?: string | number;      // Height (default: 'auto')
  objectFit?: 'cover' | 'contain' | 'fill';
  borderRadius?: number;         // Border radius in pixels
  loading?: 'lazy' | 'eager';    // Loading strategy
  srcSet?: string;               // Responsive image sources
  sizes?: string;                // Image sizes for responsiveness
}
```

**Usage:**
```tsx
<LazyImage
  src="/images/cover.jpg"
  webpSrc="/images/cover.webp"
  alt="Book cover"
  width={300}
  height={400}
  objectFit="cover"
  borderRadius={8}
  loading="lazy"
/>
```

**Features:**
- Intersection Observer lazy loading
- WebP format with automatic fallback
- Responsive images (srcSet, sizes)
- Loading skeleton placeholder
- Error handling with fallback UI
- Performance optimized

**Helper Functions:**
```typescript
// Generate WebP URL
const webpUrl = toWebP('/images/photo.jpg');

// Generate srcSet for responsive images
const srcSet = generateSrcSet('/images/photo.jpg', [400, 800, 1200]);

// Generate sizes attribute
const sizes = generateSizes({ sm: 400, md: 800, lg: 1200 });
```

---

### ProtectedRoute

Route wrapper that requires authentication.

**Props:**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
}
```

**Usage:**
```tsx
<Route
  path="/editor/:id"
  element={
    <ProtectedRoute>
      <ProjectEditorPage />
    </ProtectedRoute>
  }
/>
```

**Features:**
- Automatic redirect to /login if not authenticated
- Uses replace navigation (no back button to protected route)
- Integrates with AuthContext

---

### SkipToContent

Accessibility component for keyboard navigation.

**Usage:**
```tsx
<SkipToContent />
<Box id="main-content" component="main">
  {/* Main content */}
</Box>
```

**Features:**
- WCAG 2.1 Level A requirement
- Visible only on keyboard focus
- Skips to main content area
- Improves keyboard navigation

---

### UserMenu

User account menu with avatar and dropdown.

**Features:**
- User avatar with fallback to AccountCircle icon
- Dropdown menu with user actions
- Settings navigation
- Logout functionality
- ARIA labels for accessibility

**Usage:**
```tsx
// Automatically used in navigation
<UserMenu />
```

**Menu Items:**
- Settings (navigates to /settings)
- Logout (signs out user)

---

## Authentication Components

### LoginPage

Email/password and Google sign-in page.

**Features:**
- Email/password authentication
- Google OAuth sign-in
- Form validation
- Error handling with user-friendly messages
- Loading states
- Links to signup and password reset

**Validation:**
- Required fields check
- Email format validation
- Firebase error parsing

**Error Messages:**
| Firebase Error | User Message |
|----------------|--------------|
| auth/user-not-found | No account found with this email |
| auth/wrong-password | Incorrect password |
| auth/invalid-email | Invalid email address |
| auth/user-disabled | This account has been disabled |
| auth/too-many-requests | Too many failed login attempts |

---

### SignupPage

User registration page.

**Features:**
- Email/password registration
- Google OAuth signup
- Password confirmation
- Comprehensive validation
- Email verification sent automatically

**Validation Rules:**
- All fields required
- Valid email format
- Password minimum 6 characters
- Passwords must match

**Error Messages:**
| Firebase Error | User Message |
|----------------|--------------|
| auth/email-already-in-use | An account with this email already exists |
| auth/invalid-email | Invalid email address |
| auth/weak-password | Password is too weak (min 6 chars) |
| auth/operation-not-allowed | Email/password accounts disabled |

---

### PasswordResetPage

Password reset request page.

**Features:**
- Email validation
- Password reset email sending
- Success confirmation
- Error handling
- Back to login link

**Flow:**
1. User enters email
2. Validation checks
3. Firebase sends reset email
4. Success message displayed
5. User checks email for reset link

---

## UI Components

### ProjectCardSkeleton

Loading skeleton for project cards.

**Usage:**
```tsx
{loading ? (
  <ProjectCardSkeleton count={6} />
) : (
  projects.map(project => <ProjectCard project={project} />)
)}
```

**Features:**
- Animated Material-UI Skeleton
- Matches ProjectCard layout
- Configurable count

---

## Context Providers

### AuthContext

Global authentication state management.

**Context Type:**
```typescript
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}
```

**Usage:**
```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { currentUser, login, logout } = useAuth();

  if (!currentUser) {
    return <LoginPrompt />;
  }

  return <div>Welcome, {currentUser.email}</div>;
}
```

**Features:**
- Firebase authentication integration
- Auto-token refresh
- Sentry user context integration
- Email verification after signup
- Persistent auth state

---

### ToastContext

Global toast notification system.

**Context Type:**
```typescript
interface ToastContextType {
  showToast: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}
```

**Usage:**
```tsx
import { useToast } from '../contexts/ToastContext';

function MyComponent() {
  const { showSuccess, showError } = useToast();

  const handleSubmit = async () => {
    try {
      await saveData();
      showSuccess('Data saved successfully!');
    } catch (error) {
      showError('Failed to save data');
    }
  };
}
```

**Features:**
- Material-UI Snackbar with Alert
- Auto-hide after 6 seconds
- Four severity levels
- Queue management (one toast at a time)
- Accessible announcements

---

## Custom Hooks

### useAuth()

Access authentication context.

**Returns:**
```typescript
{
  currentUser: User | null;
  loading: boolean;
  login: (email, password) => Promise<void>;
  signup: (email, password) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}
```

**Example:**
```tsx
const { currentUser, logout } = useAuth();

const handleLogout = async () => {
  await logout();
  navigate('/login');
};
```

---

### useToast()

Access toast notification context.

**Returns:**
```typescript
{
  showToast: (message, severity?) => void;
  showSuccess: (message) => void;
  showError: (message) => void;
  showWarning: (message) => void;
  showInfo: (message) => void;
}
```

**Example:**
```tsx
const { showSuccess, showError } = useToast();

try {
  await createProject(data);
  showSuccess('Project created!');
} catch (err) {
  showError('Failed to create project');
}
```

---

## Styling Guide

### Theme Configuration

Material-UI theme with dark mode:

```typescript
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',  // Indigo
    },
    secondary: {
      main: '#ec4899',  // Pink
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});
```

### Accessibility Styles

Global accessibility styles in `styles/accessibility.css`:

**Focus Styles:**
```css
*:focus-visible {
  outline: 2px solid #6366f1 !important;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
}
```

**Touch Targets:**
```css
button, a, [role="button"] {
  min-height: 44px;
  min-width: 44px;
}
```

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Component Best Practices

### 1. TypeScript Types

Always define prop types:

```typescript
interface MyComponentProps {
  title: string;
  onSave: (data: FormData) => Promise<void>;
  isLoading?: boolean;
}

export default function MyComponent({ title, onSave, isLoading = false }: MyComponentProps) {
  // Implementation
}
```

### 2. Error Handling

Use try-catch with error logging:

```typescript
const handleAction = async () => {
  try {
    await performAction();
    showSuccess('Action completed');
  } catch (error) {
    console.error('Action failed:', error);
    logError(error, { component: 'MyComponent', action: 'handleAction' });
    showError('Failed to complete action');
  }
};
```

### 3. Loading States

Always provide loading feedback:

```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await api.getData();
    setData(data);
  } finally {
    setLoading(false);
  }
};

return loading ? <LoadingSpinner /> : <DataDisplay data={data} />;
```

### 4. Accessibility

Include ARIA labels and semantic HTML:

```tsx
<button aria-label="Delete project" onClick={handleDelete}>
  <DeleteIcon />
</button>

<nav aria-label="Main navigation">
  <Link to="/">Home</Link>
  <Link to="/projects">Projects</Link>
</nav>
```

### 5. Code Splitting

Use React.lazy for route-level splitting:

```typescript
const ProjectEditorPage = React.lazy(() => import('./pages/ProjectEditorPage'));

<Route
  path="/editor/:id"
  element={
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <ProtectedRoute>
        <ProjectEditorPage />
      </ProtectedRoute>
    </Suspense>
  }
/>
```

---

## Testing Components

### Basic Test Structure

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Testing with Context

```typescript
import { AuthContext } from '../contexts/AuthContext';

const mockAuthValue = {
  currentUser: { uid: 'test-id', email: 'test@example.com' },
  // ...other auth methods
};

render(
  <AuthContext.Provider value={mockAuthValue}>
    <MyComponent />
  </AuthContext.Provider>
);
```

---

## Performance Optimization

### Memoization

Use React.memo for expensive components:

```typescript
export default React.memo(MyComponent, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id;
});
```

### useCallback for Functions

```typescript
const handleClick = useCallback(() => {
  performAction(id);
}, [id]);
```

### useMemo for Computed Values

```typescript
const filteredProjects = useMemo(() => {
  return projects.filter(p => p.genre === selectedGenre);
}, [projects, selectedGenre]);
```

---

## Future Enhancements

Planned component additions:

- [ ] Rich text editor component
- [ ] Character management cards
- [ ] Story structure visualization
- [ ] Collaboration indicators
- [ ] Version history viewer
- [ ] Export format selector

---

Last Updated: 2025-11-18
