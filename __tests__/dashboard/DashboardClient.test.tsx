import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import type { Portfolio } from '@/lib/db/schema'
import type { PortfolioData } from '@/lib/portfolio-types'

// ---- module mocks ----

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@clerk/nextjs', () => ({
  UserButton: () => <div data-testid="user-button" />,
}))

vi.mock('@react-pdf/renderer', () => ({
  pdf: vi.fn(() => ({ toBlob: vi.fn().mockResolvedValue(new Blob()) })),
  Document: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Page: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  StyleSheet: { create: (s: unknown) => s },
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}))

// Stub out heavy portfolio sections so we don't need to render the entire tree
vi.mock('@/components/portfolio/PortfolioTemplate', () => ({
  PortfolioTemplate: () => <div data-testid="portfolio-template" />,
}))

vi.mock('@/components/portfolio/PortfolioPDF', () => ({
  PortfolioPDF: () => null,
}))

// ---- fixtures ----

const mockPortfolioData: PortfolioData = {
  hero: { name: 'Jane Doe', title: 'Engineer', bio: 'Bio text', profilePhoto: null },
  about: 'About me',
  skills: ['TypeScript'],
  experience: [],
  projects: [],
  education: [],
  socialLinks: { github: '', linkedin: '', twitter: '', website: '' },
}

