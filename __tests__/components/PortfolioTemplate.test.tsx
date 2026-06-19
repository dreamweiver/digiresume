import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PortfolioTemplate } from '@/components/portfolio/PortfolioTemplate'
import type { PortfolioData } from '@/lib/portfolio-types'

const fullData: PortfolioData = {
  hero: {
    name: 'Ada Lovelace',
    title: 'Mathematician',
    bio: 'First programmer.',
    profilePhoto: null,
    gender: 'female',
  },
  about: 'About Ada.',
  skills: ['Algorithms', 'Mathematics'],
  experience: [
    {
      company: 'Analytical Engine Inc',
      role: 'Programmer',
      startDate: '1843',
      endDate: '1852',
      description: 'Wrote the first algorithm.',
    },
  ],
  projects: [
    {
      name: 'Note G',
      description: 'Bernoulli numbers algorithm.',
      techStack: ['Math'],
      liveUrl: '',
      githubUrl: '',
    },
  ],
  education: [
    { institution: 'Self-taught', degree: 'Mathematics', startDate: '1830', endDate: '1842' },
  ],
  socialLinks: {
    github: '',
    linkedin: '',
    twitter: '',
    website: '',
    email: '',
    phone: '',
  },
}

describe('PortfolioTemplate', () => {
  it('renders all sections when data is fully populated', () => {
    render(<PortfolioTemplate data={fullData} />)
    expect(screen.getByRole('heading', { name: 'About Me' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Skills' })).toBeInTheDocument()
    // Hero name appears in the hero section
    expect(screen.getAllByText(/Ada Lovelace/).length).toBeGreaterThan(0)
  })

  it('omits empty optional sections', () => {
    const minimal: PortfolioData = {
      ...fullData,
      about: '',
      skills: [],
    }
    render(<PortfolioTemplate data={minimal} />)
    expect(screen.queryByRole('heading', { name: 'About Me' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Skills' })).not.toBeInTheDocument()
  })
})
