# GitHub Copilot Instructions for Con Desktop

This document provides context and guidelines for GitHub Copilot when working on the Con Desktop Electron application.

## Project Overview

**Con Desktop** is an Electron application that serves as the content management system for AI conference content. It manages data that feeds into the con-website static site, handling conference research, session data entry, and Git synchronization.

## Architecture Context

### Tech Stack
- **Framework**: Electron (main) + Next.js (renderer)
- **Main Process**: Node.js with file system and Git operations
- **Renderer Process**: React with Tailwind CSS
- **IPC**: Secure communication via contextBridge/preload
- **Storage**: JSON files + electron-store for config
- **Version Control**: simple-git for repository operations

### Key Design Decisions
1. **Process Separation**: Clear main/renderer boundaries for security
2. **Context Isolation**: All IPC goes through secure preload bridge
3. **Local-First**: No cloud dependencies, local Git workflow
4. **Data-Driven**: JSON schema matches con-website requirements
5. **Desktop UX**: Native menus, keyboard shortcuts, file dialogs

## Code Patterns & Conventions

### File Structure
```
src/
├── main/                 # Electron main process (Node.js)
│   ├── main.js          # App lifecycle, window management
│   ├── preload.js       # Secure IPC bridge
│   └── handlers/        # IPC request handlers
└── renderer/            # Next.js React app
    ├── pages/           # File-based routing
    ├── components/      # Reusable UI components
    └── utils/           # Frontend utilities
```

### IPC Communication Pattern
```javascript
// Preload: Expose secure API
contextBridge.exposeInMainWorld('electronAPI', {
  conference: {
    load: (id) => ipcRenderer.invoke('conference-load', id),
    save: (data) => ipcRenderer.invoke('conference-save', data)
  }
})

// Main: Handle requests
ipcMain.handle('conference-load', async (event, id) => {
  // Business logic here
  return conferenceData
})

// Renderer: Use exposed API
const data = await window.electronAPI.conference.load('conf-2024')
```

### Component Patterns
```javascript
// Desktop-specific React component
import { useState, useEffect } from 'react'

export default function DesktopComponent({ data }) {
  const [loading, setLoading] = useState(false)
  
  // Handle Electron-specific operations
  const handleElectronAction = async () => {
    setLoading(true)
    try {
      await window.electronAPI.someOperation(data)
    } catch (error) {
      // Handle desktop-specific errors
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="card">
      {/* Desktop-optimized UI */}
    </div>
  )
}
```

## IPC API Context

### Conference Operations
- `conference-load(id)`: Load conference by ID from JSON
- `conference-save(data)`: Save conference data to JSON file
- `conference-delete(id)`: Remove conference and sessions
- `conference-list()`: Get all conferences from data directory

### Session Operations  
- `session-load(confId, sessionId)`: Load specific session
- `session-save(confId, data)`: Save session to conference file
- `session-delete(confId, sessionId)`: Remove session
- `session-list(confId)`: Get all sessions for conference

### Git Operations
- `git-clone(url, path)`: Clone con-website repository
- `git-status(path)`: Check repository status
- `git-add(path, files)`: Stage files for commit
- `git-commit(path, message)`: Create commit
- `git-push(path, branch)`: Push to remote

### File System Operations
- `fs-read-file(path)`: Read file contents
- `fs-write-file(path, data)`: Write file safely
- `fs-read-dir(path)`: List directory contents
- `fs-exists(path)`: Check if file/directory exists

### YouTube Integration
- `youtube-extract-info(url)`: Extract video metadata
- `youtube-validate-url(url)`: Validate YouTube URL format

## Data Schema Context

### Local Configuration (electron-store)
```json
{
  "websiteRepoPath": "/path/to/cloned/con-website",
  "gitUsername": "user-name",
  "gitEmail": "user@email.com", 
  "autoSync": true,
  "windowBounds": { "width": 1200, "height": 800 },
  "recentConferences": ["conf-2024", "devcon-2024"]
}
```

### Conference File Structure (matches con-website)
```json
// conferences.json
{
  "conferences": [
    {
      "id": "ai-conf-2024",
      "name": "AI Conference 2024",
      "slug": "ai-conf-2024",
      "description": "Leading AI research conference",
      "date": "2024-06-15",
      "location": "San Francisco, CA",
      "sessionCount": 12,
      "websiteUrl": "https://aiconf2024.com",
      "tags": ["ai", "research", "machine-learning"]
    }
  ]
}
```

