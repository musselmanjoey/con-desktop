import { useState } from 'react'

export default function ConferenceForm({ conference, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    id: conference?.id || '',
    name: conference?.name || '',
    slug: conference?.slug || '',
    description: conference?.description || '',
    date: conference?.date || '',
    location: conference?.location || '',
    websiteUrl: conference?.websiteUrl || '',
    tags: conference?.tags ? conference.tags.join(', ') : '',
    sessionCount: conference?.sessionCount || 0
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  const isEditing = !!conference?.id

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleInputChange = (field, value) => {
    const newData = { ...formData, [field]: value }
    
    // Auto-generate slug when name changes and we're not editing
    if (field === 'name' && !isEditing) {
      newData.slug = generateSlug(value)
    }
    
    // Auto-generate ID when slug changes and we're not editing
    if (field === 'slug' && !isEditing) {
      newData.id = value
    }
    
    setFormData(newData)
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Conference name is required'
    }
    
    if (!formData.date.trim()) {
      newErrors.date = 'Date is required'
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    }
    
    if (!formData.id.trim()) {
      newErrors.id = 'ID is required'
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
      const conferenceData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        sessionCount: parseInt(formData.sessionCount) || 0
      }
      
      await onSave(conferenceData)
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-8 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Edit Conference' : 'Add New Conference'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conference Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`form-input ${errors.name ? 'border-red-300' : ''}`}
              placeholder="AI Conference 2024"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              className={`form-input ${errors.slug ? 'border-red-300' : ''}`}
              placeholder="ai-conference-2024"
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
            )}
          </div>

          {/* ID (readonly when editing) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID *
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => handleInputChange('id', e.target.value)}
              className={`form-input ${errors.id ? 'border-red-300' : ''} ${isEditing ? 'bg-gray-100' : ''}`}
              placeholder="ai-conference-2024"
              readOnly={isEditing}
            />
            {errors.id && (
              <p className="mt-1 text-sm text-red-600">{errors.id}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="form-textarea"
              placeholder="Brief description of the conference"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={`form-input ${errors.date ? 'border-red-300' : ''}`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className={`form-input ${errors.location ? 'border-red-300' : ''}`}
              placeholder="San Francisco, CA"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website URL
            </label>
            <input
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
              className="form-input"
              placeholder="https://aiconf2024.com"
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
              placeholder="ai, machine-learning, research (comma-separated)"
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
              {loading ? 'Saving...' : (isEditing ? 'Update Conference' : 'Add Conference')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}