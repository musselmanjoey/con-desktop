import { useState, useEffect } from 'react'
import SessionForm from './SessionForm'

export default function SessionList({ conferenceId, onBack, onDataChange }) {
  const [sessions, setSessions] = useState([])
  const [conference, setConference] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    loadSessionData()
  }, [conferenceId])

  const loadSessionData = async () => {
    try {
      setLoading(true)
      // Load conference details
      const conf = await window.electronAPI?.conference.load(conferenceId)
      setConference(conf)
      
      // Load sessions
      const sessionsList = await window.electronAPI?.session.list(conferenceId)
      setSessions(sessionsList || [])
    } catch (error) {
      console.error('Failed to load session data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSession = () => {
    setEditingSession(null)
    setShowForm(true)
  }

  const handleEditSession = async (sessionId) => {
    try {
      const session = await window.electronAPI?.session.load(conferenceId, sessionId)
      setEditingSession(session)
      setShowForm(true)
    } catch (error) {
      console.error('Failed to load session for editing:', error)
      alert('Failed to load session data')
    }
  }

  const handleSaveSession = async (sessionData) => {
    try {
      await window.electronAPI?.session.save(conferenceId, sessionData)
      setShowForm(false)
      setEditingSession(null)
      if (onDataChange) onDataChange()
      await loadSessionData()
    } catch (error) {
      throw new Error(`Failed to save session: ${error.message}`)
    }
  }

  const handleDeleteSession = (sessionId) => {
    setDeleteConfirm(sessionId)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    
    try {
      await window.electronAPI?.session.delete(conferenceId, deleteConfirm)
      setDeleteConfirm(null)
      if (onDataChange) onDataChange()
      await loadSessionData()
    } catch (error) {
      console.error('Failed to delete session:', error)
      alert('Failed to delete session')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading sessions...</div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header with Back Button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Conferences
        </button>
        
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {conference?.name} Sessions
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage sessions for {conference?.name}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              📅 {conference?.date} • 📍 {conference?.location}
            </div>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={handleAddSession}
              className="btn-primary"
            >
              Add New Session
            </button>
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="mt-8">
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <h3 className="text-lg font-medium">No sessions found</h3>
              <p className="mt-2">Get started by adding your first session</p>
            </div>
            <div className="mt-6">
              <button
                onClick={handleAddSession}
                className="btn-primary"
              >
                Add New Session
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onEdit={handleEditSession}
                onDelete={handleDeleteSession}
              />
            ))}
          </div>
        )}
      </div>

      {/* Session Form Modal */}
      {showForm && (
        <SessionForm
          session={editingSession}
          conferenceId={conferenceId}
          onSave={handleSaveSession}
          onCancel={() => {
            setShowForm(false)
            setEditingSession(null)
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Delete Session
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this session? This action cannot be undone.
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
                  Delete Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SessionCard({ session, onEdit, onDelete }) {
  const handleKeyDown = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      action()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {session.title}
        </h3>
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {session.duration || 'Duration TBD'}
        </span>
      </div>
      
      {session.speaker && (
        <p className="text-sm text-gray-600 mb-2">
          🎤 Speaker: {session.speaker}
        </p>
      )}
      
      {session.youtubeUrl && (
        <p className="text-sm text-blue-600 mb-3">
          🎥 <a href={session.youtubeUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
            Watch on YouTube
          </a>
        </p>
      )}
      
      {session.summary && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {session.summary}
        </p>
      )}

      {/* Tags */}
      {session.tags && session.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {session.tags.map((tag, index) => (
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
          onClick={() => onEdit(session.id)}
          onKeyDown={(e) => handleKeyDown(e, () => onEdit(session.id))}
          className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          aria-label={`Edit ${session.title}`}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(session.id)}
          onKeyDown={(e) => handleKeyDown(e, () => onDelete(session.id))}
          className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          aria-label={`Delete ${session.title}`}
        >
          Delete
        </button>
      </div>
    </div>
  )
}