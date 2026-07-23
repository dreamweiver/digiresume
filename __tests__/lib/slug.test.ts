import { describe, it, expect } from 'vitest'
import { generateSlug, normalizeSlug, validateSlug } from '@/lib/slug'

describe('generateSlug', () => {
  it('lowercases and hyphenates the name', () => {
    const slug = generateSlug('John Doe')
    expect(slug).toMatch(/^john-doe-[a-z0-9]{6}$/)
  })

  it('handles single name', () => {
    const slug = generateSlug('Madonna')
    expect(slug).toMatch(/^madonna-[a-z0-9]{6}$/)
  })

  it('strips special characters', () => {
    const slug = generateSlug('José García')
    expect(slug).toMatch(/^[a-z0-9-]+-[a-z0-9]{6}$/)
  })

  it('produces unique slugs on repeated calls', () => {
    const a = generateSlug('John Doe')
    const b = generateSlug('John Doe')
    expect(a).not.toEqual(b)
  })

  it('falls back to "user" when name is empty', () => {
    const slug = generateSlug('')
    expect(slug).toMatch(/^user-[a-z0-9]{6}$/)
  })
})

describe('normalizeSlug', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(normalizeSlug('Jane Doe')).toBe('jane-doe')
  })

  it('strips unsupported characters', () => {
    expect(normalizeSlug('José@García!')).toBe('jos-garc-a')
  })

  it('collapses repeated separators into a single hyphen', () => {
    expect(normalizeSlug('jane   doe___smith')).toBe('jane-doe-smith')
  })

  it('trims leading and trailing hyphens', () => {
    expect(normalizeSlug('  -jane-  ')).toBe('jane')
  })

  it('returns empty string for input with no alphanumerics', () => {
    expect(normalizeSlug('@@@')).toBe('')
  })
})

describe('validateSlug', () => {
  it('accepts a valid slug', () => {
    expect(validateSlug('jane-doe')).toEqual({ valid: true })
  })

  it('accepts numbers and hyphens', () => {
    expect(validateSlug('jane-doe-2')).toEqual({ valid: true })
  })

  it('rejects an empty slug', () => {
    const result = validateSlug('')
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/empty/i)
  })

  it('rejects a slug shorter than 3 characters', () => {
    const result = validateSlug('ab')
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/at least 3/i)
  })

  it('rejects a slug longer than 30 characters', () => {
    const result = validateSlug('a'.repeat(31))
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/30 characters or fewer/i)
  })

  it('rejects uppercase / invalid characters', () => {
    expect(validateSlug('Jane').valid).toBe(false)
    expect(validateSlug('jane_doe').valid).toBe(false)
  })

  it('rejects leading, trailing, and doubled hyphens', () => {
    expect(validateSlug('-jane').valid).toBe(false)
    expect(validateSlug('jane-').valid).toBe(false)
    expect(validateSlug('jane--doe').valid).toBe(false)
  })

  it('rejects reserved words', () => {
    expect(validateSlug('api').valid).toBe(false)
    expect(validateSlug('admin').valid).toBe(false)
    expect(validateSlug('sign-in').valid).toBe(false)
    expect(validateSlug('dashboard')).toEqual({
      valid: false,
      error: expect.stringMatching(/reserved/i),
    })
  })
})
