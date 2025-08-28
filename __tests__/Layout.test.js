/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Layout from '../src/renderer/components/Layout'

// Mock window.electronAPI
const mockElectronAPI = {
  config: {
    get: jest.fn().mockResolvedValue('/path/to/repo'),
    set: jest.fn()
  }
}

global.window = {
  ...global.window,
  electronAPI: mockElectronAPI
}

// Mock BranchManager and SaveManager components
jest.mock('../src/renderer/components/BranchManager', () => {
  return function MockBranchManager({ onBranchChange, onUnsavedChangesCheck }) {
    return <div data-testid="branch-manager">Branch Manager</div>
  }
})

jest.mock('../src/renderer/components/SaveManager', () => {
  return function MockSaveManager({ hasUnsavedChanges, onSave }) {
    return <div data-testid="save-manager">Save Manager</div>
  }
})

describe('Layout', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
  })

  it('renders professional navigation design', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    // Check for professional branding
    expect(screen.getByText('Con')).toBeInTheDocument()
    expect(screen.getByText('AI Conference Content')).toBeInTheDocument()
    
    // Check that content is rendered
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies proper CSS classes for professional design', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    // Check for navigation classes
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('bg-white', 'shadow-sm', 'border-b')
    
    // Check for proper container and layout classes
    const conBranding = screen.getByText('Con')
    expect(conBranding).toHaveClass('text-2xl', 'font-bold', 'text-gray-900', 'hover:text-blue-600', 'transition-colors')
  })

  it('has proper semantic HTML structure', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    // Check for semantic nav and main elements
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})