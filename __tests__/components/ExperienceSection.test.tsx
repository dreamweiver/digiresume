import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ExperienceSection } from '@/components/portfolio/sections/ExperienceSection'

describe('ExperienceSection', () => {
  it('returns null when experience array is empty', () => {
    const { container } = render(<ExperienceSection experience={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders a single sentence as a paragraph (no bullets)', () => {
    render(
      <ExperienceSection
        experience={[
          {
            company: 'Acme',
            role: 'Dev',
            startDate: 'January 2020',
            endDate: 'Present',
            description: 'Built web apps.',
          },
        ]}
      />,
    )
    expect(screen.getByText('Built web apps.')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('renders multiple sentences with first as paragraph and rest as bullets (fallback)', () => {
    render(
      <ExperienceSection
        experience={[
          {
            company: 'Acme',
            role: 'Dev',
            startDate: 'January 2020',
            endDate: 'Present',
            description: 'Led frontend team. Built React components. Improved performance by 40%.',
          },
        ]}
      />,
    )
    expect(screen.getByText('Led frontend team.')).toBeInTheDocument()
    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Built React components.')
    expect(items[1]).toHaveTextContent('Improved performance by 40%.')
  })

  it('renders structured highlights as bullet points', () => {
    render(
      <ExperienceSection
        experience={[
          {
            company: 'Acme',
            role: 'Dev',
            startDate: 'January 2020',
            endDate: 'Present',
            description: 'Led the frontend team.',
            highlights: ['Built 20+ React components', 'Reduced bundle size by 40%'],
          },
        ]}
      />,
    )
    expect(screen.getByText('Led the frontend team.')).toBeInTheDocument()
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Built 20+ React components')
    expect(items[1]).toHaveTextContent('Reduced bundle size by 40%')
  })

  it('renders technologies as tags', () => {
    render(
      <ExperienceSection
        experience={[
          {
            company: 'Acme',
            role: 'Dev',
            startDate: 'January 2020',
            endDate: 'Present',
            description: 'Full-stack development.',
            technologies: ['React', 'Node.js', 'TypeScript'],
          },
        ]}
      />,
    )
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('renders paragraph breaks from newlines in description', () => {
    render(
      <ExperienceSection
        experience={[
          {
            company: 'Acme',
            role: 'Dev',
            startDate: 'January 2020',
            endDate: 'Present',
            description: 'First paragraph about the role.\nSecond paragraph with more details.',
            highlights: ['A highlight'],
          },
        ]}
      />,
    )
    expect(screen.getByText('First paragraph about the role.')).toBeInTheDocument()
    expect(screen.getByText('Second paragraph with more details.')).toBeInTheDocument()
  })

  it('renders location when provided', () => {
    render(
      <ExperienceSection
        experience={[
          {
            company: 'Acme',
            role: 'Dev',
            location: 'New York, NY',
            startDate: 'January 2020',
            endDate: 'Present',
            description: 'Built things.',
          },
        ]}
      />,
    )
    expect(screen.getByText(/New York, NY/)).toBeInTheDocument()
  })

  it('does not render location dot when location is absent', () => {
    render(
      <ExperienceSection
        experience={[
          {
            company: 'Acme',
            role: 'Dev',
            startDate: 'January 2020',
            endDate: 'Present',
            description: 'Built things.',
          },
        ]}
      />,
    )
    expect(screen.queryByText(/·/)).not.toBeInTheDocument()
  })
})
