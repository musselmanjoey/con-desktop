import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import ConferenceList from '../components/ConferenceList'
import WelcomeScreen from '../components/WelcomeScreen'

export default function Home() {
  const [conferences, setConferences] = useState([])
  const [websiteRepoPath, setWebsiteRepoPath] = useState('')
  const [loading, setLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      // Check if website repo is configured
      const repoPath = await window.electronAPI?.config.get('websiteRepoPath')
      setWebsiteRepoPath(repoPath || '')

      // Load conferences if repo exists
      if (repoPath) {
        const conferencesList = await window.electronAPI?.conference.list()
        setConferences(conferencesList || [])
      }
    } catch (error) {
      console.error('Failed to load initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRepoSetup = async (repoPath) => {
    await window.electronAPI?.config.set('websiteRepoPath', repoPath)
    setWebsiteRepoPath(repoPath)
    loadInitialData()
  }

  const handleSaveChanges = async () => {
    try {
      const repoPath = await window.electronAPI?.config.get('websiteRepoPath')
      if (!repoPath) return

      // Stage all changes
      await window.electronAPI?.git.add(repoPath, '.')
      
      // Create commit with timestamp
      const timestamp = new Date().toISOString()
      const message = `Update conference data - ${timestamp}`
      await window.electronAPI?.git.commit(repoPath, message)
      
      // Reset unsaved changes flag
      setHasUnsavedChanges(false)
      
      console.log('Changes saved successfully')
    } catch (error) {
      console.error('Failed to save changes:', error)
      throw error
    }
  }

  const handleDataChange = () => {
    setHasUnsavedChanges(true)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout hasUnsavedChanges={hasUnsavedChanges} onSave={handleSaveChanges}>
      {!websiteRepoPath ? (
        <WelcomeScreen onRepoSetup={handleRepoSetup} />
      ) : (
        <ConferenceList 
          conferences={conferences}
          onRefresh={() => {
            loadInitialData()
            handleDataChange()
          }}
          onDataChange={handleDataChange}
        />
      )}
    </Layout>
  )
}