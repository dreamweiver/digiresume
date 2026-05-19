import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ContactSection } from '@/components/portfolio/sections/ContactSection'
import type { SocialLinks } from '@/lib/portfolio-types'

const emptyLinks: SocialLinks = {
  github: '',
  linkedin: '',
  twitter: '',
  website: '',
  email: '',
  phone: '',
}

describe('ContactSection', () => {
  it('renders the name', () => {
    render(<ContactSection socialLinks={emptyLinks} name="Jane Doe" />)
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('renders email with mailto link when present', () => {
    render(
      <ContactSection socialLinks={{ ...emptyLinks, email: 'jane@example.com' }} name="Jane Doe" />,
    )
    const emailLink = screen.getByText('jane@example.com').closest('a')
    expect(emailLink).toHaveAttribute('href', 'mailto:jane@example.com')
  })

  it('renders phone with tel link when present', () => {
    render(
      <ContactSection socialLinks={{ ...emptyLinks, phone: '+1 234 567 8900' }} name="Jane Doe" />,
    )
    const phoneLink = screen.getByText('+1 234 567 8900').closest('a')
    expect(phoneLink).toHaveAttribute('href', 'tel:+1 234 567 8900')
  })

  it('does not render email or phone when both are empty', () => {
    render(<ContactSection socialLinks={emptyLinks} name="Jane Doe" />)
    expect(screen.queryByText(/mailto:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/tel:/)).not.toBeInTheDocument()
  })

  it('renders both email and phone when both are present', () => {
    render(
      <ContactSection
        socialLinks={{ ...emptyLinks, email: 'a@b.com', phone: '+44 20 1234 5678' }}
        name="Jane Doe"
      />,
    )
    expect(screen.getByText('a@b.com')).toBeInTheDocument()
    expect(screen.getByText('+44 20 1234 5678')).toBeInTheDocument()
  })

  it('renders github icon link when github is present', () => {
    render(
      <ContactSection
        socialLinks={{ ...emptyLinks, github: 'https://github.com/jane' }}
        name="Jane Doe"
      />,
    )
    expect(screen.getByLabelText('GitHub')).toHaveAttribute('href', 'https://github.com/jane')
  })

  it('renders linkedin icon link when linkedin is present', () => {
    render(
      <ContactSection
        socialLinks={{ ...emptyLinks, linkedin: 'https://linkedin.com/in/jane' }}
        name="Jane Doe"
      />,
    )
    expect(screen.getByLabelText('LinkedIn')).toHaveAttribute(
      'href',
      'https://linkedin.com/in/jane',
    )
  })

  it('renders twitter icon link when twitter is present', () => {
    render(
      <ContactSection
        socialLinks={{ ...emptyLinks, twitter: 'https://twitter.com/jane' }}
        name="Jane Doe"
      />,
    )
    expect(screen.getByLabelText('Twitter')).toHaveAttribute('href', 'https://twitter.com/jane')
  })

  it('renders website icon link when website is present', () => {
    render(
      <ContactSection
        socialLinks={{ ...emptyLinks, website: 'https://jane.dev' }}
        name="Jane Doe"
      />,
    )
    expect(screen.getByLabelText('Website')).toHaveAttribute('href', 'https://jane.dev')
  })

  it('does not render social icon links when fields are empty', () => {
    render(<ContactSection socialLinks={emptyLinks} name="Jane Doe" />)
    expect(screen.queryByLabelText('GitHub')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('LinkedIn')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Twitter')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Website')).not.toBeInTheDocument()
  })
})
