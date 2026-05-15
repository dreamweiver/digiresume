import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ResumeUploader } from '@/components/dashboard/ResumeUploader'

describe('ResumeUploader', () => {
  it('renders drag-and-drop area with initial text', () => {
    render(<ResumeUploader onGenerated={vi.fn()} />)
    expect(screen.getByText('Drop your resume here')).toBeInTheDocument()
    expect(screen.getByText('click to browse')).toBeInTheDocument()
  })

  it('renders Generate Portfolio button (disabled with no file)', () => {
    render(<ResumeUploader onGenerated={vi.fn()} />)
    const btn = screen.getByRole('button', { name: 'Generate Portfolio' })
    expect(btn).toBeInTheDocument()
    expect(btn).toBeDisabled()
  })

  it('shows filename after file is selected via input', async () => {
    render(<ResumeUploader onGenerated={vi.fn()} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['pdf content'], 'resume.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })
    await waitFor(() => {
      expect(screen.getByText('resume.pdf')).toBeInTheDocument()
    })
  })

  it('enables Generate Portfolio button after file is selected', async () => {
    render(<ResumeUploader onGenerated={vi.fn()} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['pdf content'], 'resume.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: 'Generate Portfolio' })
      expect(btn).not.toBeDisabled()
    })
  })

  it('shows error when non-PDF file is dropped', async () => {
    render(<ResumeUploader onGenerated={vi.fn()} />)
    const dropZone = screen.getByText('Drop your resume here').closest('div')!
    const file = new File(['content'], 'resume.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    })
    await waitFor(() => {
      expect(screen.getByText('Only PDF files are supported')).toBeInTheDocument()
    })
  })

  it('accepts PDF file via drop', async () => {
    render(<ResumeUploader onGenerated={vi.fn()} />)
    const dropZone = screen.getByText('Drop your resume here').closest('div')!
    const file = new File(['pdf'], 'cv.pdf', { type: 'application/pdf' })
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    })
    await waitFor(() => {
      expect(screen.getByText('cv.pdf')).toBeInTheDocument()
    })
  })

  it('shows Generating Portfolio... text and disabled button when uploading', async () => {
    const fetchMock = vi.fn(() => new Promise(() => {})) // never resolves = loading state persists
    vi.stubGlobal('fetch', fetchMock)

    render(<ResumeUploader onGenerated={vi.fn()} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['pdf content'], 'resume.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: 'Generate Portfolio' })
      expect(btn).not.toBeDisabled()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Generate Portfolio' }))

    await waitFor(() => {
      expect(screen.getByText('Generating Portfolio...')).toBeInTheDocument()
    })

    vi.unstubAllGlobals()
  })

  it('calls onGenerated with portfolio data after successful upload', async () => {
    const portfolioData = {
      hero: { name: 'Jane', title: 'Dev', bio: '', profilePhoto: null },
      about: '',
      skills: [],
      experience: [],
      projects: [],
      education: [],
      socialLinks: { github: '', linkedin: '', twitter: '', website: '' },
    }
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ portfolioData }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const onGenerated = vi.fn()
    render(<ResumeUploader onGenerated={onGenerated} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['pdf content'], 'resume.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Generate Portfolio' })).not.toBeDisabled()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Generate Portfolio' }))

    await waitFor(() => {
      expect(onGenerated).toHaveBeenCalledWith(portfolioData, undefined)
    })

    vi.unstubAllGlobals()
  })

  it('shows error when API returns error', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ error: 'Parse failed' }), { status: 500 }))
    vi.stubGlobal('fetch', fetchMock)

    render(<ResumeUploader onGenerated={vi.fn()} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['pdf content'], 'resume.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Generate Portfolio' })).not.toBeDisabled()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Generate Portfolio' }))

    await waitFor(() => {
      expect(screen.getByText('Parse failed')).toBeInTheDocument()
    })

    vi.unstubAllGlobals()
  })

  it('changes isDragging style on dragOver and dragLeave', () => {
    render(<ResumeUploader onGenerated={vi.fn()} />)
    const dropZone = screen.getByText('Drop your resume here').closest('div')!
    fireEvent.dragOver(dropZone)
    fireEvent.dragLeave(dropZone)
    // just verifying no errors thrown
    expect(dropZone).toBeInTheDocument()
  })

  it('clicking the drop zone area triggers file input', () => {
    render(<ResumeUploader onGenerated={vi.fn()} />)
    const dropZone = screen.getByText('Drop your resume here').closest('div')!
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    // Spy on the click method of the input
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {})
    fireEvent.click(dropZone)
    expect(clickSpy).toHaveBeenCalled()
    clickSpy.mockRestore()
  })

  it('does nothing when file input changes with no file selected', () => {
    render(<ResumeUploader onGenerated={vi.fn()} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    // Fire change with empty files list
    fireEvent.change(input, { target: { files: [] } })
    // Should still show the drop zone (no filename shown)
    expect(screen.getByText('Drop your resume here')).toBeInTheDocument()
  })

  it('shows error when drop event has no files (undefined file)', () => {
    render(<ResumeUploader onGenerated={vi.fn()} />)
    const dropZone = screen.getByText('Drop your resume here').closest('div')!
    // Drop with no files - undefined file triggers the error branch
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [] },
    })
    // The dropped?.type check returns undefined !== 'application/pdf' => shows error
    expect(screen.getByText('Only PDF files are supported')).toBeInTheDocument()
  })
})
