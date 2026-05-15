import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

vi.mock('@clerk/nextjs', () => ({
  UserButton: () => <div data-testid="user-button" />,
}))

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: Record<string, unknown>) => <img {...props} />,
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

describe('DashboardHeader', () => {
  it('renders the DigiResume title', () => {
    render(<DashboardHeader status="draft" publicUrl={null} userName="Jane Doe" />)
    expect(screen.getByText('DigiResume')).toBeInTheDocument()
  })

  it('renders Draft badge when status is draft', () => {
    render(<DashboardHeader status="draft" publicUrl={null} userName="Jane Doe" />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders Published badge when status is published', () => {
    render(<DashboardHeader status="published" publicUrl="/u/jane-doe" userName="Jane Doe" />)
    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('does not show public URL link when publicUrl is null', () => {
    render(<DashboardHeader status="draft" publicUrl={null} userName="Jane Doe" />)
    expect(screen.queryByText('/u/jane-doe')).not.toBeInTheDocument()
  })

  it('shows public URL link when publicUrl is provided', () => {
    render(<DashboardHeader status="published" publicUrl="/u/jane-doe" userName="Jane Doe" />)
    expect(screen.getByText('/u/jane-doe')).toBeInTheDocument()
  })

  it('shows copy URL icon button when publicUrl is provided', () => {
    render(<DashboardHeader status="published" publicUrl="/u/jane-doe" userName="Jane Doe" />)
    expect(screen.getByTitle('Copy URL to clipboard')).toBeInTheDocument()
  })

  it('does not show copy URL icon when publicUrl is null', () => {
    render(<DashboardHeader status="draft" publicUrl={null} userName="Jane Doe" />)
    expect(screen.queryByTitle('Copy URL to clipboard')).not.toBeInTheDocument()
  })

  it('renders UserButton', () => {
    render(<DashboardHeader status="draft" publicUrl={null} userName="Jane Doe" />)
    expect(screen.getByTestId('user-button')).toBeInTheDocument()
  })

  it('renders userName', () => {
    render(<DashboardHeader status="draft" publicUrl={null} userName="Jane Doe" />)
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('calls clipboard.writeText and shows toast when copy icon is clicked', async () => {
    const { toast } = await import('sonner')
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
    })
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    })

    render(<DashboardHeader status="published" publicUrl="/u/jane-doe" userName="Jane Doe" />)
    fireEvent.click(screen.getByTitle('Copy URL to clipboard'))
    expect(writeText).toHaveBeenCalledWith('http://localhost:3000/u/jane-doe')
    expect(toast.success).toHaveBeenCalledWith('URL is copied to clipboard')
  })

  it('public URL link has correct href and opens in new tab', () => {
    render(<DashboardHeader status="published" publicUrl="/u/jane-doe" userName="Jane Doe" />)
    const link = screen.getByText('/u/jane-doe').closest('a')
    expect(link).toHaveAttribute('href', '/u/jane-doe')
    expect(link).toHaveAttribute('target', '_blank')
  })
})
