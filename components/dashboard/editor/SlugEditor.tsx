'use client'
import { useEffect, useRef, useState } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { normalizeSlug, validateSlug } from '@/lib/slug'

interface Props {
  slug: string
  onSlugChange: (slug: string) => void
}

type Status =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'available' }
  | { kind: 'invalid'; message: string }
  | { kind: 'taken'; message: string }

type RemoteCheck = { slug: string; available: boolean; error?: string }

export function SlugEditor({ slug, onSlugChange }: Props) {
  const [value, setValue] = useState(slug)
  const [prevSlug, setPrevSlug] = useState(slug)
  const [remote, setRemote] = useState<RemoteCheck | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync the field to the slug prop when it changes externally (e.g. after
  // save). This is the recommended "adjust state during render" pattern, which
  // avoids a synchronous setState inside an effect.
  if (slug !== prevSlug) {
    setPrevSlug(slug)
    setValue(slug)
    setRemote(null)
  }

  const normalized = normalizeSlug(value)
  const unchanged = normalized === slug
  const validation = validateSlug(normalized)

  // Derive the display status synchronously from render-time values plus the
  // latest async check result — no setState-in-effect needed.
  const status: Status = unchanged
    ? { kind: 'idle' }
    : !validation.valid
      ? { kind: 'invalid', message: validation.error ?? 'Invalid URL' }
      : remote?.slug === normalized
        ? remote.available
          ? { kind: 'available' }
          : { kind: 'taken', message: remote.error ?? 'That URL is already taken' }
        : { kind: 'checking' }

  const canSave = status.kind === 'available' && !isSaving && !unchanged

  // Debounced availability check — only runs the async fetch; all synchronous
  // state is derived above.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (unchanged || !validation.valid) return

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/portfolio/slug?slug=${encodeURIComponent(normalized)}`)
        const json = await res.json()
        setRemote({ slug: normalized, available: !!json.available, error: json.error })
      } catch {
        setRemote({ slug: normalized, available: false, error: 'Could not check availability' })
      }
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [normalized, unchanged, validation.valid])

  async function handleSave() {
    setIsSaving(true)
    try {
      const res = await fetch('/api/portfolio/slug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: normalized }),
      })
      const json = await res.json()
      if (!res.ok) {
        setRemote({
          slug: normalized,
          available: false,
          error: json.error ?? 'Failed to update URL',
        })
        toast.error(json.error ?? 'Failed to update URL')
        return
      }
      onSlugChange(json.slug)
      toast.success('Your portfolio URL was updated')
    } catch {
      toast.error('Failed to update URL')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="border border-white/10 rounded-xl p-4 space-y-3 bg-white/[0.04] backdrop-blur-sm">
      <div>
        <Label htmlFor="slug-input">Portfolio URL</Label>
        <p className="text-xs text-[#a1b3a8] mt-1">
          Pick a memorable link. Changing it stops the old URL from working.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="flex items-center flex-1 min-w-0 rounded-lg border border-[#1a3a2c] bg-[#0a2218]/40 focus-within:border-[#00e599]/60">
          <span className="pl-3 pr-1 text-sm text-[#6b7d72] shrink-0 select-none">/u/</span>
          <Input
            id="slug-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="your-name"
            aria-label="Portfolio URL slug"
            className="border-0 bg-transparent px-0 focus-visible:ring-0 focus:bg-transparent"
          />
        </div>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="shrink-0 rounded-full border border-[#00e599]/30 text-[#00e599] hover:border-[#00e599] hover:bg-[#00e599]/10 transition-all duration-200 bg-transparent disabled:opacity-40"
          variant="outline"
        >
          {isSaving ? 'Saving...' : 'Save URL'}
        </Button>
      </div>

      <StatusLine status={status} normalized={normalized} unchanged={unchanged} />
    </div>
  )
}

function StatusLine({
  status,
  normalized,
  unchanged,
}: {
  status: Status
  normalized: string
  unchanged: boolean
}) {
  if (unchanged) {
    return (
      <p className="text-xs text-[#6b7d72]">
        Current URL: <span className="text-[#a1b3a8]">/u/{normalized}</span>
      </p>
    )
  }
  switch (status.kind) {
    case 'checking':
      return (
        <p className="text-xs text-[#a1b3a8] inline-flex items-center gap-1.5">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking availability…
        </p>
      )
    case 'available':
      return (
        <p className="text-xs text-[#00e599] inline-flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5" /> /u/{normalized} is available
        </p>
      )
    case 'invalid':
    case 'taken':
      return (
        <p className="text-xs text-red-400 inline-flex items-center gap-1.5">
          <X className="h-3.5 w-3.5" /> {status.message}
        </p>
      )
    default:
      return null
  }
}
