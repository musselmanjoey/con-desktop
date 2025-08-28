import { useState } from 'react'
import ConferenceForm from './ConferenceForm'

export default function ConferenceList({ conferences, onRefresh, onDataChange }) {
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingConference, setEditingConference] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const handleAddConference = () => {
    setEditingConference(null)
    setShowForm(true)
  }

  const handleEditConference = async (conferenceId) => {
    try {
      const conference = await window.electronAPI?.conference.load(conferenceId)
      setEditingConference(conference)
      setShowForm(true)
    } catch (error) {
      console.error('Failed to load conference for editing:', error)
      alert('Failed to load conference data')
    }
  }

  const handleSaveConference = async (conferenceData) => {
    try {
      await window.electronAPI?.conference.save(conferenceData)
      setShowForm(false)
      setEditingConference(null)
      if (onDataChange) onDataChange()
      await onRefresh()
    } catch (error) {
      throw new Error(`Failed to save conference: ${error.message}`)
    }
  }

  const handleDeleteConference = (conferenceId) => {
    setDeleteConfirm(conferenceId)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    
    try {
      await window.electronAPI?.conference.delete(deleteConfirm)
      setDeleteConfirm(null)
      if (onDataChange) onDataChange()
      await onRefresh()
    } catch (error) {
      console.error('Failed to delete conference:', error)
      alert('Failed to delete conference')
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      await onRefresh()
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading conferences...</div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header with Add Button */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conferences</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage conference data and sessions
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={handleAddConference}
            className="btn-primary"
          >
            Add New Conference
          </button>
        </div>
      </div>

      {/* Conference Grid */}
      <div className="mt-8">
        {conferences.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <h3 className="text-lg font-medium">No conferences found</h3>
              <p className="mt-2">Get started by adding your first conference</p>
            </div>
            <div className="mt-6">
              <button
                onClick={handleAddConference}
                className="btn-primary"
              >
                Add New Conference
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {conferences.map((conference) => (
              <ConferenceCard
                key={conference.id}
                conference={conference}
                onEdit={handleEditConference}
                onDelete={handleDeleteConference}
              />
            ))}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="btn-outline"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Conference Form Modal */}
      {showForm && (
        <ConferenceForm
          conference={editingConference}
          onSave={handleSaveConference}
          onCancel={() => {
            setShowForm(false)
            setEditingConference(null)
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Delete Conference
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this conference? This will also delete all associated sessions. This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus-ring"
                >
                  Delete Conference
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ConferenceCard({ conference, onEdit, onDelete }) {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {conference.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {conference.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {conference.date}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {conference.sessionCount || 0} sessions
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {conference.location}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col space-y-2 ml-4">
          <button
            onClick={() => onEdit(conference.id)}
            className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(conference.id)}
            className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      </div>
      
      {/* Tags */}
      {conference.tags && conference.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {conference.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}