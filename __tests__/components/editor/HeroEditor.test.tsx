import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { HeroEditor } from '@/components/dashboard/editor/HeroEditor'
import type { HeroData, SocialLinks } from '@/lib/portfolio-types'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: Record<string, unknown>) => <img {...props} />,
}))

const emptyHero: HeroData = { name: '', title: '', bio: '', profilePhoto: null, gender: 'unknown' }
const filledHero: HeroData = {
  name: 'Jane Doe',
  title: 'Engineer',
  bio: 'My bio',
  profilePhoto: null,
  gender: 'female',
}
const noSocials: SocialLinks = {
  github: '',
  linkedin: '',
  twitter: '',
  website: '',
  email: '',
  phone: '',
}

describe('HeroEditor', () => {
  it('renders with initial values', () => {
    render(<HeroEditor hero={filledHero} socialLinks={noSocials} onChange={vi.fn()} />)
    expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Engineer')).toBeInTheDocument()
    expect(screen.getByDisplayValue('My bio')).toBeInTheDocument()
  })

  it('renders all labels', () => {
    render(<HeroEditor hero={emptyHero} socialLinks={noSocials} onChange={vi.fn()} />)
    expect(screen.getByText('Full Name')).toBeInTheDocument()
    expect(screen.getByText('Professional Title')).toBeInTheDocument()
    expect(screen.getByText('Bio')).toBeInTheDocument()
  })

  it('renders the ProfilePhotoPicker section', () => {
    render(<HeroEditor hero={filledHero} socialLinks={noSocials} onChange={vi.fn()} />)
    expect(screen.getByText('Profile Photo')).toBeInTheDocument()
    expect(screen.getByLabelText(/Viking/)).toBeInTheDocument()
  })

  it('calls onChange when name is changed', async () => {
    const onChange = vi.fn()
    render(<HeroEditor hero={filledHero} socialLinks={noSocials} onChange={onChange} />)
    const nameInput = screen.getByDisplayValue('Jane Doe')
    fireEvent.change(nameInput, { target: { value: 'New Name' } })
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
    })
  })

  it('shows name validation error when name is blurred empty', async () => {
    render(<HeroEditor hero={emptyHero} socialLinks={noSocials} onChange={vi.fn()} />)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.blur(inputs[0])
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })
  })

  it('shows title validation error when title is blurred empty', async () => {
    render(<HeroEditor hero={emptyHero} socialLinks={noSocials} onChange={vi.fn()} />)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.blur(inputs[1])
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })
  })

  it('shows bio validation error when bio is blurred empty', async () => {
    render(<HeroEditor hero={emptyHero} socialLinks={noSocials} onChange={vi.fn()} />)
    const inputs = screen.getAllByRole('textbox')
    // bio is the last input (textarea)
    fireEvent.blur(inputs[inputs.length - 1])
    await waitFor(() => {
      expect(screen.getByText('Bio is required')).toBeInTheDocument()
    })
  })

  it('calls onChange on mount', async () => {
    const onChange = vi.fn()
    render(<HeroEditor hero={filledHero} socialLinks={noSocials} onChange={onChange} />)
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
    })
  })

  it('propagates a photo selection through onChange with the picked URL', async () => {
    const onChange = vi.fn()
    const githubSocials = { ...noSocials, github: 'https://github.com/octocat' }
    // Stub window.Image so the picker probe resolves synchronously.
    type Probe = { onload: (() => void) | null; onerror: (() => void) | null; src: string }
    const probes: Probe[] = []
    class StubImage implements Probe {
      public src = ''
      public onload: (() => void) | null = null
      public onerror: (() => void) | null = null
      constructor() {
        probes.push(this)
      }
    }
    // @ts-expect-error stubbing constructor for jsdom
    window.Image = StubImage

    render(<HeroEditor hero={filledHero} socialLinks={githubSocials} onChange={onChange} />)
    // Resolve probe so the GitHub option appears.
    probes[0]?.onload?.()
    const githubRadio = await screen.findByLabelText(/GitHub avatar/)
    onChange.mockClear()
    fireEvent.click(githubRadio)
    await waitFor(() => {
      const lastCall = onChange.mock.calls.at(-1)?.[0]
      expect(lastCall?.profilePhoto).toBe('https://github.com/octocat.png')
      expect(lastCall?.name).toBe('Jane Doe')
    })
  })

  it('falls back to hero values when the form has not yet propagated edits', async () => {
    // Hero with a profile photo set; the picker's auto-revert effect calls
    // onPhotoChange(null) on mount because no GitHub URL is configured.
    // That exercises the `values.name ?? hero.name` fallback branch.
    const onChange = vi.fn()
    const heroWithPhoto = { ...filledHero, profilePhoto: 'https://github.com/octocat.png' }
    render(<HeroEditor hero={heroWithPhoto} socialLinks={noSocials} onChange={onChange} />)
    await waitFor(() => {
      const calls = onChange.mock.calls.map((c) => c[0])
      expect(calls.some((c) => c?.profilePhoto === null && c?.name === 'Jane Doe')).toBe(true)
    })
  })
})
