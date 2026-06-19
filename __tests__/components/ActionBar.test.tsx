import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ActionBar } from '@/components/dashboard/ActionBar'

describe('ActionBar', () => {
  function setup(
    overrides: Partial<React.ComponentProps<typeof ActionBar>> = {},
  ): React.ComponentProps<typeof ActionBar> {
    const props: React.ComponentProps<typeof ActionBar> = {
      onSaveDraft: vi.fn(),
      onDownloadPDF: vi.fn(),
      isSaving: false,
      isDownloading: false,
      ...overrides,
    }
    render(<ActionBar {...props} />)
    return props
  }

  it('renders Save and PDF buttons by default', () => {
    setup()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('PDF')).toBeInTheDocument()
  })

  it('shows "Saving..." while saving', () => {
    setup({ isSaving: true })
    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  it('shows "Downloading..." while downloading', () => {
    setup({ isDownloading: true })
    expect(screen.getByText('Downloading...')).toBeInTheDocument()
  })

  it('fires onSaveDraft when Save is clicked', () => {
    const props = setup()
    fireEvent.click(screen.getByText('Save'))
    expect(props.onSaveDraft).toHaveBeenCalledTimes(1)
  })

  it('fires onDownloadPDF when PDF is clicked', () => {
    const props = setup()
    fireEvent.click(screen.getByText('PDF'))
    expect(props.onDownloadPDF).toHaveBeenCalledTimes(1)
  })

  it('disables Save and PDF when isDisabled is true', () => {
    setup({ isDisabled: true })
    expect(screen.getByText('Save').closest('button')).toBeDisabled()
    expect(screen.getByText('PDF').closest('button')).toBeDisabled()
  })

  it('omits editor actions when editorMode is undefined', () => {
    setup()
    expect(screen.queryByLabelText('Preview')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Re-upload resume')).not.toBeInTheDocument()
    expect(screen.queryByText('Publish')).not.toBeInTheDocument()
  })

  it('renders editor actions (icon-only mobile preview/reupload/publish) when editorMode is set', () => {
    setup({
      editorMode: 'edit',
      onToggleMode: vi.fn(),
      onPublish: vi.fn(),
      onReupload: vi.fn(),
      isPublishing: false,
    })
    expect(screen.getByLabelText('Preview')).toBeInTheDocument()
    expect(screen.getByLabelText('Re-upload resume')).toBeInTheDocument()
    expect(screen.getByText('Publish')).toBeInTheDocument()
  })

  it('renders Edit button label when editorMode is preview', () => {
    setup({
      editorMode: 'preview',
      onToggleMode: vi.fn(),
      onPublish: vi.fn(),
      isPublishing: false,
    })
    expect(screen.getByLabelText('Edit')).toBeInTheDocument()
  })

  it('does not render Re-upload when onReupload omitted (e.g. preview mode)', () => {
    setup({
      editorMode: 'preview',
      onToggleMode: vi.fn(),
      onPublish: vi.fn(),
      isPublishing: false,
    })
    expect(screen.queryByLabelText('Re-upload resume')).not.toBeInTheDocument()
  })

  it('shows "Publishing..." when isPublishing is true', () => {
    setup({
      editorMode: 'edit',
      onToggleMode: vi.fn(),
      onPublish: vi.fn(),
      isPublishing: true,
    })
    expect(screen.getByText('Publishing...')).toBeInTheDocument()
  })

  it('fires onToggleMode when mobile preview/edit icon is clicked', () => {
    const onToggleMode = vi.fn()
    setup({
      editorMode: 'edit',
      onToggleMode,
      onPublish: vi.fn(),
      isPublishing: false,
    })
    fireEvent.click(screen.getByLabelText('Preview'))
    expect(onToggleMode).toHaveBeenCalledTimes(1)
  })

  it('fires onReupload when mobile re-upload icon is clicked', () => {
    const onReupload = vi.fn()
    setup({
      editorMode: 'edit',
      onToggleMode: vi.fn(),
      onPublish: vi.fn(),
      onReupload,
      isPublishing: false,
    })
    fireEvent.click(screen.getByLabelText('Re-upload resume'))
    expect(onReupload).toHaveBeenCalledTimes(1)
  })

  it('fires onPublish when mobile Publish is clicked', () => {
    const onPublish = vi.fn()
    setup({
      editorMode: 'edit',
      onToggleMode: vi.fn(),
      onPublish,
      isPublishing: false,
    })
    fireEvent.click(screen.getByText('Publish'))
    expect(onPublish).toHaveBeenCalledTimes(1)
  })

  it('disables editor actions when isDisabled is true', () => {
    setup({
      isDisabled: true,
      editorMode: 'edit',
      onToggleMode: vi.fn(),
      onPublish: vi.fn(),
      onReupload: vi.fn(),
      isPublishing: false,
    })
    expect(screen.getByLabelText('Preview')).toBeDisabled()
    expect(screen.getByLabelText('Re-upload resume')).toBeDisabled()
    expect(screen.getByText('Publish').closest('button')).toBeDisabled()
  })

  it('renders the @dreamweiver attribution link', () => {
    setup()
    const link = screen.getByRole('link', { name: '@dreamweiver' })
    expect(link).toHaveAttribute('href', 'https://github.com/dreamweiver')
    expect(link).toHaveAttribute('target', '_blank')
  })
})
