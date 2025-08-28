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
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-6">
              <div className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                Con
              </div>
              <div className="text-sm text-gray-600">
                AI Conference Content
              </div>
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
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}