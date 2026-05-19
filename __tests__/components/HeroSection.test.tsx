import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { HeroSection } from '@/components/portfolio/sections/HeroSection'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: Record<string, unknown>) => <img {...props} />,
}))

const baseSocialLinks = { github: '', linkedin: '', twitter: '', website: '', email: '', phone: '' }

describe('HeroSection - profile photo priority', () => {
  it('uses profilePhoto when provided', () => {
    render(
      <HeroSection
        hero={{
          name: 'Jane',
          title: 'Dev',
          bio: '',
          profilePhoto: 'https://example.com/photo.jpg',
          gender: 'female',
        }}
        socialLinks={baseSocialLinks}
      />,
    )
    const img = screen.getByAltText('Jane')
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('falls back to GitHub avatar when no profilePhoto but github link exists', () => {
    render(
      <HeroSection
        hero={{ name: 'John', title: 'Dev', bio: '', profilePhoto: null, gender: 'male' }}
        socialLinks={{ ...baseSocialLinks, github: 'https://github.com/johndoe' }}
      />,
    )
    const img = screen.getByAltText('John')
    expect(img).toHaveAttribute('src', 'https://github.com/johndoe.png')
  })

  it('falls back to viking_man when no photo and no github (male)', () => {
    render(
      <HeroSection
        hero={{ name: 'Sam', title: 'Dev', bio: '', profilePhoto: null, gender: 'male' }}
        socialLinks={baseSocialLinks}
      />,
    )
    const img = screen.getByAltText('Sam')
    expect(img).toHaveAttribute('src', '/viking_man.jpeg')
  })

  it('falls back to viking_women when no photo and no github (female)', () => {
    render(
      <HeroSection
        hero={{ name: 'Alex', title: 'Dev', bio: '', profilePhoto: null, gender: 'female' }}
        socialLinks={baseSocialLinks}
      />,
    )
    const img = screen.getByAltText('Alex')
    expect(img).toHaveAttribute('src', '/viking_women.jpeg')
  })

  it('strips trailing slash from github URL before deriving avatar', () => {
    render(
      <HeroSection
        hero={{ name: 'Pat', title: 'Dev', bio: '', profilePhoto: null, gender: 'unknown' }}
        socialLinks={{ ...baseSocialLinks, github: 'https://github.com/patuser/' }}
      />,
    )
    const img = screen.getByAltText('Pat')
    expect(img).toHaveAttribute('src', 'https://github.com/patuser.png')
  })
})

describe('HeroSection - email and phone', () => {
  it('renders email with mailto link below bio when present', () => {
    render(
      <HeroSection
        hero={{ name: 'Jane', title: 'Dev', bio: 'My bio', profilePhoto: null, gender: 'female' }}
        socialLinks={{ ...baseSocialLinks, email: 'jane@example.com' }}
      />,
    )
    const link = screen.getByText('jane@example.com').closest('a')
    expect(link).toHaveAttribute('href', 'mailto:jane@example.com')
  })

  it('renders phone with tel link below bio when present', () => {
    render(
      <HeroSection
        hero={{ name: 'Jane', title: 'Dev', bio: 'My bio', profilePhoto: null, gender: 'female' }}
        socialLinks={{ ...baseSocialLinks, phone: '+1 234 567 8900' }}
      />,
    )
    const link = screen.getByText('+1 234 567 8900').closest('a')
    expect(link).toHaveAttribute('href', 'tel:+1 234 567 8900')
  })

  it('renders both email and phone when both are present', () => {
    render(
      <HeroSection
        hero={{ name: 'Jane', title: 'Dev', bio: 'My bio', profilePhoto: null, gender: 'female' }}
        socialLinks={{ ...baseSocialLinks, email: 'a@b.com', phone: '+44 20 1234 5678' }}
      />,
    )
    expect(screen.getByText('a@b.com')).toBeInTheDocument()
    expect(screen.getByText('+44 20 1234 5678')).toBeInTheDocument()
  })

  it('does not render email/phone block when both are empty', () => {
    render(
      <HeroSection
        hero={{ name: 'Jane', title: 'Dev', bio: 'My bio', profilePhoto: null, gender: 'female' }}
        socialLinks={baseSocialLinks}
      />,
    )
    expect(screen.queryByText(/mailto:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/tel:/)).not.toBeInTheDocument()
  })
})
