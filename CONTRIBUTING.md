# Contributing to Lit-Rift

Thank you for your interest in contributing to Lit-Rift! This document provides guidelines and instructions for contributing.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Message Conventions](#commit-message-conventions)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors.

### Standards
- Be respectful and considerate
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

---

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Python 3.9+
- Git
- A code editor (VS Code recommended)

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/Lit-Rift.git
   cd Lit-Rift
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/sorrowscry86/Lit-Rift.git
   ```

3. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   pip install -r requirements.txt

   # Install frontend dependencies
   cd ../frontend
   npm install --legacy-peer-deps
   ```

4. **Set up environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your API keys

   # Frontend
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your configuration
   ```

5. **Run the development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   python app.py

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

---

## Development Workflow

### Creating a New Feature

1. **Sync with upstream**
   ```bash
   git checkout main
   git fetch upstream
   git merge upstream/main
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow the style guidelines
   - Add tests for new functionality
   - Update documentation as needed

4. **Test your changes**
   ```bash
   # Backend tests
   cd backend
   pytest

   # Frontend tests
   cd frontend
   npm test

   # Build check
   npm run build
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to GitHub and create a PR from your fork to the main repository
   - Fill out the PR template
   - Link any related issues

---

## Code Style Guidelines

### Python (Backend)

**Style**: Follow PEP 8

```python
# Good
def generate_scene(character_ids: list[str], location_id: str, prompt: str) -> dict:
    """
    Generate a scene with AI assistance.

    Args:
        character_ids: List of character IDs to include
        location_id: Location where scene takes place
        prompt: User's generation prompt

    Returns:
        dict: Generated scene data with text and metadata
    """
    context = build_context(character_ids, location_id)
    result = call_gemini_api(context, prompt)
    return result

# Bad
def genScene(chars,loc,p):
    ctx=buildCtx(chars,loc)
    return callAPI(ctx,p)
```

**Best Practices:**
- Use type hints for function parameters and returns
- Write docstrings for all public functions
- Keep functions focused (single responsibility)
- Use meaningful variable names
- Avoid magic numbers (use constants)
- Handle errors gracefully

### TypeScript/React (Frontend)

**Style**: Follow Airbnb React/JSX Style Guide

```typescript
// Good
interface CharacterCardProps {
  character: Character;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onEdit,
  onDelete
}) => {
  const handleEdit = () => onEdit(character.id);

  return (
    <Card>
      <Typography variant="h5">{character.name}</Typography>
      <Button onClick={handleEdit}>Edit</Button>
    </Card>
  );
};

// Bad
export const CharCard = (props: any) => (
  <Card>
    <h5>{props.char.name}</h5>
    <Button onClick={() => props.onEdit(props.char.id)}>Edit</Button>
  </Card>
);
```

**Best Practices:**
- Use TypeScript strictly (no `any` types)
- Define interfaces for props and state
- Use functional components with hooks
- Extract reusable logic into custom hooks
- Keep components small and focused
- Use meaningful component and prop names

### File Naming

- **Python**: `snake_case.py` (e.g., `story_bible_service.py`)
- **TypeScript/React**: `PascalCase.tsx` for components (e.g., `CharacterCard.tsx`)
- **TypeScript**: `camelCase.ts` for utilities (e.g., `apiClient.ts`)
- **Test files**: `*.test.ts` or `*.test.tsx`

---

## Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
# Good commits
git commit -m "feat(editor): add auto-save functionality"
git commit -m "fix(api): resolve continuity check timeout issue"
git commit -m "docs: update API documentation for new endpoints"
git commit -m "refactor(story-bible): extract character service logic"
git commit -m "test(editor): add unit tests for AI generation"

# Bad commits
git commit -m "fix stuff"
git commit -m "WIP"
git commit -m "updates"
```

### Detailed Example
```bash
git commit -m "feat(planning): add drag-and-drop corkboard view

Implemented interactive corkboard with react-dnd for visual planning.
Users can now:
- Drag note cards around the canvas
- Link cards to scenes and characters
- Save positions for persistence

Closes #42"
```

---

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass**
   ```bash
   npm run test:backend
   npm run test:frontend
   ```

2. **Ensure builds succeed**
   ```bash
   cd frontend
   npm run build
   ```

3. **Update documentation**
   - Update README if adding features
   - Update API docs if changing endpoints
   - Add JSDoc/docstrings for new functions

4. **Self-review your code**
   - Read through your changes
   - Remove debug code and console.logs
   - Check for TODO comments
   - Verify no secrets in code

### PR Guidelines

1. **Fill out the PR template completely**
2. **Keep PRs focused** - One feature/fix per PR
3. **Write a clear title** - Use conventional commit format
4. **Link related issues** - Use "Fixes #123" or "Closes #456"
5. **Add screenshots** - For UI changes
6. **Request reviewers** - Tag relevant maintainers
7. **Respond to feedback** - Be open to suggestions

### Review Process

1. At least one maintainer must approve
2. All CI checks must pass
3. No merge conflicts
4. Documentation updated
5. Tests added for new features

### After Merge

1. **Delete your feature branch**
   ```bash
   git branch -d feature/your-feature-name
   git push origin --delete feature/your-feature-name
   ```

2. **Update your main branch**
   ```bash
   git checkout main
   git pull upstream main
   ```

---

## Testing Guidelines

### Backend Testing (pytest)

**Location**: `backend/tests/`

