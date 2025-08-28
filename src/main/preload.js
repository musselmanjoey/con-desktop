const { contextBridge, ipcRenderer } = require('electron')

/**
 * Preload script that exposes secure APIs to renderer process
 * Follows security best practices with contextIsolation
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // Menu event listeners
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-new-conference', callback)
    ipcRenderer.on('menu-open-repo', callback)
    ipcRenderer.on('menu-sync-website', callback)
    ipcRenderer.on('menu-validate-data', callback)
  },

  // Git operations for website repo
  git: {
    clone: (repoUrl, localPath) => ipcRenderer.invoke('git-clone', repoUrl, localPath),
    status: (repoPath) => ipcRenderer.invoke('git-status', repoPath),
    add: (repoPath, files) => ipcRenderer.invoke('git-add', repoPath, files),
    commit: (repoPath, message) => ipcRenderer.invoke('git-commit', repoPath, message),
    push: (repoPath, branch) => ipcRenderer.invoke('git-push', repoPath, branch)
  },

  // File system operations
  fs: {
    readFile: (filePath) => ipcRenderer.invoke('fs-read-file', filePath),
    writeFile: (filePath, data) => ipcRenderer.invoke('fs-write-file', filePath, data),
    readDir: (dirPath) => ipcRenderer.invoke('fs-read-dir', dirPath),
    exists: (path) => ipcRenderer.invoke('fs-exists', path)
  },

  // Conference data operations
  conference: {
    load: (conferenceId) => ipcRenderer.invoke('conference-load', conferenceId),
    save: (conferenceData) => ipcRenderer.invoke('conference-save', conferenceData),
    delete: (conferenceId) => ipcRenderer.invoke('conference-delete', conferenceId),
    list: () => ipcRenderer.invoke('conference-list')
  },

  // Session data operations
  session: {
    load: (conferenceId, sessionId) => ipcRenderer.invoke('session-load', conferenceId, sessionId),
    save: (conferenceId, sessionData) => ipcRenderer.invoke('session-save', conferenceId, sessionData),
    delete: (conferenceId, sessionId) => ipcRenderer.invoke('session-delete', conferenceId, sessionId),
    list: (conferenceId) => ipcRenderer.invoke('session-list', conferenceId)
  },

  // YouTube data scraping
  youtube: {
    extractVideoInfo: (url) => ipcRenderer.invoke('youtube-extract-info', url),
    validateUrl: (url) => ipcRenderer.invoke('youtube-validate-url', url)
  },

  // Configuration and settings
  config: {
    get: (key) => ipcRenderer.invoke('config-get', key),
    set: (key, value) => ipcRenderer.invoke('config-set', key, value),
    getAll: () => ipcRenderer.invoke('config-get-all')
  }
})