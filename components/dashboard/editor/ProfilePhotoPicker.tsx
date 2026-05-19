'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Label } from '@/components/ui/label'
import type { HeroData, SocialLinks } from '@/lib/portfolio-types'

interface Props {
  hero: HeroData
  socialLinks: SocialLinks
  onPhotoChange: (profilePhoto: string | null) => void
}

function vikingFor(gender: HeroData['gender']): string {
  return gender === 'female' ? '/viking_women.jpeg' : '/viking_man.jpeg'
}

function githubAvatarFromUrl(githubUrl: string): string | null {
  const trimmed = githubUrl.trim()
  if (!trimmed) return null
  const username = trimmed.replace(/\/+$/, '').split('/').pop()
  if (!username) return null
  return `https://github.com/${username}.png`
}

export function ProfilePhotoPicker({ hero, socialLinks, onPhotoChange }: Props) {
  const vikingSrc = vikingFor(hero.gender)
  const githubSrc = githubAvatarFromUrl(socialLinks.github)
  const [githubAvailable, setGithubAvailable] = useState(false)

  // Probe the github avatar with an Image element. Using <img> sidesteps the
  // CORS preflight that fetch(HEAD) would trigger on github.com — we only need
  // to know whether the bytes load, not read them.
  useEffect(() => {
    if (!githubSrc) return
    const probe = new window.Image()
    probe.onload = () => setGithubAvailable(true)
    probe.onerror = () => setGithubAvailable(false)
    probe.src = githubSrc
    return () => {
      probe.onload = null
      probe.onerror = null
    }
  }, [githubSrc])

  // Auto-revert to Viking if the user previously selected a GitHub avatar
  // and then cleared the GitHub URL (or the URL became unreachable).
  useEffect(() => {
    if (hero.profilePhoto && (!githubSrc || !githubAvailable)) {
      onPhotoChange(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [githubSrc, githubAvailable])

  const selected: 'viking' | 'github' =
    hero.profilePhoto && githubSrc && hero.profilePhoto === githubSrc ? 'github' : 'viking'

  return (
    <div className="border border-white/20 rounded-lg p-4 space-y-3 bg-white/10">
      <Label>Profile Photo</Label>
      <p className="text-xs text-gray-600">
        Defaults to a local Viking image. If your GitHub URL has a public avatar, you can pick that
        instead.
      </p>
      <div className="flex flex-wrap gap-3">
        <PhotoOption
          id="profilePhoto-viking"
          label="Viking (default)"
          src={vikingSrc}
          checked={selected === 'viking'}
          onSelect={() => onPhotoChange(null)}
        />
        {githubSrc && githubAvailable && (
          <PhotoOption
            id="profilePhoto-github"
            label="GitHub avatar"
            src={githubSrc}
            checked={selected === 'github'}
            onSelect={() => onPhotoChange(githubSrc)}
            unoptimized
          />
        )}
      </div>
    </div>
  )
}

interface OptionProps {
  id: string
  label: string
  src: string
  checked: boolean
  onSelect: () => void
  unoptimized?: boolean
}

function PhotoOption({ id, label, src, checked, onSelect, unoptimized }: OptionProps) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer border transition-colors ${
        checked
          ? 'border-[#00cc88] bg-[#00cc88]/10'
          : 'border-white/30 bg-white/20 hover:border-white/60'
      }`}
    >
      <input
        id={id}
        type="radio"
        name="profilePhoto"
        checked={checked}
        onChange={onSelect}
        className="accent-[#00cc88]"
      />
      <Image
        src={src}
        alt={label}
        width={64}
        height={64}
        unoptimized={unoptimized}
        className="h-16 w-16 rounded-full object-cover border border-white/30"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}
