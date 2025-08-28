import { useState, useEffect } from 'react'

export default function BranchManager({ onBranchChange, onUnsavedChangesCheck }) {
  const [currentBranch, setCurrentBranch] = useState('main')
  const [branches, setBranches] = useState([])
  const [showBranchDropdown, setShowBranchDropdown] = useState(false)
  const [showNewBranchForm, setShowNewBranchForm] = useState(false)
  const [newBranchName, setNewBranchName] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    loadBranchInfo()
  }, [])

  const loadBranchInfo = async () => {
    try {
      const repoPath = await window.electronAPI?.config.get('websiteRepoPath')
      if (!repoPath) return

      const branchInfo = await window.electronAPI?.git.listBranches(repoPath)
      setCurrentBranch(branchInfo.current)
      setBranches(branchInfo.branches)

      // Check for unsaved changes
      const hasChanges = await window.electronAPI?.git.hasUncommittedChanges(repoPath)
      setHasUnsavedChanges(hasChanges)
    } catch (error) {
      console.error('Failed to load branch info:', error)
    }
  }

  const handleSwitchBranch = async (branchName) => {
    if (branchName === currentBranch) {
      setShowBranchDropdown(false)
      return
    }

    // Check for unsaved changes first
    if (onUnsavedChangesCheck && await onUnsavedChangesCheck()) {
      alert('Please save your changes before switching branches')
      setShowBranchDropdown(false)
      return
    }

    setLoading(true)
    try {
      const repoPath = await window.electronAPI?.config.get('websiteRepoPath')
      await window.electronAPI?.git.switchBranch(repoPath, branchName)
      
      setCurrentBranch(branchName)
      setShowBranchDropdown(false)
      
      if (onBranchChange) {
        onBranchChange(branchName)
      }
    } catch (error) {
      console.error('Failed to switch branch:', error)
      alert(`Failed to switch branch: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) {
      alert('Please enter a branch name')
      return
    }

    setLoading(true)
    try {
      const repoPath = await window.electronAPI?.config.get('websiteRepoPath')
      await window.electronAPI?.git.createBranch(repoPath, newBranchName, 'main')
      
      setCurrentBranch(newBranchName)
      setNewBranchName('')
      setShowNewBranchForm(false)
      
      await loadBranchInfo()
      
      if (onBranchChange) {
        onBranchChange(newBranchName)
      }
    } catch (error) {
      console.error('Failed to create branch:', error)
      alert(`Failed to create branch: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const generateBranchName = () => {
    const date = new Date().toISOString().split('T')[0]
    setNewBranchName(`content-update-${date}`)
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Current Branch Display */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">Branch:</span>
        <div className="relative">
          <button
            onClick={() => setShowBranchDropdown(!showBranchDropdown)}
            className="flex items-center space-x-1 text-sm font-medium text-gray-900 hover:text-blue-600"
            disabled={loading}
          >
            <span>{currentBranch}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Branch Dropdown */}
          {showBranchDropdown && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <div className="py-1">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-200">
                  Switch Branch
                </div>
                {branches.map((branch) => (
                  <button
                    key={branch.name}
                    onClick={() => handleSwitchBranch(branch.name)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                      branch.current ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                    }`}
                    disabled={loading}
                  >
                    <div className="flex items-center justify-between">
                      <span>{branch.name}</span>
                      {branch.current && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
                <div className="border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowBranchDropdown(false)
                      setShowNewBranchForm(true)
                      generateBranchName()
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                    disabled={loading}
                  >
                    + Create New Branch
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Unsaved Changes Indicator */}
        {hasUnsavedChanges && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Unsaved changes
          </span>
        )}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-sm text-gray-500">Working...</div>
      )}

      {/* New Branch Form Modal */}
      {showNewBranchForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create New Branch</h3>
              <p className="text-sm text-gray-600 mt-1">
                Create a new branch from main for your content changes
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="form-input"
                  placeholder="content-update-2024-01-15"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowNewBranchForm(false)
                    setNewBranchName('')
                  }}
                  className="btn-outline"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBranch}
                  className="btn-primary"
                  disabled={loading || !newBranchName.trim()}
                >
                  {loading ? 'Creating...' : 'Create Branch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}