const mockPortfolio: Portfolio = {
  id: 'uuid-1',
  userId: 'user_123',
  status: 'draft',
  portfolioData: 'encrypted-data',
  publishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// ---- helpers ----

function renderClient(
  initialPortfolio: Portfolio | null,
  initialData: PortfolioData | null,
  usernameSlug = 'jane-doe-ab1234',
) {
  return render(
    <DashboardClient
      initialPortfolio={initialPortfolio}
      initialData={initialData}
      usernameSlug={usernameSlug}
    />,
  )
}

// ---- tests ----

describe('DashboardClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // silence window.location usage in jsdom
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    })
  })

  it('renders ResumeUploader when initialPortfolio is null', () => {
    renderClient(null, null)

    expect(screen.getByText(/Upload your resume to get started/i)).toBeInTheDocument()
    expect(screen.getByText(/Drag & drop your resume PDF here/i)).toBeInTheDocument()
    // ActionBar should not be visible when there's no portfolio
    expect(screen.queryByText('Save Draft')).not.toBeInTheDocument()
  })

  it('renders PortfolioEditor when portfolio exists', () => {
    renderClient(mockPortfolio, mockPortfolioData)

    // PortfolioEditor renders tabs; the "hero" tab trigger should be visible
    expect(screen.getByText('hero')).toBeInTheDocument()
    // ActionBar should be present
    expect(screen.getByText('Save Draft')).toBeInTheDocument()
    // ResumeUploader should NOT be rendered
    expect(screen.queryByText(/Upload your resume to get started/i)).not.toBeInTheDocument()
  })

  it('switches to preview mode when mode toggle is clicked', async () => {
    renderClient(mockPortfolio, mockPortfolioData)

    // Initially in edit mode — "Preview" button toggles to preview
    const toggleBtn = screen.getByText('Preview')
    fireEvent.click(toggleBtn)

    await waitFor(() => {
      expect(screen.getByTestId('portfolio-template')).toBeInTheDocument()
    })
    // Now ActionBar shows "Back to Edit"
    expect(screen.getByText('Back to Edit')).toBeInTheDocument()
  })

  it('switches back to edit mode from preview mode', async () => {
    renderClient(mockPortfolio, mockPortfolioData)

    // Go to preview
    fireEvent.click(screen.getByText('Preview'))
    await waitFor(() => {
      expect(screen.getByText('Back to Edit')).toBeInTheDocument()
    })

    // Go back to edit
    fireEvent.click(screen.getByText('Back to Edit'))
    await waitFor(() => {
      expect(screen.getByText('hero')).toBeInTheDocument()
      expect(screen.queryByTestId('portfolio-template')).not.toBeInTheDocument()
    })
  })

  it('shows portfolio editor after handleGenerated is called', async () => {
    renderClient(null, null)
    expect(screen.getByText(/Upload your resume to get started/i)).toBeInTheDocument()

    // Simulate file upload and portfolio generation via ResumeUploader
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ portfolioData: mockPortfolioData }), { status: 200 }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['pdf content'], 'resume.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Generate Portfolio' })).not.toBeDisabled()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Generate Portfolio' }))

    await waitFor(() => {
      expect(screen.getByText('hero')).toBeInTheDocument()
    })

    vi.unstubAllGlobals()
  })

  it('renders DashboardHeader with draft status when portfolio is draft', () => {
    renderClient(mockPortfolio, mockPortfolioData)
    // Badge for "Draft" status
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('shows ActionBar only when portfolio exists', () => {
    const { unmount } = renderClient(null, null)
    expect(screen.queryByText('Save Draft')).not.toBeInTheDocument()
    unmount()

    renderClient(mockPortfolio, mockPortfolioData)
    expect(screen.getByText('Save Draft')).toBeInTheDocument()
  })

  it('calls POST /api/portfolio when Save Draft is clicked', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    renderClient(mockPortfolio, mockPortfolioData)
    fireEvent.click(screen.getByText('Save Draft'))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/portfolio',
        expect.objectContaining({ method: 'POST' }),
      )
    })

    vi.unstubAllGlobals()
  })

  it('calls POST /api/portfolio/publish when Publish is clicked', async () => {
    // handlePublish now auto-saves first, then publishes
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"success":true}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    renderClient(mockPortfolio, mockPortfolioData)
    fireEvent.click(screen.getByText('Publish'))

    await waitFor(() => {
      const calls = fetchMock.mock.calls.map((c) => c[0])
      expect(calls).toContain('/api/portfolio')
      expect(calls).toContain('/api/portfolio/publish')
    })

    vi.unstubAllGlobals()
  })

  it('updates status to published after successful publish', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"success":true}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    renderClient(mockPortfolio, mockPortfolioData)
    fireEvent.click(screen.getByText('Publish'))

    await waitFor(() => {
      expect(screen.getByText('Published')).toBeInTheDocument()
    })

    vi.unstubAllGlobals()
  })

  it('shows toast.error when handleSave API returns 400', async () => {
    const { toast } = await import('sonner')
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('{"error":"Validation failed"}', { status: 400 }))
    vi.stubGlobal('fetch', fetchMock)

    renderClient(mockPortfolio, mockPortfolioData)
    fireEvent.click(screen.getByText('Save Draft'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })

    vi.unstubAllGlobals()
  })

  it('shows toast.error when handlePublish save step returns 400', async () => {
    const { toast } = await import('sonner')
    // First fetch (auto-save) fails
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('{"error":"Save failed"}', { status: 400 }))
    vi.stubGlobal('fetch', fetchMock)

    renderClient(mockPortfolio, mockPortfolioData)
    fireEvent.click(screen.getByText('Publish'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to publish portfolio')
    })

    vi.unstubAllGlobals()
  })

  it('shows toast.error when handlePublish publish step returns 400', async () => {
    const { toast } = await import('sonner')
    // First fetch (auto-save) succeeds, second (publish) fails
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('{"ok":true}', { status: 200 }))
      .mockResolvedValueOnce(new Response('{"error":"Publish failed"}', { status: 400 }))
    vi.stubGlobal('fetch', fetchMock)

    renderClient(mockPortfolio, mockPortfolioData)
    fireEvent.click(screen.getByText('Publish'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to publish portfolio')
    })

    vi.unstubAllGlobals()
  })

  it('calls handleDownload and generates PDF when Download PDF is clicked', async () => {
    const { pdf } = await import('@react-pdf/renderer')
    const mockToBlob = vi.fn().mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }))
    ;(pdf as ReturnType<typeof vi.fn>).mockReturnValue({ toBlob: mockToBlob })

    // Mock URL methods using spyOn to avoid corrupting the global
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    // Intercept anchor click without mocking createElement (which would break React render)
    const originalCreateElement = document.createElement.bind(document)
    const clickSpy = vi.fn()
    vi.spyOn(document, 'createElement').mockImplementation((tag: string, ...args) => {
      const el = originalCreateElement(tag, ...args) as HTMLElement
      if (tag === 'a') {
        vi.spyOn(el, 'click').mockImplementation(clickSpy)
      }
      return el
    })

    renderClient(mockPortfolio, mockPortfolioData)
    fireEvent.click(screen.getByText('Download PDF'))

    await waitFor(() => {
      expect(mockToBlob).toHaveBeenCalled()
    })

    createObjectURL.mockRestore()
    revokeObjectURL.mockRestore()
    vi.mocked(document.createElement).mockRestore()
  })

  it('shows toast.error when handleDownload fails', async () => {
    const { toast } = await import('sonner')
    const { pdf } = await import('@react-pdf/renderer')
    ;(pdf as ReturnType<typeof vi.fn>).mockReturnValue({
      toBlob: vi.fn().mockRejectedValue(new Error('PDF failed')),
    })

    renderClient(mockPortfolio, mockPortfolioData)
    fireEvent.click(screen.getByText('Download PDF'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to generate PDF')
    })
  })

  it('initializes with published status when initialPortfolio is published', () => {
    const publishedPortfolio = { ...mockPortfolio, status: 'published' as const }
    renderClient(publishedPortfolio, mockPortfolioData)
    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('shows toast.error when handleSave fails with no error property in JSON', async () => {
    const { toast } = await import('sonner')
    // Return 400 with no error field in JSON
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 400 }))
    vi.stubGlobal('fetch', fetchMock)

    renderClient(mockPortfolio, mockPortfolioData)
    fireEvent.click(screen.getByText('Save Draft'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })

    vi.unstubAllGlobals()
  })

  it('shows toast.error with fallback message when handleSave throws a non-Error', async () => {
    const { toast } = await import('sonner')
    // Simulate fetch throwing a string (non-Error) which triggers ternary else branch
    const fetchMock = vi.fn().mockRejectedValue('string error')
    vi.stubGlobal('fetch', fetchMock)

    renderClient(mockPortfolio, mockPortfolioData)
    fireEvent.click(screen.getByText('Save Draft'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to save draft')
    })

    vi.unstubAllGlobals()
  })
})
