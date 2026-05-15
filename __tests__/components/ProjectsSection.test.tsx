import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ProjectsSection } from '@/components/portfolio/sections/ProjectsSection'

describe('ProjectsSection', () => {
  it('returns null when projects array is empty', () => {
    const { container } = render(<ProjectsSection projects={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders heading as Side Projects', () => {
    render(
      <ProjectsSection
        projects={[
          { name: 'App', description: 'A cool app', techStack: [], liveUrl: '', githubUrl: '' },
        ]}
      />,
    )
    expect(screen.getByText('Side Projects')).toBeInTheDocument()
  })

  it('renders Demo button when liveUrl is provided', () => {
    render(
      <ProjectsSection
        projects={[
          {
            name: 'App',
            description: 'A cool app',
            techStack: [],
            liveUrl: 'https://app.example.com',
            githubUrl: '',
          },
        ]}
      />,
    )
    const demoLink = screen.getByText('Demo').closest('a')
    expect(demoLink).toHaveAttribute('href', 'https://app.example.com')
    expect(demoLink).toHaveAttribute('target', '_blank')
  })

  it('does not render Demo button when liveUrl is empty', () => {
    render(
      <ProjectsSection
        projects={[
          { name: 'App', description: 'A cool app', techStack: [], liveUrl: '', githubUrl: '' },
        ]}
      />,
    )
    expect(screen.queryByText('Demo')).not.toBeInTheDocument()
  })
})
