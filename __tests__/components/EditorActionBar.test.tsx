import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { EditorActionBar } from '@/components/dashboard/EditorActionBar'

describe('EditorActionBar', () => {
  function setup(overrides: Partial<React.ComponentProps<typeof EditorActionBar>> = {}) {
    const props = {
      mode: 'edit' as const,
      onToggleMode: vi.fn(),
      onPublish: vi.fn(),
      onReupload: vi.fn(),
      isPublishing: false,
      ...overrides,
    }
    render(<EditorActionBar {...props} />)
    return props
  }

  it('renders Preview button in edit mode', () => {
    setup({ mode: 'edit' })
    expect(screen.getByText('Preview')).toBeInTheDocument()
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
  })

  it('renders Edit button in preview mode', () => {
    setup({ mode: 'preview' })
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.queryByText('Preview')).not.toBeInTheDocument()
  })

  it('renders Publish button', () => {
    setup()
    expect(screen.getByText('Publish')).toBeInTheDocument()
  })

  it('shows "Publishing..." while publishing', () => {
    setup({ isPublishing: true })
    expect(screen.getByText('Publishing...')).toBeInTheDocument()
  })

  it('renders Re-upload Resume when onReupload provided', () => {
    setup()
    expect(screen.getByText('Re-upload Resume')).toBeInTheDocument()
  })

  it('does not render Re-upload Resume when onReupload omitted', () => {
    render(
      <EditorActionBar
        mode="preview"
        onToggleMode={vi.fn()}
        onPublish={vi.fn()}
        isPublishing={false}
      />,
    )
    expect(screen.queryByText('Re-upload Resume')).not.toBeInTheDocument()
  })

  it('fires onToggleMode when toggle clicked', () => {
    const props = setup()
    fireEvent.click(screen.getByText('Preview'))
    expect(props.onToggleMode).toHaveBeenCalledTimes(1)
  })

  it('fires onPublish when Publish clicked', () => {
    const props = setup()
    fireEvent.click(screen.getByText('Publish'))
    expect(props.onPublish).toHaveBeenCalledTimes(1)
  })

  it('fires onReupload when Re-upload clicked', () => {
    const props = setup()
    fireEvent.click(screen.getByText('Re-upload Resume'))
    expect(props.onReupload).toHaveBeenCalledTimes(1)
  })

  it('disables all buttons when isDisabled', () => {
    setup({ isDisabled: true })
    expect(screen.getByText('Preview').closest('button')).toBeDisabled()
    expect(screen.getByText('Publish').closest('button')).toBeDisabled()
    expect(screen.getByLabelText('Re-upload resume')).toBeDisabled()
  })
})
