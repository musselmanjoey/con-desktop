const { ipcMain } = require('electron')
const path = require('path')
const fs = require('fs').promises
const Store = require('electron-store')

const store = new Store()

/**
 * Configuration handlers
 */
ipcMain.handle('config-get', async (event, key) => {
  return store.get(key)
})

ipcMain.handle('config-set', async (event, key, value) => {
  store.set(key, value)
  return true
})

ipcMain.handle('config-get-all', async () => {
  return store.store
})

/**
 * File system operation handlers
 */
ipcMain.handle('fs-read-file', async (event, filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`)
  }
})

ipcMain.handle('fs-write-file', async (event, filePath, data) => {
  try {
    const jsonData = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    await fs.writeFile(filePath, jsonData, 'utf8')
    return true
  } catch (error) {
    throw new Error(`Failed to write file: ${error.message}`)
  }
})

ipcMain.handle('fs-read-dir', async (event, dirPath) => {
  try {
    const files = await fs.readdir(dirPath)
    return files
  } catch (error) {
    throw new Error(`Failed to read directory: ${error.message}`)
  }
})

ipcMain.handle('fs-exists', async (event, filePath) => {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
})

/**
 * Conference operation handlers
 */
ipcMain.handle('conference-list', async () => {
  try {
    const repoPath = store.get('websiteRepoPath')
    if (!repoPath) {
      return []
    }
    
    const conferencesPath = path.join(repoPath, 'data', 'conferences.json')
    const exists = await fs.access(conferencesPath).then(() => true).catch(() => false)
    
    if (!exists) {
      return []
    }
    
    const data = await fs.readFile(conferencesPath, 'utf8')
    const parsed = JSON.parse(data)
    return parsed.conferences || []
  } catch (error) {
    console.error('Failed to list conferences:', error)
    return []
  }
})

ipcMain.handle('conference-load', async (event, conferenceId) => {
  try {
    const repoPath = store.get('websiteRepoPath')
    if (!repoPath) {
      throw new Error('Website repository not configured')
    }
    
    const conferencesPath = path.join(repoPath, 'data', 'conferences.json')
    const data = await fs.readFile(conferencesPath, 'utf8')
    const parsed = JSON.parse(data)
    
    return parsed.conferences?.find(conf => conf.id === conferenceId) || null
  } catch (error) {
    throw new Error(`Failed to load conference: ${error.message}`)
  }
})

ipcMain.handle('conference-save', async (event, conferenceData) => {
  try {
    const repoPath = store.get('websiteRepoPath')
    if (!repoPath) {
      throw new Error('Website repository not configured')
    }
    
    const dataDir = path.join(repoPath, 'data')
    const conferencesPath = path.join(dataDir, 'conferences.json')
    
    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true })
    
    // Read existing conferences
    let conferences = []
    try {
      const data = await fs.readFile(conferencesPath, 'utf8')
      const parsed = JSON.parse(data)
      conferences = parsed.conferences || []
    } catch {
      // File doesn't exist, start with empty array
    }
    
    // Update or add conference
    const existingIndex = conferences.findIndex(conf => conf.id === conferenceData.id)
    if (existingIndex >= 0) {
      conferences[existingIndex] = conferenceData
    } else {
      conferences.push(conferenceData)
    }
    
    // Write back to file
    const output = { conferences }
    await fs.writeFile(conferencesPath, JSON.stringify(output, null, 2), 'utf8')
    
    return true
  } catch (error) {
    throw new Error(`Failed to save conference: ${error.message}`)
  }
})

ipcMain.handle('conference-delete', async (event, conferenceId) => {
  try {
    const repoPath = store.get('websiteRepoPath')
    if (!repoPath) {
      throw new Error('Website repository not configured')
    }
    
    const conferencesPath = path.join(repoPath, 'data', 'conferences.json')
    const data = await fs.readFile(conferencesPath, 'utf8')
    const parsed = JSON.parse(data)
    
    // Remove conference from list
    const conferences = (parsed.conferences || []).filter(conf => conf.id !== conferenceId)
    
    // Write back to file
    const output = { conferences }
    await fs.writeFile(conferencesPath, JSON.stringify(output, null, 2), 'utf8')
    
    // Also delete sessions file if it exists
    const sessionsPath = path.join(repoPath, 'data', 'sessions', `${conferenceId}-sessions.json`)
    try {
      await fs.unlink(sessionsPath)
    } catch {
      // File doesn't exist, that's fine
    }
    
    return true
  } catch (error) {
    throw new Error(`Failed to delete conference: ${error.message}`)
  }
})

/**
 * Session operation handlers
 */
ipcMain.handle('session-list', async (event, conferenceId) => {
  try {
    const repoPath = store.get('websiteRepoPath')
    if (!repoPath) {
      return []
    }
    
    const sessionsPath = path.join(repoPath, 'data', 'sessions', `${conferenceId}-sessions.json`)
    const exists = await fs.access(sessionsPath).then(() => true).catch(() => false)
    
    if (!exists) {
      return []
    }
    
    const data = await fs.readFile(sessionsPath, 'utf8')
    const parsed = JSON.parse(data)
    return parsed.sessions || []
  } catch (error) {
    console.error('Failed to list sessions:', error)
    return []
  }
})

ipcMain.handle('session-load', async (event, conferenceId, sessionId) => {
  try {
    const repoPath = store.get('websiteRepoPath')
    if (!repoPath) {
      throw new Error('Website repository not configured')
    }
    
    const sessionsPath = path.join(repoPath, 'data', 'sessions', `${conferenceId}-sessions.json`)
    const data = await fs.readFile(sessionsPath, 'utf8')
    const parsed = JSON.parse(data)
    
    return parsed.sessions?.find(session => session.id === sessionId) || null
  } catch (error) {
    throw new Error(`Failed to load session: ${error.message}`)
  }
})

ipcMain.handle('session-save', async (event, conferenceId, sessionData) => {
  try {
    const repoPath = store.get('websiteRepoPath')
    if (!repoPath) {
      throw new Error('Website repository not configured')
    }
    
    const sessionsDir = path.join(repoPath, 'data', 'sessions')
    const sessionsPath = path.join(sessionsDir, `${conferenceId}-sessions.json`)
    
    // Ensure sessions directory exists
    await fs.mkdir(sessionsDir, { recursive: true })
    
    // Read existing sessions
    let sessions = []
    try {
      const data = await fs.readFile(sessionsPath, 'utf8')
      const parsed = JSON.parse(data)
      sessions = parsed.sessions || []
    } catch {
      // File doesn't exist, start with empty array
    }
    
    // Update or add session
    const existingIndex = sessions.findIndex(session => session.id === sessionData.id)
    if (existingIndex >= 0) {
      sessions[existingIndex] = sessionData
    } else {
      sessions.push(sessionData)
    }
    
    // Write back to file
    const output = { 
      conferenceId,
      sessions 
    }
    await fs.writeFile(sessionsPath, JSON.stringify(output, null, 2), 'utf8')
    
    return true
  } catch (error) {
    throw new Error(`Failed to save session: ${error.message}`)
  }
})

ipcMain.handle('session-delete', async (event, conferenceId, sessionId) => {
  try {
    const repoPath = store.get('websiteRepoPath')
    if (!repoPath) {
      throw new Error('Website repository not configured')
    }
    
    const sessionsPath = path.join(repoPath, 'data', 'sessions', `${conferenceId}-sessions.json`)
    const data = await fs.readFile(sessionsPath, 'utf8')
    const parsed = JSON.parse(data)
    
    // Remove session from list
    const sessions = (parsed.sessions || []).filter(session => session.id !== sessionId)
    
    // Write back to file
    const output = {
      conferenceId,
      sessions
    }
    await fs.writeFile(sessionsPath, JSON.stringify(output, null, 2), 'utf8')
    
    return true
  } catch (error) {
    throw new Error(`Failed to delete session: ${error.message}`)
  }
})

/**
 * YouTube operation handlers (stubs for now)
 */
ipcMain.handle('youtube-validate-url', async (event, url) => {
  const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/
  return youtubeRegex.test(url)
})

ipcMain.handle('youtube-extract-info', async (event, url) => {
  // TODO: Implement actual YouTube metadata extraction
  // For now, return mock data
  if (!url) {
    throw new Error('URL is required')
  }
  
  return {
    title: 'Sample Video Title',
    duration: '45 minutes',
    description: 'Sample video description'
  }
})

module.exports = {
  // Export handlers for testing if needed
}