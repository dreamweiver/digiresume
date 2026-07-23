// lib/slug.ts
import { customAlphabet } from 'nanoid'

const nanoidAlpha = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6)

export function generateSlug(fullName: string): string {
  const base =
    fullName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-') || 'user'
  return `${base}-${nanoidAlpha()}`
}

export const SLUG_MIN_LENGTH = 3
export const SLUG_MAX_LENGTH = 30

// Words that collide with real routes under app/ or would be confusing as a
// public profile URL. Keep lowercase.
export const RESERVED_SLUGS = new Set([
  'api',
  'u',
  'sign-in',
  'sign-up',
  'dashboard',
  'admin',
  'settings',
  'login',
  'logout',
  'register',
  'about',
  'help',
  'support',
  'favicon',
  '_next',
  'static',
  'public',
  'null',
  'undefined',
])

/**
 * Normalize arbitrary user input into a slug-safe string: lowercase, spaces and
 * unsupported characters become hyphens, and repeated/leading/trailing hyphens
 * are collapsed away. Does NOT enforce length or reserved words — use
 * validateSlug for that.
 */
export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

/**
 * Validate a slug candidate (expected to already be normalized). Returns a
 * friendly error message when invalid so the UI/API can surface it directly.
 */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug) {
    return { valid: false, error: 'URL cannot be empty' }
  }
  if (slug.length < SLUG_MIN_LENGTH) {
    return { valid: false, error: `URL must be at least ${SLUG_MIN_LENGTH} characters` }
  }
  if (slug.length > SLUG_MAX_LENGTH) {
    return { valid: false, error: `URL must be ${SLUG_MAX_LENGTH} characters or fewer` }
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return {
      valid: false,
      error: 'Use only lowercase letters, numbers, and single hyphens',
    }
  }
  if (RESERVED_SLUGS.has(slug)) {
    return { valid: false, error: 'That URL is reserved. Please pick another.' }
  }
  return { valid: true }
}