```python
# backend/tests/test_story_bible_service.py
import pytest
from services.story_bible_service import StoryBibleService

def test_create_character():
    """Test character creation with valid data"""
    service = StoryBibleService()
    character = service.create_character(
        project_id="test-project",
        data={
            "name": "Test Hero",
            "role": "Protagonist",
            "traits": ["brave", "clever"]
        }
    )

    assert character["name"] == "Test Hero"
    assert "id" in character
    assert character["role"] == "Protagonist"
```

**Run tests:**
```bash
cd backend
pytest                          # Run all tests
pytest tests/test_api.py       # Run specific file
pytest -v                       # Verbose output
pytest --cov                    # With coverage
```

### Frontend Testing (Jest + React Testing Library)

**Location**: `frontend/src/**/*.test.tsx`

```typescript
// CharacterCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterCard } from './CharacterCard';

test('renders character name', () => {
  const character = {
    id: '1',
    name: 'Test Hero',
    role: 'Protagonist',
    traits: []
  };

  render(<CharacterCard character={character} onEdit={() => {}} />);
  expect(screen.getByText('Test Hero')).toBeInTheDocument();
});

test('calls onEdit when edit button clicked', () => {
  const handleEdit = jest.fn();
  const character = { id: '1', name: 'Hero', role: 'Protagonist', traits: [] };

  render(<CharacterCard character={character} onEdit={handleEdit} />);
  fireEvent.click(screen.getByText('Edit'));
  expect(handleEdit).toHaveBeenCalledWith('1');
});
```

**Run tests:**
```bash
cd frontend
npm test                 # Interactive mode
npm test -- --coverage   # With coverage
npm test -- --watchAll   # Watch mode
```

### Test Coverage Goals
- **Backend**: >80% coverage
- **Frontend**: >70% coverage for components
- **Critical paths**: 100% coverage (auth, data persistence)

---

## Documentation

### Code Documentation

**Python (Docstrings)**
```python
def generate_scene(self, project_id: str, scene_data: dict) -> dict:
    """
    Generate scene content using AI based on Story Bible context.

    Args:
        project_id: Unique identifier for the project
        scene_data: Dictionary containing scene parameters
            - characters: List of character IDs
            - location: Location ID
            - prompt: User's generation prompt
            - tone: Desired tone (dramatic, humorous, etc.)
            - length: Desired length (short, medium, long)

    Returns:
        dict: Generated scene with keys:
            - text: Generated scene text
            - word_count: Number of words
            - metadata: Generation parameters used

    Raises:
        ValueError: If required fields are missing
        APIError: If Gemini API call fails
    """
```

**TypeScript (JSDoc)**
```typescript
/**
 * Fetches a character by ID from the API
 * @param projectId - The project containing the character
 * @param characterId - The character's unique identifier
 * @returns Promise resolving to the character data
 * @throws {APIError} If the request fails or character not found
 */
export async function getCharacter(
  projectId: string,
  characterId: string
): Promise<Character> {
  // implementation
}
```

### README Updates

When adding features, update the appropriate README section:
- Features list
- Setup instructions
- Usage examples
- API endpoints (in docs/API.md)

### Architecture Documentation

For significant changes, update:
- `ARCHITECTURE.md` - System design
- `DEVELOPMENT.md` - Implementation details
- `DEVELOPMENT_ROADMAP.md` - Future plans

---

## Common Tasks

### Adding a New API Endpoint

1. **Define the route** (`backend/routes/`)
   ```python
   @bp.route('/new-endpoint', methods=['POST'])
   def new_endpoint():
       data = request.json
       result = service.do_something(data)
       return jsonify(result)
   ```

2. **Add service logic** (`backend/services/`)
   ```python
   def do_something(self, data: dict) -> dict:
       # Business logic here
       return result
   ```

3. **Update API docs** (`docs/API.md`)
   ```markdown
   ### POST /api/new-endpoint
   Description of what it does

   **Request:**
   ```json
   { "field": "value" }
   ```

   **Response:**
   ```json
   { "result": "success" }
   ```
   ```

4. **Add frontend service** (`frontend/src/services/`)
   ```typescript
   export async function callNewEndpoint(data: RequestData): Promise<Response> {
     return api.post('/api/new-endpoint', data);
   }
   ```

5. **Write tests**

### Adding a New UI Component

1. **Create component** (`frontend/src/components/`)
   ```typescript
   // NewComponent.tsx
   interface NewComponentProps {
     // props
   }

   export const NewComponent: React.FC<NewComponentProps> = (props) => {
     return <div>Component content</div>;
   };
   ```

2. **Add TypeScript types** (if needed)
   ```typescript
   // types/index.ts
   export interface NewEntity {
     id: string;
     name: string;
   }
   ```

3. **Write tests**
   ```typescript
   // NewComponent.test.tsx
   import { render } from '@testing-library/react';
   import { NewComponent } from './NewComponent';

   test('renders correctly', () => {
     render(<NewComponent />);
     // assertions
   });
   ```

4. **Use in pages**

---

## Getting Help

- **Questions**: Open a GitHub Discussion or issue with the "question" label
- **Bugs**: Open an issue with the bug report template
- **Features**: Open an issue with the feature request template
- **Security**: Email security concerns privately (don't open public issues)

---

## License

By contributing to Lit-Rift, you agree that your contributions will be licensed under the project's license.

---

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- CHANGELOG.md for significant contributions
- README.md for major features

Thank you for contributing to Lit-Rift! 🚀📚
