import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SocialEditor } from '@/components/dashboard/editor/SocialEditor'
import type { SocialLinks } from '@/lib/portfolio-types'

const emptySocialLinks: SocialLinks = {
  github: '',
  linkedin: '',
  twitter: '',
  website: '',
  email: '',
  phone: '',
}

const filledSocialLinks: SocialLinks = {
  github: 'https://github.com/testuser',
  linkedin: 'https://linkedin.com/in/testuser',
  twitter: 'https://twitter.com/testuser',
  website: 'https://testuser.com',
  email: 'test@example.com',
  phone: '+1 234 567 8900',
}

describe('SocialEditor', () => {
  it('renders all 4 social link inputs', () => {
    render(<SocialEditor socialLinks={emptySocialLinks} onChange={vi.fn()} />)
    expect(screen.getByText('github')).toBeInTheDocument()
    expect(screen.getByText('linkedin')).toBeInTheDocument()
    expect(screen.getByText('twitter')).toBeInTheDocument()
    expect(screen.getByText('website')).toBeInTheDocument()
  })

  it('renders inputs with initial values', () => {
    render(<SocialEditor socialLinks={filledSocialLinks} onChange={vi.fn()} />)
    expect(screen.getByDisplayValue('https://github.com/testuser')).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://linkedin.com/in/testuser')).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://twitter.com/testuser')).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://testuser.com')).toBeInTheDocument()
  })

  it('calls onChange when GitHub URL is changed', async () => {
    const onChange = vi.fn()
    render(<SocialEditor socialLinks={emptySocialLinks} onChange={onChange} />)
    const githubInput = screen.getByPlaceholderText('https://github.com/username')
    fireEvent.change(githubInput, { target: { value: 'https://github.com/newuser' } })
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0] as SocialLinks
      expect(lastCall.github).toBe('https://github.com/newuser')
    })
  })

  it('calls onChange on mount', async () => {
    const onChange = vi.fn()
    render(<SocialEditor socialLinks={emptySocialLinks} onChange={onChange} />)
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
    })
  })

  it('renders correct placeholders for all inputs', () => {
    render(<SocialEditor socialLinks={emptySocialLinks} onChange={vi.fn()} />)
    expect(screen.getByPlaceholderText('https://github.com/username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('https://linkedin.com/username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('https://twitter.com/username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('https://yourwebsite.com')).toBeInTheDocument()
  })

  it('shows validation error when an invalid URL is entered and blurred', async () => {
    render(<SocialEditor socialLinks={emptySocialLinks} onChange={vi.fn()} />)
    const githubInput = screen.getByPlaceholderText('https://github.com/username')
    fireEvent.change(githubInput, { target: { value: 'not-a-url' } })
    fireEvent.blur(githubInput)
    await waitFor(() => {
      expect(screen.getByText('Must be a valid URL')).toBeInTheDocument()
    })
  })

  it('does not show error for valid URL', async () => {
    render(<SocialEditor socialLinks={emptySocialLinks} onChange={vi.fn()} />)
    const githubInput = screen.getByPlaceholderText('https://github.com/username')
    fireEvent.change(githubInput, { target: { value: 'https://github.com/user' } })
    fireEvent.blur(githubInput)
    await waitFor(() => {
      expect(screen.queryByText('Must be a valid URL')).not.toBeInTheDocument()
    })
  })
})
