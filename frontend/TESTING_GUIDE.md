# Testing Guide

## Overview

This project uses Jest and React Testing Library for unit and integration testing.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- --testPathPattern="LoadingSpinner"

# Run tests with coverage
npm test -- --coverage

# Run tests without watch mode (CI)
npm test -- --watchAll=false
```

## Test Structure

```
src/
├── components/
│   ├── __tests__/
│   │   ├── ErrorBoundary.test.tsx
│   │   ├── LoadingSpinner.test.tsx
│   │   └── LazyImage.test.tsx
│   └── ...
├── utils/
│   └── testUtils.tsx
└── setupTests.ts
```

## Test Utilities

Located in `src/utils/testUtils.tsx`:

### Custom Render Functions

```typescript
import { render } from '../utils/testUtils';

// Renders component with Router + Theme providers
render(<MyComponent />);
```

### Helper Functions

```typescript
// Mock IntersectionObserver
mockIntersectionObserver();

// Trigger intersection
triggerIntersection(element, true);

// Create mock user
const user = createMockUser({ email: 'custom@test.com' });

// Suppress console errors
suppressConsoleError();
```

## Writing Tests

### Basic Component Test

```typescript
import { render, screen } from '../../utils/testUtils';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Testing User Interactions

```typescript
import { render, screen, fireEvent } from '../../utils/testUtils';

test('handles click', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);

  fireEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalled();
});
```

### Testing Async Behavior

```typescript
import { render, screen, waitFor } from '../../utils/testUtils';

test('loads data', async () => {
  render(<DataComponent />);

  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### Testing Accessibility

```typescript
test('accessibility: has proper heading', () => {
  render(<MyComponent />);

  const heading = screen.getByRole('heading', { name: /title/i });
  expect(heading).toBeInTheDocument();
});

test('accessibility: button is keyboard accessible', () => {
  render(<MyComponent />);

  const button = screen.getByRole('button');
  expect(button).toBeEnabled();
});
```

## Test Coverage Goals

- **Unit Tests**: All utility functions and helpers
- **Component Tests**: All reusable components
- **Integration Tests**: Key user flows
- **Accessibility Tests**: ARIA roles, keyboard navigation
- **Error Handling Tests**: Error boundaries, fallbacks

## Current Test Status

### ✅ Tested Components
- `LoadingSpinner`: 13/13 tests passing
- `ErrorBoundary`: Most tests passing
- `LazyImage`: Most tests passing

### ⏳ To Be Tested
- Authentication components (LoginPage, SignupPage)
- Main pages (HomePage, EditorPage)
- Forms and inputs
- API integration
- Error states

## Mocking

### Firebase

Firebase is automatically mocked in `setupTests.ts`:

```typescript
// Already configured, no need to do anything
test('uses auth', () => {
  // Firebase auth is mocked automatically
});
```

### Sentry

Sentry is automatically mocked in `setupTests.ts`:

```typescript
// Already configured
test('logs error', () => {
  // Sentry is mocked automatically
});
```

### API Calls

```typescript
import { mockAxios } from '../utils/testUtils';

test('fetches data', async () => {
  mockAxios.get.mockResolvedValue({ data: { message: 'Success' } });

  // Your test code
});
```

## Best Practices

### ✅ DO:
- Test user-facing behavior, not implementation
- Use accessible queries (getByRole, getByLabelText)
- Test error states and edge cases
- Keep tests independent and isolated
- Use descriptive test names
- Test accessibility

### ❌ DON'T:
- Test implementation details
- Use querySelector when testing-library queries work
- Have tests depend on each other
- Mock everything (only mock external dependencies)
- Ignore failing tests

## Debugging Tests

### View Rendered Output

```typescript
import { render, screen } from '../../utils/testUtils';

test('debug', () => {
  const { debug } = render(<MyComponent />);
  debug(); // Prints the DOM to console
});
```

### Query Failures

```typescript
// If getByText fails, try:
screen.getByText('text', { exact: false }); // Case-insensitive
screen.getByText(/text/i); // Regex
screen.debug(); // See what's actually rendered
```

### Async Issues

```typescript
// If element appears after delay:
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Or use findBy (combines waitFor + getBy):
const element = await screen.findByText('Loaded');
```

## CI/CD Integration

Tests run automatically on:
- Pre-commit (optional with husky)
- Pull requests (GitHub Actions)
- Before deployment

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