```json  
// sessions/ai-conf-2024-sessions.json
{
  "conferenceId": "ai-conf-2024",
  "sessions": [
    {
      "id": "opening-keynote",
      "title": "The Future of AI Research",
      "speaker": "Dr. Jane Smith",
      "youtubeUrl": "https://youtube.com/watch?v=VIDEO_ID",
      "summary": "Comprehensive overview of AI trends...",
      "duration": "45 minutes",
      "tags": ["keynote", "research"],
      "transcript": "Optional full transcript text...",
      "extractedAt": "2024-08-28T00:00:00Z"
    }
  ]
}
```

## Component Guidelines

### Desktop-Specific Components

**ConferenceManager**
- CRUD operations for conferences
- Bulk import from conference websites
- Data validation and duplicate detection
- Git sync status indicators

**SessionEditor**
- Form for session data entry
- YouTube URL validation and metadata extraction
- Rich text editor for summaries
- Auto-save functionality

**GitSync**
- Repository status display
- One-click commit and push
- Conflict resolution interface
- Sync history and rollback

**SettingsPanel**
- Repository configuration
- Git credentials management
- UI preferences
- Notification settings

### UI/UX Patterns

**Desktop-First Design**
- Native window controls integration
- Keyboard shortcuts for all actions
- Context menus for right-click operations
- Drag-and-drop file handling

**Form Handling**
- Auto-save drafts locally
- Validation with immediate feedback
- Undo/redo support
- Bulk operations with progress indicators

## Security Considerations

### Electron Security Best Practices
```javascript
// Main process window creation
new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,        // Never enable in renderer
    contextIsolation: true,        // Always enable
    enableRemoteModule: false,     // Deprecated and insecure
    preload: path.join(__dirname, 'preload.js')
  }
})
```

### Safe File Operations
- Always validate file paths
- Use path.join() for cross-platform paths
- Handle file permissions gracefully
- Sanitize user input before file operations

### Git Security
- Never commit sensitive credentials
- Use environment variables for auth
- Validate repository URLs
- Handle network errors gracefully

## Common Desktop Workflows

### First-Time Setup
1. **Welcome Screen**: Guide user through initial setup
2. **Repository Clone**: Clone or link to con-website repo
3. **Git Configuration**: Set up user name and email
4. **Data Validation**: Verify existing data structure

### Daily Usage
1. **Load Conference**: Browse or search existing conferences
2. **Add Sessions**: Use form or bulk import
3. **YouTube Integration**: Auto-extract video metadata
4. **Data Validation**: Real-time validation feedback
5. **Git Sync**: One-click commit and push

### Batch Operations
1. **Conference Import**: Parse conference website
2. **Session Bulk Add**: Import from CSV or API
3. **Data Migration**: Update schema versions
4. **Backup/Restore**: Local backup before major changes

## Error Handling Patterns

### Renderer Process
```javascript
try {
  const result = await window.electronAPI.someOperation()
  // Handle success
} catch (error) {
  if (error.code === 'ENOENT') {
    // File not found - show user-friendly message
  } else if (error.code === 'GIT_ERROR') {
    // Git operation failed - show retry option
  } else {
    // Unknown error - log and show generic message
  }
}
```

### Main Process
```javascript
ipcMain.handle('operation', async (event, data) => {
  try {
    const result = await performOperation(data)
    return { success: true, data: result }
  } catch (error) {
    console.error('Operation failed:', error)
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    }
  }
})
```

## Performance Considerations

### Efficient Data Loading
- Lazy load conference data
- Cache frequently accessed sessions
- Paginate large conference lists
- Background loading with progress indicators

### Memory Management
- Dispose of large objects when done
- Limit concurrent operations
- Stream large file operations
- Monitor memory usage in development

## Testing Guidelines

### Unit Testing (Jest)
- Test IPC handlers in isolation
- Mock file system operations
- Test data validation logic
- Component rendering and interactions

### Integration Testing
- End-to-end workflow testing
- Git operations with test repositories
- File system integration
- Inter-process communication

## Future Considerations

### Extensibility
- Plugin system for custom scrapers
- Theme support for UI customization
- Custom data export formats
- API integration hooks

### Scalability
- Multiple conference management
- Team collaboration features
- Cloud sync options
- Advanced search and filtering

---

**Remember**: This is a desktop application focused on productivity and data integrity. Prioritize native desktop UX patterns, secure IPC communication, and reliable data operations. The app should feel fast, responsive, and trustworthy for content management workflows.