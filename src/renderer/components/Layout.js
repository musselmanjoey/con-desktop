import { useState, useEffect } from 'react'
import BranchManager from './BranchManager'
import SaveManager from './SaveManager'

export default function Layout({ children, hasUnsavedChanges = false, onSave }) {
  const [repoConfigured, setRepoConfigured] = useState(false)

  useEffect(() => {
    checkRepoConfiguration()
  }, [])

  const checkRepoConfiguration = async () => {
    try {
      const repoPath = await window.electronAPI?.config.get('websiteRepoPath')
      setRepoConfigured(!!repoPath)
    } catch (error) {
      console.error('Failed to check repo configuration:', error)
    }
  }

  const handleBranchChange = (newBranch) => {
    // Trigger a refresh when branch changes
    window.location.reload()
  }

  const handleUnsavedChangesCheck = async () => {
    return hasUnsavedChanges
  }

  const handleSaveChanges = async () => {
    if (onSave) {
      await onSave()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Con Desktop</h1>
            </div>
            
            {/* Branch Status and Save Controls */}
            {repoConfigured && (
              <div className="flex items-center space-x-6">
                <BranchManager 
                  onBranchChange={handleBranchChange}
                  onUnsavedChangesCheck={handleUnsavedChangesCheck}
                />
                <SaveManager 
                  hasUnsavedChanges={hasUnsavedChanges}
                  onSave={handleSaveChanges}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}