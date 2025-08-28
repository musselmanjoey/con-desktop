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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {conference.name}
        </h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {conference.sessionCount || 0} sessions
        </span>
      </div>
      
      <p className="text-gray-600 mb-4">
        {conference.description}
      </p>
      
      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
        <span>📅 {new Date(conference.date).toLocaleDateString()}</span>
        <span>📍 {conference.location}</span>
      </div>

      {/* Tags */}
      {conference.tags && conference.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
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
      
      <div className="flex justify-between items-center">
        <button 
          onClick={() => onEdit(conference.id)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          View Sessions
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(conference.id)}
          className="text-sm text-red-600 hover:text-red-800 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}