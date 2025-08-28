import { useState, useEffect, useCallback } from 'react'

export default function SaveManager({ onSave, hasUnsavedChanges, children }) {
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  const handleSave = async () => {
    if (!hasUnsavedChanges || saving) return

    setSaving(true)
    try {
      await onSave()
      setLastSaved(new Date())
    } catch (error) {
      console.error('Save failed:', error)
      alert(`Save failed: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (hasUnsavedChanges) {
          handleSave()
        }
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [hasUnsavedChanges, saving])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  return (
    <div className="flex items-center space-x-4">
      {/* Save Status */}
      <div className="flex items-center space-x-2">
        {hasUnsavedChanges ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Unsaved changes
          </span>
        ) : lastSaved ? (
          <span className="text-xs text-gray-500">
            Saved {lastSaved.toLocaleTimeString()}
          </span>
        ) : (
          <span className="text-xs text-gray-500">
            No changes
          </span>
        )}
      </div>

      {/* Save Button */}
      {hasUnsavedChanges && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      )}

      {children}
    </div>
  )
}