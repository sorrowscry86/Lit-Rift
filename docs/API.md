# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### Story Bible

#### Projects
- `GET /story-bible/projects` - List all projects
- `POST /story-bible/projects` - Create a new project
- `GET /story-bible/projects/{id}` - Get project details

#### Characters
- `GET /story-bible/projects/{id}/characters` - List characters
- `POST /story-bible/projects/{id}/characters` - Create character
- `GET /story-bible/projects/{id}/characters/{char_id}` - Get character
- `PUT /story-bible/projects/{id}/characters/{char_id}` - Update character
- `DELETE /story-bible/projects/{id}/characters/{char_id}` - Delete character

#### Locations
- `GET /story-bible/projects/{id}/locations` - List locations
- `POST /story-bible/projects/{id}/locations` - Create location
- `GET /story-bible/projects/{id}/locations/{loc_id}` - Get location
- `PUT /story-bible/projects/{id}/locations/{loc_id}` - Update location

#### Lore
- `GET /story-bible/projects/{id}/lore` - List lore entries
- `POST /story-bible/projects/{id}/lore` - Create lore entry

#### Plot Points
- `GET /story-bible/projects/{id}/plot-points` - List plot points
- `POST /story-bible/projects/{id}/plot-points` - Create plot point

#### Scenes
- `GET /story-bible/projects/{id}/scenes` - List scenes
- `POST /story-bible/projects/{id}/scenes` - Create scene
- `GET /story-bible/projects/{id}/scenes/{scene_id}` - Get scene
- `PUT /story-bible/projects/{id}/scenes/{scene_id}` - Update scene
- `GET /story-bible/projects/{id}/scenes/{scene_id}/context` - Get scene context

### AI Editor

#### Text Generation
- `POST /editor/generate-scene` - Generate a new scene
  ```json
  {
    "project_id": "string",
    "scene_id": "string (optional)",
    "prompt": "string",
    "tone": "neutral|dramatic|lighthearted|dark|action|contemplative",
    "length": "short|medium|long",
    "characters": ["char_id1", "char_id2"],
    "location_id": "string (optional)"
  }
  ```

- `POST /editor/generate-dialogue` - Generate dialogue
  ```json
  {
    "project_id": "string",
    "characters": ["CharName1", "CharName2"],
    "situation": "string"
  }
  ```

- `POST /editor/rewrite` - Rewrite text
  ```json
  {
    "text": "string",
    "instruction": "string",
    "project_id": "string (optional)"
  }
  ```

- `POST /editor/expand` - Expand text
  ```json
  {
    "text": "string",
    "project_id": "string (optional)"
  }
  ```

- `POST /editor/summarize` - Summarize text
  ```json
  {
    "text": "string"
  }
  ```

- `POST /editor/continue` - Continue writing
  ```json
  {
    "text": "string",
    "project_id": "string",
    "scene_id": "string (optional)",
    "direction": "string (optional)"
  }
  ```

### Visual Planning
- `GET /planning/corkboard/{project_id}` - Get corkboard layout
- `POST /planning/corkboard/{project_id}` - Save corkboard layout
- `GET /planning/matrix/{project_id}` - Get matrix layout
- `GET /planning/outline/{project_id}` - Get outline

### Continuity Tracker
- `POST /continuity/check/{project_id}` - Check continuity
- `GET /continuity/issues/{project_id}` - Get issues
- `POST /continuity/resolve/{issue_id}` - Resolve issue

### Inspiration
- `POST /inspiration/generate` - Generate inspiration
  ```json
  {
    "type": "text|image|audio",
    "content": "string"
  }
  ```

- `POST /inspiration/scenarios` - Generate what-if scenarios
  ```json
  {
    "context": "string"
  }
  ```

### Assets
- `POST /assets/generate-image` - Generate image
  ```json
  {
    "description": "string",
    "style": "realistic|anime"
  }
  ```

- `POST /assets/generate-audio` - Generate audio
  ```json
  {
    "text": "string",
    "voice": "string"
  }
  ```

- `GET /assets/voices` - List available voices

### Export
- `POST /export/pdf/{project_id}` - Export to PDF
- `POST /export/epub/{project_id}` - Export to EPUB
- `POST /export/mobi/{project_id}` - Export to MOBI
- `POST /export/audio/{project_id}` - Export to audiobook
- `GET /export/formats` - List export formats

## Error Responses

All endpoints return errors in the following format:
```json
{
  "error": "Error message description"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 204: No Content (successful deletion)
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error
