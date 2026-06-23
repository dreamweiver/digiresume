import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { HeroLanding } from '@/components/landing/HeroLanding'

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { priority: _priority, ...rest } = props as { priority?: boolean }
    void _priority
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} />
  },
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

describe('HeroLanding', () => {
  it('renders the hero headline and tagline', () => {
    render(<HeroLanding />)
    expect(screen.getByText(/Turn Your Resume/)).toBeInTheDocument()
    expect(screen.getByText(/Into a Portfolio/)).toBeInTheDocument()
    expect(screen.getByText(/AI-powered resume to portfolio in seconds/)).toBeInTheDocument()
  })

  it('renders the primary CTA pointing at /sign-up', () => {
    render(<HeroLanding />)
    const cta = screen.getByRole('link', { name: 'Get Started Free' })
    expect(cta).toHaveAttribute('href', '/sign-up')
  })

  it('renders the secondary Sign In link pointing at /sign-in', () => {
    render(<HeroLanding />)
    const link = screen.getByRole('link', { name: 'Sign In' })
    expect(link).toHaveAttribute('href', '/sign-in')
  })

  it('renders the app preview image', () => {
    render(<HeroLanding />)
    const img = screen.getByRole('img', { name: /DigiResume app preview/i })
    expect(img).toHaveAttribute('src', '/digiresume.jpg')
  })
})
