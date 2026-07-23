import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PortfolioEditor, EditorTabsList } from '@/components/dashboard/PortfolioEditor'
import { Tabs } from '@/components/ui/tabs'
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

function renderEditor(data: PortfolioData = testData, onChange = vi.fn()) {
  return render(
    <Tabs defaultValue="hero">
      <EditorTabsList />
      <PortfolioEditor
        data={data}
        onChange={onChange}
        slug="test-user-ab1234"
        onSlugChange={vi.fn()}
      />
    </Tabs>,
  )
}

describe('PortfolioEditor', () => {
  it('renders all 7 tab triggers', () => {
    renderEditor()
    expect(screen.getByRole('tab', { name: /Hero/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /About/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Skills/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Experience/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Projects/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Education/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Social/ })).toBeInTheDocument()
  })

  it('shows hero editor by default (first tab is active)', () => {
    renderEditor()
    expect(screen.getByText('Full Name')).toBeInTheDocument()
  })

  it('clicking the about tab shows AboutEditor', async () => {
    renderEditor()
    fireEvent.click(screen.getByRole('tab', { name: /About/ }))
    await waitFor(() => {
      expect(screen.getByText('About Me')).toBeInTheDocument()
    })
  })

  it('clicking the skills tab shows SkillsEditor', async () => {
    renderEditor()
    fireEvent.click(screen.getByRole('tab', { name: /Skills/ }))
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/skill/i)).toBeInTheDocument()
    })
  })

  it('clicking the experience tab shows ExperienceEditor', async () => {
    renderEditor()
    fireEvent.click(screen.getByRole('tab', { name: /Experience/ }))
    await waitFor(() => {
      expect(screen.getByText('+ Add Experience')).toBeInTheDocument()
    })
  })

  it('clicking the projects tab shows ProjectsEditor', async () => {
    renderEditor()
    fireEvent.click(screen.getByRole('tab', { name: /Projects/ }))
    await waitFor(() => {
      expect(screen.getByText('+ Add Project')).toBeInTheDocument()
    })
  })

  it('clicking the education tab shows EducationEditor', async () => {
    renderEditor()
    fireEvent.click(screen.getByRole('tab', { name: /Education/ }))
    await waitFor(() => {
      expect(screen.getByText('+ Add Education')).toBeInTheDocument()
    })
  })

  it('clicking the social tab shows SocialEditor', async () => {
    renderEditor()
    fireEvent.click(screen.getByRole('tab', { name: /Social/ }))
    await waitFor(() => {
      expect(screen.getByText('github')).toBeInTheDocument()
    })
  })

  it('calls onChange when hero editor changes name', async () => {
    const onChange = vi.fn()
    renderEditor(testData, onChange)
    const nameInput = screen.getByDisplayValue('Test User')
    fireEvent.change(nameInput, { target: { value: 'New Name' } })
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
    })
  })

  it('each tab trigger has a stable data-tab-id matching its value', () => {
    renderEditor()
    expect(screen.getByRole('tab', { name: /Hero/ })).toHaveAttribute('data-tab-id', 'hero')
    expect(screen.getByRole('tab', { name: /About/ })).toHaveAttribute('data-tab-id', 'about')
    expect(screen.getByRole('tab', { name: /Skills/ })).toHaveAttribute('data-tab-id', 'skills')
    expect(screen.getByRole('tab', { name: /Experience/ })).toHaveAttribute(
      'data-tab-id',
      'experience',
    )
    expect(screen.getByRole('tab', { name: /Projects/ })).toHaveAttribute('data-tab-id', 'projects')
    expect(screen.getByRole('tab', { name: /Education/ })).toHaveAttribute(
      'data-tab-id',
      'education',
    )
    expect(screen.getByRole('tab', { name: /Social/ })).toHaveAttribute('data-tab-id', 'social')
  })

  it('scrolls the active tab into view when the selection changes', async () => {
    const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView')
    renderEditor()
    scrollSpy.mockClear()
    fireEvent.click(screen.getByRole('tab', { name: /Projects/ }))
    await waitFor(() => {
      expect(scrollSpy).toHaveBeenCalledWith(
        expect.objectContaining({ inline: 'center', block: 'nearest' }),
      )
    })
    scrollSpy.mockRestore()
  })
})
