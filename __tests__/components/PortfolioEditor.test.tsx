import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PortfolioEditor } from '@/components/dashboard/PortfolioEditor'
import { EMPTY_PORTFOLIO } from '@/lib/portfolio-types'
import type { PortfolioData } from '@/lib/portfolio-types'

const testData: PortfolioData = {
  ...EMPTY_PORTFOLIO,
  hero: {
    name: 'Test User',
    title: 'Developer',
    bio: 'Hello',
    profilePhoto: null,
    gender: 'unknown' as const,
  },
  about: 'About me text',
  skills: ['TypeScript'],
}

describe('PortfolioEditor', () => {
  it('renders all 7 tab triggers', () => {
    render(<PortfolioEditor data={testData} onChange={vi.fn()} />)
    expect(screen.getByRole('tab', { name: /Hero/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /About/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Skills/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Experience/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Projects/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Education/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Social/ })).toBeInTheDocument()
  })

  it('shows hero editor by default (first tab is active)', () => {
    render(<PortfolioEditor data={testData} onChange={vi.fn()} />)
    // HeroEditor renders "Full Name" label
    expect(screen.getByText('Full Name')).toBeInTheDocument()
  })

  it('clicking the about tab shows AboutEditor', async () => {
    render(<PortfolioEditor data={testData} onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('tab', { name: /About/ }))
    await waitFor(() => {
      expect(screen.getByText('About Me')).toBeInTheDocument()
    })
  })

  it('clicking the skills tab shows SkillsEditor', async () => {
    render(<PortfolioEditor data={testData} onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('tab', { name: /Skills/ }))
    await waitFor(() => {
      // SkillsEditor renders an "Add a skill" placeholder; the tab also shows
      // "Skills", so we query something only the editor renders.
      expect(screen.getByPlaceholderText(/skill/i)).toBeInTheDocument()
    })
  })

  it('clicking the experience tab shows ExperienceEditor', async () => {
    render(<PortfolioEditor data={testData} onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('tab', { name: /Experience/ }))
    await waitFor(() => {
      expect(screen.getByText('+ Add Experience')).toBeInTheDocument()
    })
  })

  it('clicking the projects tab shows ProjectsEditor', async () => {
    render(<PortfolioEditor data={testData} onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('tab', { name: /Projects/ }))
    await waitFor(() => {
      expect(screen.getByText('+ Add Project')).toBeInTheDocument()
    })
  })

  it('clicking the education tab shows EducationEditor', async () => {
    render(<PortfolioEditor data={testData} onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('tab', { name: /Education/ }))
    await waitFor(() => {
      expect(screen.getByText('+ Add Education')).toBeInTheDocument()
    })
  })

  it('clicking the social tab shows SocialEditor', async () => {
    render(<PortfolioEditor data={testData} onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('tab', { name: /Social/ }))
    await waitFor(() => {
      expect(screen.getByText('github')).toBeInTheDocument()
    })
  })

  it('calls onChange when hero editor changes name', async () => {
    const onChange = vi.fn()
    render(<PortfolioEditor data={testData} onChange={onChange} />)
    const nameInput = screen.getByDisplayValue('Test User')
    fireEvent.change(nameInput, { target: { value: 'New Name' } })
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
    })
  })
})
