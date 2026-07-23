import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SlugEditor } from '@/components/dashboard/editor/SlugEditor'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

function typeSlug(value: string) {
  const input = screen.getByLabelText('Portfolio URL slug')
  fireEvent.change(input, { target: { value } })
  return input
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('SlugEditor', () => {
  it('renders the /u/ prefix and current slug', () => {
    render(<SlugEditor slug="jane-doe" onSlugChange={vi.fn()} />)
    expect(screen.getByText('/u/')).toBeInTheDocument()
    expect(screen.getByLabelText('Portfolio URL slug')).toHaveValue('jane-doe')
    expect(screen.getByText(/Current URL:/)).toBeInTheDocument()
  })

  it('shows an inline error for an invalid slug without calling the API', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<SlugEditor slug="jane-doe" onSlugChange={vi.fn()} />)

    typeSlug('ab')

    await waitFor(() => {
      expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument()
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows "available" when the API reports the slug is free', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ available: true, slug: 'new-name' })))
    vi.stubGlobal('fetch', fetchMock)
    render(<SlugEditor slug="jane-doe" onSlugChange={vi.fn()} />)

    typeSlug('new-name')

    await waitFor(() => {
      expect(screen.getByText(/is available/i)).toBeInTheDocument()
    })
  })

  it('shows "taken" when the API reports the slug is unavailable', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ available: false, error: 'That URL is already taken' })),
      )
    vi.stubGlobal('fetch', fetchMock)
    render(<SlugEditor slug="jane-doe" onSlugChange={vi.fn()} />)

    typeSlug('taken-name')

    await waitFor(() => {
      expect(screen.getByText(/already taken/i)).toBeInTheDocument()
    })
  })

  it('saves an available slug and fires onSlugChange', async () => {
    const onSlugChange = vi.fn()
    const fetchMock = vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === 'POST') {
        return Promise.resolve(new Response(JSON.stringify({ success: true, slug: 'new-name' })))
      }
      return Promise.resolve(new Response(JSON.stringify({ available: true, slug: 'new-name' })))
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<SlugEditor slug="jane-doe" onSlugChange={onSlugChange} />)

    typeSlug('new-name')
    await waitFor(() => {
      expect(screen.getByText(/is available/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Save URL/i }))

    await waitFor(() => {
      expect(onSlugChange).toHaveBeenCalledWith('new-name')
    })
  })

  it('disables Save when the slug is unchanged', () => {
    render(<SlugEditor slug="jane-doe" onSlugChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Save URL/i })).toBeDisabled()
  })

  it('surfaces a server error on save failure', async () => {
    const { toast } = await import('sonner')
    const fetchMock = vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === 'POST') {
        return Promise.resolve(
          new Response(JSON.stringify({ error: 'That URL is already taken' }), { status: 409 }),
        )
      }
      return Promise.resolve(new Response(JSON.stringify({ available: true, slug: 'new-name' })))
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<SlugEditor slug="jane-doe" onSlugChange={vi.fn()} />)

    typeSlug('new-name')
    await waitFor(() => {
      expect(screen.getByText(/is available/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Save URL/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('That URL is already taken')
    })
  })
})
