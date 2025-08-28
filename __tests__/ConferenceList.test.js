/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ConferenceList from '../src/renderer/components/ConferenceList'

// Mock window.electronAPI
global.window = {
  ...global.window,
  electronAPI: {
    conference: {
      load: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      list: jest.fn()
    },
    config: {
      get: jest.fn(),
      set: jest.fn()
    }
  }
}

describe('ConferenceList', () => {
  const mockConferences = [
    {
      id: 'test-conf-2024',
      name: 'Test Conference 2024',
      description: 'A test conference',
      date: '2024-06-15',
      location: 'San Francisco, CA',
      sessionCount: 5,
      tags: ['test', 'ai']
    }
  ]

  it('renders conference list correctly', () => {
    render(
      <ConferenceList 
        conferences={mockConferences} 
        onRefresh={() => {}}
        onDataChange={() => {}}
      />
    )

    expect(screen.getByText('Conferences')).toBeInTheDocument()
    expect(screen.getByText('Test Conference 2024')).toBeInTheDocument()
    expect(screen.getByText('Add New Conference')).toBeInTheDocument()
  })

  it('renders empty state when no conferences', () => {
    render(
      <ConferenceList 
        conferences={[]} 
        onRefresh={() => {}}
        onDataChange={() => {}}
      />
    )

    expect(screen.getByText('No conferences found')).toBeInTheDocument()
    expect(screen.getByText('Get started by adding your first conference')).toBeInTheDocument()
  })
})