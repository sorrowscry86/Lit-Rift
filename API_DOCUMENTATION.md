# Lit-Rift API Documentation

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

Get the token from Firebase Auth:
```javascript
const token = await currentUser.getIdToken();
```

## API Endpoints

### Projects

#### GET /projects
Get all projects for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "string",
    "title": "string",
    "author": "string",
    "genre": "string",
    "description": "string",
    "userId": "string",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

---

#### POST /projects
Create a new project.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "string (required, 1-200 chars)",
  "author": "string (required, 1-100 chars)",
  "genre": "string (required, 1-50 chars)",
  "description": "string (optional, max 1000 chars)"
}
```

**Response:** `201 Created`
```json
{
  "id": "string",
  "title": "string",
  "author": "string",
  "genre": "string",
  "description": "string",
  "userId": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Error Responses:**
- `400 Bad Request`: Validation error
  ```json
  {
    "error": "Title is required and must be 1-200 characters"
  }
  ```
- `401 Unauthorized`: Missing or invalid token
- `429 Too Many Requests`: Rate limit exceeded (60 requests/minute)
- `500 Internal Server Error`: Server error

---

#### GET /projects/:id
Get a specific project by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` (string): Project ID

**Response:** `200 OK`
```json
{
  "id": "string",
  "title": "string",
  "author": "string",
  "genre": "string",
  "description": "string",
  "userId": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not own this project
- `404 Not Found`: Project not found
- `500 Internal Server Error`: Server error

---

#### PUT /projects/:id
Update a project.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `id` (string): Project ID

**Request Body:**
```json
{
  "title": "string (optional, 1-200 chars)",
  "author": "string (optional, 1-100 chars)",
  "genre": "string (optional, 1-50 chars)",
  "description": "string (optional, max 1000 chars)"
}
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "title": "string",
  "author": "string",
  "genre": "string",
  "description": "string",
  "userId": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Error Responses:**
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not own this project
- `404 Not Found`: Project not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

#### DELETE /projects/:id
Delete a project.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` (string): Project ID

**Response:** `200 OK`
```json
{
  "message": "Project deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not own this project
- `404 Not Found`: Project not found
- `500 Internal Server Error`: Server error

---

### Scenes

#### GET /projects/:projectId/scenes
Get all scenes for a project.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `projectId` (string): Project ID

**Response:** `200 OK`
```json
[
  {
    "id": "string",
    "projectId": "string",
    "title": "string",
    "content": "string",
    "order": "number",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
]
```

---

#### POST /projects/:projectId/scenes
Create a new scene.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `projectId` (string): Project ID

**Request Body:**
```json
{
  "title": "string (required, 1-200 chars)",
  "content": "string (optional)",
  "order": "number (optional)"
}
```

**Response:** `201 Created`
```json
{
  "id": "string",
  "projectId": "string",
  "title": "string",
  "content": "string",
  "order": "number",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

### AI Generation

#### POST /ai/generate
Generate AI content for writing assistance.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "string (required, 1-2000 chars)",
  "type": "string (optional: 'character', 'scene', 'dialogue', 'description')",
  "context": "string (optional, additional context)"
}
```

**Response:** `200 OK`
```json
{
  "generated": "string",
  "tokensUsed": "number"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid prompt or parameters
- `401 Unauthorized`: Missing or invalid token
- `429 Too Many Requests`: Rate limit exceeded (10 requests/minute for AI endpoints)
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: AI service temporarily unavailable

---

## Rate Limiting

Rate limits are applied per user:

- **Standard endpoints**: 60 requests/minute
- **AI endpoints**: 10 requests/minute

When rate limited, you'll receive a `429 Too Many Requests` response:

```json
{
  "error": "Rate limit exceeded. Please try again in 30 seconds",
  "retryAfter": 30
}
```

The response includes a `Retry-After` header indicating when you can retry.

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message description",
  "details": "Optional additional details"
}
```

### Common Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request parameters or validation error |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User doesn't have permission to access resource |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Service temporarily unavailable |

---

## Authentication Guide

### Getting an ID Token

```javascript
import { auth } from './config/firebase';

const getIdToken = async () => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    return token;
  }
  throw new Error('User not authenticated');
};
```

### Making Authenticated Requests

```javascript
const fetchProjects = async () => {
  const token = await getIdToken();

  const response = await fetch('http://localhost:5000/api/projects', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return response.json();
};
```

### Handling Token Refresh

Firebase automatically refreshes tokens. Always call `getIdToken()` before each request:

```javascript
// ✅ Good - Fresh token for each request
const token = await currentUser.getIdToken();

// ❌ Bad - Token may expire
const token = await currentUser.getIdToken();
// ... later requests use stale token
```

---

## Validation Rules

### Project Validation

| Field | Type | Required | Min Length | Max Length | Notes |
|-------|------|----------|------------|------------|-------|
| title | string | Yes | 1 | 200 | Cannot be only whitespace |
| author | string | Yes | 1 | 100 | Cannot be only whitespace |
| genre | string | Yes | 1 | 50 | Cannot be only whitespace |
| description | string | No | 0 | 1000 | Optional field |

### Scene Validation

| Field | Type | Required | Min Length | Max Length | Notes |
|-------|------|----------|------------|------------|-------|
| title | string | Yes | 1 | 200 | Cannot be only whitespace |
| content | string | No | 0 | - | No limit on content length |
| order | number | No | - | - | Auto-assigned if not provided |

### AI Generation Validation

| Field | Type | Required | Min Length | Max Length | Notes |
|-------|------|----------|------------|------------|-------|
| prompt | string | Yes | 1 | 2000 | Clear, specific prompts work best |
| type | string | No | - | - | One of: character, scene, dialogue, description |
| context | string | No | 0 | 1000 | Additional context for better results |

---

## API Client Example

Complete TypeScript example using the API:

```typescript
import axios from 'axios';
import { auth } from './config/firebase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with interceptor for auth
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to all requests
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions
export const projectAPI = {
  getAll: () => apiClient.get('/projects'),
  getById: (id: string) => apiClient.get(`/projects/${id}`),
  create: (data: any) => apiClient.post('/projects', data),
  update: (id: string, data: any) => apiClient.put(`/projects/${id}`, data),
  delete: (id: string) => apiClient.delete(`/projects/${id}`)
};

export const sceneAPI = {
  getAll: (projectId: string) => apiClient.get(`/projects/${projectId}/scenes`),
  create: (projectId: string, data: any) =>
    apiClient.post(`/projects/${projectId}/scenes`, data)
};

export const aiAPI = {
  generate: (data: any) => apiClient.post('/ai/generate', data)
};
```

---

## Testing the API

### Using cURL

```bash
# Get ID token from Firebase (use browser dev tools or Firebase SDK)
TOKEN="your-firebase-id-token"

# Get all projects
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/projects

# Create a project
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Novel","author":"John Doe","genre":"Fantasy","description":"An epic tale"}' \
  http://localhost:5000/api/projects

# Get specific project
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/projects/PROJECT_ID
```

### Using Postman

1. Set request type (GET, POST, etc.)
2. Enter URL: `http://localhost:5000/api/projects`
3. Add header:
   - Key: `Authorization`
   - Value: `Bearer <your-firebase-token>`
4. For POST/PUT, add request body as JSON

---

## WebSocket Support (Future)

Real-time collaboration features are planned for a future release. Subscribe to project updates for notifications:

```javascript
// Coming soon
socket.on('project:updated', (projectId) => {
  // Refresh project data
});
```

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- Project CRUD operations
- Scene management
- AI content generation
- Rate limiting and authentication

---

## Support

For API issues or questions:
- GitHub Issues: https://github.com/yourusername/lit-rift/issues
- Email: support@lit-rift.com

---

Last Updated: 2025-11-18
