// lib/slug.ts
import { customAlphabet } from 'nanoid'

const nanoidAlpha = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6)

export function generateSlug(fullName: string): string {
  const base = fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-') || 'user'
  return `${base}-${nanoidAlpha()}`
}
