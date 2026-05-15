import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PortfolioEditor } from '@/components/dashboard/PortfolioEditor'
import { EMPTY_PORTFOLIO } from '@/lib/portfolio-types'
import type { PortfolioData } from '@/lib/portfolio-types'

const testData: PortfolioData = {
  ...EMPTY_PORTFOLIO,
  hero: { name: 'Test User', title: 'Developer', bio: 'Hello', profilePhoto: null },
  about: 'About me text',
  skills: ['TypeScript'],
}

describe('PortfolioEditor', () => {
  it('renders all 7 tab triggers', () => {
    render(<PortfolioEditor data={testData} onChange={vi.fn()} />)
    expect(screen.getByText('hero')).toBeInTheDocument()
    expect(screen.getByText('about')).toBeInTheDocument()
    expect(screen.getByText('skills')).toBeInTheDocument()
    expect(screen.getByText('experience')).toBeInTheDocument()
    expect(screen.getByText('projects')).toBeInTheDocument()
    expect(screen.getByText('education')).toBeInTheDocument()
    expect(screen.getByText('social')).toBeInTheDocument()
  })

  it('shows hero editor by default (first tab is active)', () => {
    render(<PortfolioEditor data={testData} onChange={vi.fn()} />)
    // HeroEditor renders "Full Name" label
    expect(screen.getByText('Full Name')).toBeInTheDocument()
  })

  it('clicking the about tab shows AboutEditor', async () => {
    render(<PortfolioEditor data={testData} onChange={vi.fn()} />)
    fireEvent.click(screen.getByText('about'))
    await waitFor(() => {
      expect(screen.getByText('About Me')).toBeInTheDocument()
    })
  })

  it('clicking the skills tab shows SkillsEditor', async () => {
    render(<PortfolioEditor data={testData} onChange={vi.fn()} />)
    fireEvent.click(screen.getByText('skills'))
    await waitFor(() => {
      expect(screen.getByText('Skills')).toBeInTheDocument()
    })
  })

  it('clicking the experience tab shows ExperienceEditor', async () => {
    render(<PortfolioEditor data={testData} onChange={vi.fn()} />)
    fireEvent.click(screen.getByText('experience'))
    await waitFor(() => {
      expect(screen.getByText('+ Add Experience')).toBeInTheDocument()
    })
  })

  it('clicking the projects tab shows ProjectsEditor', async () => {
    render(<PortfolioEditor data={testData} onChange={vi.fn()} />)
    fireEvent.click(screen.getByText('projects'))
    await waitFor(() => {
      expect(screen.getByText('+ Add Project')).toBeInTheDocument()
    })
  })

  it('clicking the education tab shows EducationEditor', async () => {
    render(<PortfolioEditor data={testData} onChange={vi.fn()} />)
    fireEvent.click(screen.getByText('education'))
    await waitFor(() => {
      expect(screen.getByText('+ Add Education')).toBeInTheDocument()
    })
  })

  it('clicking the social tab shows SocialEditor', async () => {
    render(<PortfolioEditor data={testData} onChange={vi.fn()} />)
    fireEvent.click(screen.getByText('social'))
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

  it('renders Re-upload Resume button when onReupload is passed', () => {
    render(<PortfolioEditor data={testData} onChange={vi.fn()} onReupload={vi.fn()} />)
    expect(screen.getByText('Re-upload Resume')).toBeInTheDocument()
  })

  it('does not render Re-upload Resume button when onReupload is not passed', () => {
    render(<PortfolioEditor data={testData} onChange={vi.fn()} />)
    expect(screen.queryByText('Re-upload Resume')).not.toBeInTheDocument()
  })

  it('calls onReupload when Re-upload Resume button is clicked', () => {
    const onReupload = vi.fn()
    render(<PortfolioEditor data={testData} onChange={vi.fn()} onReupload={onReupload} />)
    fireEvent.click(screen.getByText('Re-upload Resume'))
    expect(onReupload).toHaveBeenCalledTimes(1)
  })
})
