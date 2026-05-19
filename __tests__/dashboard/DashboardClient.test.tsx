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

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: Record<string, unknown>) => <img {...props} />,
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

vi.mock('@/components/portfolio/PortfolioTemplate', () => ({
  PortfolioTemplate: () => <div data-testid="portfolio-template" />,
}))

vi.mock('@/components/portfolio/PortfolioPDF', () => ({
  PortfolioPDF: () => null,
}))

// ---- fixtures ----

const mockPortfolioData: PortfolioData = {
  hero: {
    name: 'Jane Doe',
    title: 'Engineer',
    bio: 'Bio text',
    profilePhoto: null,
    gender: 'female' as const,
  },
  about: 'About me',
  skills: ['TypeScript'],
  experience: [],
  projects: [],
  education: [],
  socialLinks: { github: '', linkedin: '', twitter: '', website: '', email: '', phone: '' },
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
  userName = 'Jane Doe',
) {
  return render(
    <DashboardClient
      initialPortfolio={initialPortfolio}
      initialData={initialData}
      usernameSlug={usernameSlug}
      userName={userName}
    />,
  )
}

// ---- tests ----

describe('DashboardClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    })
  })

  it('renders ResumeUploader when initialPortfolio is null', () => {
    renderClient(null, null)
    expect(screen.getByText(/Upload your resume to get started/i)).toBeInTheDocument()
    expect(screen.getByText(/Drop your resume here/i)).toBeInTheDocument()
    expect(screen.queryByText('Save')).not.toBeInTheDocument()
  })

  it('renders PortfolioEditor when portfolio exists', () => {
    renderClient(mockPortfolio, mockPortfolioData)
    expect(screen.getByRole('tab', { name: /Hero/ })).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.queryByText(/Upload your resume to get started/i)).not.toBeInTheDocument()
  })

  it('switches to preview mode when Preview is clicked', async () => {
    renderClient(mockPortfolio, mockPortfolioData)
    fireEvent.click(screen.getByText('Preview'))
    await waitFor(() => {
      expect(screen.getByTestId('portfolio-template')).toBeInTheDocument()
    })
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })

  it('switches back to edit mode from preview mode', async () => {
    renderClient(mockPortfolio, mockPortfolioData)
    fireEvent.click(screen.getByText('Preview'))
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Edit'))
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Hero/ })).toBeInTheDocument()
      expect(screen.queryByTestId('portfolio-template')).not.toBeInTheDocument()
    })
  })

  it('shows portfolio editor after handleGenerated is called', async () => {
    renderClient(null, null)
    expect(screen.getByText(/Upload your resume to get started/i)).toBeInTheDocument()

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
      expect(screen.getByRole('tab', { name: /Hero/ })).toBeInTheDocument()
    })

    vi.unstubAllGlobals()
  })

  it('renders DashboardHeader with draft status when portfolio is draft', () => {
    renderClient(mockPortfolio, mockPortfolioData)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('shows ActionBar only when portfolio exists', () => {
    const { unmount } = renderClient(null, null)
    expect(screen.queryByText('Save')).not.toBeInTheDocument()
    unmount()

    renderClient(mockPortfolio, mockPortfolioData)
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('calls POST /api/portfolio when Save is clicked', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    renderClient(mockPortfolio, mockPortfolioData)
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/portfolio',
        expect.objectContaining({ method: 'POST' }),
      )
    })

    vi.unstubAllGlobals()
  })

  it('calls POST /api/portfolio/publish when Publish is clicked', async () => {
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

  it('opens new tab on successful publish instead of redirecting', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"success":true}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    renderClient(mockPortfolio, mockPortfolioData)
    fireEvent.click(screen.getByText('Publish'))

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith('/u/jane-doe-ab1234', '_blank')
    })

    openSpy.mockRestore()
    vi.unstubAllGlobals()
  })

  it('updates status to published after successful publish', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"success":true}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(window, 'open').mockImplementation(() => null)

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
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })

    vi.unstubAllGlobals()
  })

  it('shows toast.error when handlePublish save step returns 400', async () => {
    const { toast } = await import('sonner')
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

  it('calls handleDownload and generates PDF when PDF is clicked', async () => {
    const { pdf } = await import('@react-pdf/renderer')
    const mockToBlob = vi.fn().mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }))
    ;(pdf as ReturnType<typeof vi.fn>).mockReturnValue({ toBlob: mockToBlob })

    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

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
    fireEvent.click(screen.getByText('PDF'))

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
    fireEvent.click(screen.getByText('PDF'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to generate PDF')
    })
  })

  it('initializes with published status when initialPortfolio is published', () => {
    const publishedPortfolio = { ...mockPortfolio, status: 'published' as const }
    renderClient(publishedPortfolio, mockPortfolioData)
    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('shows toast.success when Save succeeds', async () => {
    const { toast } = await import('sonner')
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    renderClient(mockPortfolio, mockPortfolioData)
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Draft saved successfully')
    })

    vi.unstubAllGlobals()
  })

  it('shows toast.error with fallback message when handleSave throws a non-Error', async () => {
    const { toast } = await import('sonner')
    const fetchMock = vi.fn().mockRejectedValue('string error')
    vi.stubGlobal('fetch', fetchMock)

    renderClient(mockPortfolio, mockPortfolioData)
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to save draft')
    })

    vi.unstubAllGlobals()
  })

  it('shows re-upload uploader when isReuploading is triggered from editor', async () => {
    renderClient(mockPortfolio, mockPortfolioData)
    fireEvent.click(screen.getByText('Re-upload Resume'))

    await waitFor(() => {
      expect(screen.getByText('Upload a new resume')).toBeInTheDocument()
    })
  })

  it('closes re-upload uploader via close button', async () => {
    renderClient(mockPortfolio, mockPortfolioData)
    fireEvent.click(screen.getByText('Re-upload Resume'))

    await waitFor(() => {
      expect(screen.getByText('Upload a new resume')).toBeInTheDocument()
    })

    const closeButtons = screen.getAllByRole('button')
    const closeBtn = closeButtons.find((btn) => btn.querySelector('svg path[d="M18 6 6 18"]'))
    expect(closeBtn).toBeDefined()
    fireEvent.click(closeBtn!)

    await waitFor(() => {
      expect(screen.queryByText('Upload a new resume')).not.toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /Hero/ })).toBeInTheDocument()
    })
  })
})
