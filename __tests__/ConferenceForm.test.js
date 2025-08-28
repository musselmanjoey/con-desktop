/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ConferenceForm from '../src/renderer/components/ConferenceForm'

// Mock window.electronAPI
global.window = {
  ...global.window,
  electronAPI: {
    conference: {
      save: jest.fn()
    }
  }
}

describe('ConferenceForm', () => {
  const mockOnSave = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form with all required fields', () => {
    render(
      <ConferenceForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    // Check for form presence and key elements
    expect(screen.getByText('Add New Conference')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('AI Conference 2024')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Brief description of the conference')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('San Francisco, CA')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('https://aiconf2024.com')).toBeInTheDocument()
    
    // Check for action buttons
    expect(screen.getByRole('button', { name: /Add Conference/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument()
  })

  it('displays modal with proper styling', () => {
    render(
      <ConferenceForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    // Check for modal overlay styling by finding the fixed inset div
    const modalContainer = document.querySelector('.fixed.inset-0')
    expect(modalContainer).toHaveClass('fixed', 'inset-0', 'bg-gray-600', 'bg-opacity-50')
    
    // Check for modal content styling
    const modalContent = document.querySelector('.relative.top-8')
    expect(modalContent).toHaveClass('relative', 'bg-white', 'rounded-md')
  })

  it('handles cancel button click', () => {
    render(
      <ConferenceForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Cancel/ }))
    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('pre-fills form when editing existing conference', () => {
    const existingConference = {
      id: 'test-conf',
      name: 'Test Conference',
      description: 'A test conference',
      date: '2024-06-15',
      location: 'San Francisco, CA',
      websiteUrl: 'https://test.com',
      tags: ['test', 'ai']
    }

    render(
      <ConferenceForm
        conference={existingConference}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    // Check that form is pre-filled
    expect(screen.getByDisplayValue('Test Conference')).toBeInTheDocument()
    expect(screen.getByDisplayValue('A test conference')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2024-06-15')).toBeInTheDocument()
    expect(screen.getByDisplayValue('San Francisco, CA')).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://test.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test, ai')).toBeInTheDocument()
    
    // Check that submit button shows "Update"
    expect(screen.getByRole('button', { name: /Update Conference/ })).toBeInTheDocument()
  })
})