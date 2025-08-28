import { useState, useEffect } from 'react'

export default function SessionForm({ session, conferenceId, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    id: session?.id || '',
    title: session?.title || '',
    speaker: session?.speaker || '',
    youtubeUrl: session?.youtubeUrl || '',
    summary: session?.summary || '',
    duration: session?.duration || '',
    tags: session?.tags ? session.tags.join(', ') : '',
    transcript: session?.transcript || ''
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [youtubeValidating, setYoutubeValidating] = useState(false)
  
  const isEditing = !!session?.id

  const generateSessionId = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleInputChange = (field, value) => {
    const newData = { ...formData, [field]: value }
    
    // Auto-generate ID when title changes and we're not editing
    if (field === 'title' && !isEditing) {
      newData.id = generateSessionId(value)
    }
    
    setFormData(newData)
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null })
    }
  }

  const validateYouTubeUrl = async (url) => {
    if (!url.trim()) return

    setYoutubeValidating(true)
    try {
      const isValid = await window.electronAPI?.youtube.validateUrl(url)
      if (!isValid) {
        setErrors({ ...errors, youtubeUrl: 'Invalid YouTube URL' })
      } else {
        // Try to extract metadata
        try {
          const info = await window.electronAPI?.youtube.extractVideoInfo(url)
          if (info && !formData.title.trim()) {
            setFormData(prev => ({ ...prev, title: info.title }))
          }
          if (info && !formData.duration.trim()) {
            setFormData(prev => ({ ...prev, duration: info.duration }))
          }
        } catch (error) {
          console.warn('Failed to extract video info:', error)
        }
      }
    } catch (error) {
      setErrors({ ...errors, youtubeUrl: 'Failed to validate YouTube URL' })
    } finally {
      setYoutubeValidating(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Session title is required'
    }
    
    if (!formData.speaker.trim()) {
      newErrors.speaker = 'Speaker name is required'
    }
    
    if (!formData.id.trim()) {
      newErrors.id = 'Session ID is required'
    }
    
    if (formData.youtubeUrl.trim()) {
      const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/
      if (!youtubeRegex.test(formData.youtubeUrl)) {
        newErrors.youtubeUrl = 'Please enter a valid YouTube URL'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const sessionData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        extractedAt: session?.extractedAt || new Date().toISOString()
      }
      
      await onSave(sessionData)
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-8 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Edit Session' : 'Add New Session'}
          </h3>
          {conferenceId && (
            <p className="text-sm text-gray-600 mt-1">Conference: {conferenceId}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`form-input ${errors.title ? 'border-red-300' : ''}`}
              placeholder="The Future of AI Research"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Session ID (readonly when editing) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session ID *
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => handleInputChange('id', e.target.value)}
              className={`form-input ${errors.id ? 'border-red-300' : ''} ${isEditing ? 'bg-gray-100' : ''}`}
              placeholder="the-future-of-ai-research"
              readOnly={isEditing}
            />
            {errors.id && (
              <p className="mt-1 text-sm text-red-600">{errors.id}</p>
            )}
          </div>

          {/* Speaker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Speaker *
            </label>
            <input
              type="text"
              value={formData.speaker}
              onChange={(e) => handleInputChange('speaker', e.target.value)}
              className={`form-input ${errors.speaker ? 'border-red-300' : ''}`}
              placeholder="Dr. Jane Smith"
            />
            {errors.speaker && (
              <p className="mt-1 text-sm text-red-600">{errors.speaker}</p>
            )}
          </div>

          {/* YouTube URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              YouTube URL
            </label>
            <div className="flex">
              <input
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => handleInputChange('youtubeUrl', e.target.value)}
                onBlur={(e) => validateYouTubeUrl(e.target.value)}
                className={`form-input flex-1 ${errors.youtubeUrl ? 'border-red-300' : ''}`}
                placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
              />
              {youtubeValidating && (
                <div className="ml-2 flex items-center">
                  <div className="text-sm text-gray-500">Validating...</div>
                </div>
              )}
            </div>
            {errors.youtubeUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.youtubeUrl}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              className="form-input"
              placeholder="45 minutes"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Summary
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              rows={4}
              className="form-textarea"
              placeholder="Brief summary of the session content..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              className="form-input"
              placeholder="keynote, research, ai (comma-separated)"
            />
          </div>

          {/* Transcript */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transcript
            </label>
            <textarea
              value={formData.transcript}
              onChange={(e) => handleInputChange('transcript', e.target.value)}
              rows={6}
              className="form-textarea"
              placeholder="Full session transcript (optional)..."
            />
          </div>

          {/* Error display */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Session' : 'Add Session')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}