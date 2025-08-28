import { useState } from 'react'

export default function WelcomeScreen({ onRepoSetup }) {
  const [repoPath, setRepoPath] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleBrowseRepo = async () => {
    try {
      // In a real implementation, we'd use electron's dialog API
      // For now, using a simple input field
      if (repoPath.trim()) {
        setIsLoading(true)
        setError('')
        
        // Check if the path exists and is a valid repo
        const exists = await window.electronAPI?.fs.exists(repoPath)
        if (!exists) {
          setError('Path does not exist')
          return
        }
        
        await onRepoSetup(repoPath)
      } else {
        setError('Please enter a valid repository path')
      }
    } catch (err) {
      setError(err.message || 'Failed to setup repository')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloneRepo = () => {
    // TODO: Implement Git clone functionality
    setError('Clone functionality not implemented yet')
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Con Desktop</h2>
            <p className="text-gray-600 mb-8">
              Get started by setting up your con-website repository
            </p>
          </div>

          <div className="space-y-6">
            {/* Browse for existing repo */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Link Existing Repository
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={repoPath}
                  onChange={(e) => setRepoPath(e.target.value)}
                  placeholder="/path/to/con-website"
                  className="form-input"
                />
                <button
                  onClick={handleBrowseRepo}
                  disabled={isLoading}
                  className="btn-primary w-full"
                >
                  {isLoading ? 'Setting up...' : 'Browse & Link Repository'}
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Clone new repo */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Clone Repository
              </h3>
              <button
                onClick={handleCloneRepo}
                className="btn-outline w-full"
              >
                Clone con-website Repository
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}