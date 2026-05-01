import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

vi.mock('@clerk/nextjs', () => ({
  UserButton: () => <div data-testid="user-button" />,
}))

describe('DashboardHeader', () => {
  it('renders the DigiResume title', () => {
    render(<DashboardHeader status="draft" publicUrl={null} />)
    expect(screen.getByText('DigiResume')).toBeInTheDocument()
  })

  it('renders Draft badge when status is draft', () => {
    render(<DashboardHeader status="draft" publicUrl={null} />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders Published badge when status is published', () => {
    render(<DashboardHeader status="published" publicUrl="/p/jane-doe" />)
    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('does not show Copy Portfolio URL button when publicUrl is null', () => {
    render(<DashboardHeader status="draft" publicUrl={null} />)
    expect(screen.queryByText('Copy Portfolio URL')).not.toBeInTheDocument()
  })

  it('shows Copy Portfolio URL button when publicUrl is provided', () => {
    render(<DashboardHeader status="published" publicUrl="/p/jane-doe" />)
    expect(screen.getByText('Copy Portfolio URL')).toBeInTheDocument()
  })

  it('shows View Live button when publicUrl is provided', () => {
    render(<DashboardHeader status="published" publicUrl="/p/jane-doe" />)
    expect(screen.getByText('View Live')).toBeInTheDocument()
  })

  it('does not show View Live button when publicUrl is null', () => {
    render(<DashboardHeader status="draft" publicUrl={null} />)
    expect(screen.queryByText('View Live')).not.toBeInTheDocument()
  })

  it('renders UserButton', () => {
    render(<DashboardHeader status="draft" publicUrl={null} />)
    expect(screen.getByTestId('user-button')).toBeInTheDocument()
  })

  it('calls clipboard.writeText when Copy Portfolio URL is clicked', () => {
    const writeText = vi.fn()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
    })
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    })

    render(<DashboardHeader status="published" publicUrl="/p/jane-doe" />)
    fireEvent.click(screen.getByText('Copy Portfolio URL'))
    expect(writeText).toHaveBeenCalledWith('http://localhost:3000/p/jane-doe')
  })

  it('View Live link has correct href', () => {
    render(<DashboardHeader status="published" publicUrl="/p/jane-doe" />)
    const link = screen.getByText('View Live').closest('a')
    expect(link).toHaveAttribute('href', '/p/jane-doe')
  })
})
