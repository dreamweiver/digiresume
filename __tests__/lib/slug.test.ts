import { describe, it, expect } from 'vitest'
import { generateSlug } from '@/lib/slug'

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
