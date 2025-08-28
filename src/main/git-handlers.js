const { ipcMain } = require('electron')
const simpleGit = require('simple-git')
const Store = require('electron-store')

const store = new Store()

/**
 * Git operation handlers
 */
ipcMain.handle('git-status', async (event, repoPath) => {
  try {
    const git = simpleGit(repoPath)
    const status = await git.status()
    
    return {
      current: status.current,
      tracking: status.tracking,
      ahead: status.ahead,
      behind: status.behind,
      staged: status.staged,
      modified: status.modified,
      created: status.created,
      deleted: status.deleted,
      renamed: status.renamed,
      conflicted: status.conflicted,
      isClean: status.isClean()
    }
  } catch (error) {
    throw new Error(`Failed to get git status: ${error.message}`)
  }
})

ipcMain.handle('git-clone', async (event, repoUrl, localPath) => {
  try {
    const git = simpleGit()
    await git.clone(repoUrl, localPath)
    return true
  } catch (error) {
    throw new Error(`Failed to clone repository: ${error.message}`)
  }
})

ipcMain.handle('git-add', async (event, repoPath, files) => {
  try {
    const git = simpleGit(repoPath)
    if (Array.isArray(files)) {
      await git.add(files)
    } else {
      await git.add(files || '.')
    }
    return true
  } catch (error) {
    throw new Error(`Failed to add files: ${error.message}`)
  }
})

ipcMain.handle('git-commit', async (event, repoPath, message) => {
  try {
    const git = simpleGit(repoPath)
    await git.commit(message)
    return true
  } catch (error) {
    throw new Error(`Failed to commit: ${error.message}`)
  }
})

ipcMain.handle('git-push', async (event, repoPath, branch) => {
  try {
    const git = simpleGit(repoPath)
    await git.push('origin', branch || 'HEAD')
    return true
  } catch (error) {
    throw new Error(`Failed to push: ${error.message}`)
  }
})

ipcMain.handle('git-list-branches', async (event, repoPath) => {
  try {
    const git = simpleGit(repoPath)
    const branches = await git.branchLocal()
    
    return {
      current: branches.current,
      all: branches.all,
      branches: Object.keys(branches.branches).map(name => ({
        name,
        current: name === branches.current,
        commit: branches.branches[name].commit,
        label: branches.branches[name].label
      }))
    }
  } catch (error) {
    throw new Error(`Failed to list branches: ${error.message}`)
  }
})

ipcMain.handle('git-create-branch', async (event, repoPath, branchName, fromBranch) => {
  try {
    const git = simpleGit(repoPath)
    
    // Ensure we're on the base branch first
    if (fromBranch) {
      await git.checkout(fromBranch)
    }
    
    // Create and checkout new branch
    await git.checkoutLocalBranch(branchName)
    
    return true
  } catch (error) {
    throw new Error(`Failed to create branch: ${error.message}`)
  }
})

ipcMain.handle('git-switch-branch', async (event, repoPath, branchName) => {
  try {
    const git = simpleGit(repoPath)
    
    // Check if there are uncommitted changes
    const status = await git.status()
    if (!status.isClean()) {
      throw new Error('Cannot switch branches with uncommitted changes. Please save your changes first.')
    }
    
    await git.checkout(branchName)
    return true
  } catch (error) {
    throw new Error(`Failed to switch branch: ${error.message}`)
  }
})

ipcMain.handle('git-get-current-branch', async (event, repoPath) => {
  try {
    const git = simpleGit(repoPath)
    const status = await git.status()
    return status.current
  } catch (error) {
    throw new Error(`Failed to get current branch: ${error.message}`)
  }
})

ipcMain.handle('git-has-uncommitted-changes', async (event, repoPath) => {
  try {
    const git = simpleGit(repoPath)
    const status = await git.status()
    return !status.isClean()
  } catch (error) {
    throw new Error(`Failed to check for uncommitted changes: ${error.message}`)
  }
})

module.exports = {
  // Export for testing if needed
}