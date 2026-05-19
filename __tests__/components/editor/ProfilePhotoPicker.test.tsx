import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useState } from 'react'
import { ProfilePhotoPicker } from '@/components/dashboard/editor/ProfilePhotoPicker'
import type { HeroData, SocialLinks } from '@/lib/portfolio-types'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: Record<string, unknown>) => <img {...props} />,
}))

// We control the github avatar probe by replacing window.Image with a stub
// whose load/error we can fire on demand. This lets us assert that the GitHub
// option only appears once the probe succeeds.
type ImageProbe = {
  src: string
  onload: (() => void) | null
  onerror: (() => void) | null
}
const probes: ImageProbe[] = []

class StubImage implements ImageProbe {
  public src = ''
  public onload: (() => void) | null = null
  public onerror: (() => void) | null = null
  constructor() {
    probes.push(this)
  }
}

beforeEach(() => {
  probes.length = 0
  // @ts-expect-error overriding the constructor for testing
  window.Image = StubImage
})

const noSocials: SocialLinks = {
  github: '',
  linkedin: '',
  twitter: '',
  website: '',
  email: '',
  phone: '',
}
const githubSocials: SocialLinks = { ...noSocials, github: 'https://github.com/octocat' }

const heroFor = (gender: HeroData['gender'], profilePhoto: string | null = null): HeroData => ({
  name: 'Octo',
  title: 'Cat',
  bio: '',
  profilePhoto,
  gender,
})

describe('ProfilePhotoPicker', () => {
  it('shows only the Viking option when no GitHub URL is provided', () => {
    render(
      <ProfilePhotoPicker hero={heroFor('male')} socialLinks={noSocials} onPhotoChange={vi.fn()} />,
    )
    expect(screen.getByLabelText(/Viking/)).toBeInTheDocument()
    expect(screen.queryByLabelText(/GitHub avatar/)).not.toBeInTheDocument()
  })

  it('uses viking_women as the default thumbnail for female gender', () => {
    render(
      <ProfilePhotoPicker
        hero={heroFor('female')}
        socialLinks={noSocials}
        onPhotoChange={vi.fn()}
      />,
    )
    const img = screen.getByAltText('Viking (default)') as HTMLImageElement
    expect(img.src).toContain('/viking_women.jpeg')
  })

  it('reveals the GitHub option only after the avatar probe succeeds', () => {
    render(
      <ProfilePhotoPicker
        hero={heroFor('male')}
        socialLinks={githubSocials}
        onPhotoChange={vi.fn()}
      />,
    )
    // Before onload fires, only Viking is visible.
    expect(screen.queryByLabelText(/GitHub avatar/)).not.toBeInTheDocument()
    expect(probes).toHaveLength(1)
    expect(probes[0].src).toBe('https://github.com/octocat.png')

    act(() => probes[0].onload?.())

    expect(screen.getByLabelText(/GitHub avatar/)).toBeInTheDocument()
  })

  it('keeps the GitHub option hidden when the probe errors (404 / private)', () => {
    render(
      <ProfilePhotoPicker
        hero={heroFor('male')}
        socialLinks={githubSocials}
        onPhotoChange={vi.fn()}
      />,
    )
    act(() => probes[0].onerror?.())
    expect(screen.queryByLabelText(/GitHub avatar/)).not.toBeInTheDocument()
  })

  it('writes the github URL when the user picks GitHub, and null when reverting to Viking', () => {
    // Wrap in a controlled component so the radio's `checked` state updates
    // after each click — radios don't fire onChange when clicked while
    // already checked, which is what would happen if `hero.profilePhoto`
    // never advanced past null.
    function Harness() {
      const [photo, setPhoto] = useState<string | null>(null)
      onPhotoChangeSpy(photo) // capture each render's value into the spy via a side channel
      return (
        <ProfilePhotoPicker
          hero={heroFor('male', photo)}
          socialLinks={githubSocials}
          onPhotoChange={setPhoto}
        />
      )
    }
    const onPhotoChangeSpy = vi.fn<(p: string | null) => void>()
    render(<Harness />)
    act(() => probes[0].onload?.())

    fireEvent.click(screen.getByLabelText(/GitHub avatar/))
    expect(onPhotoChangeSpy).toHaveBeenCalledWith('https://github.com/octocat.png')

    fireEvent.click(screen.getByLabelText(/Viking/))
    expect(onPhotoChangeSpy).toHaveBeenLastCalledWith(null)
  })

  it('reflects an already-selected GitHub URL on initial render', () => {
    render(
      <ProfilePhotoPicker
        hero={heroFor('male', 'https://github.com/octocat.png')}
        socialLinks={githubSocials}
        onPhotoChange={vi.fn()}
      />,
    )
    act(() => probes[0].onload?.())

    const githubRadio = screen.getByLabelText(/GitHub avatar/) as HTMLInputElement
    expect(githubRadio).toBeChecked()
  })
})
