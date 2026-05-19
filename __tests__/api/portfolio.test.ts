import { describe, it, expect, beforeEach } from 'vitest'
import { encrypt, decrypt } from '@/lib/crypto'
import type { PortfolioData } from '@/lib/portfolio-types'

// Test the encrypt/decrypt round-trip for portfolio data
describe('portfolio data encryption round-trip', () => {
  beforeEach(() => {
    process.env.PORTFOLIO_ENCRYPTION_KEY = 'a'.repeat(64)
  })

  const mockPortfolio: PortfolioData = {
    hero: {
      name: 'Jane Doe',
      title: 'Engineer',
      bio: 'Bio here',
      profilePhoto: null,
      gender: 'female' as const,
    },
    about: 'About text',
    skills: ['TypeScript', 'React'],
    experience: [],
    projects: [],
    education: [],
    socialLinks: { github: '', linkedin: '', twitter: '', website: '', email: '', phone: '' },
  }

  it('encrypts and decrypts portfolio data without loss', () => {
    const encrypted = encrypt(JSON.stringify(mockPortfolio))
    const decrypted = JSON.parse(decrypt(encrypted)) as PortfolioData
    expect(decrypted.hero.name).toBe('Jane Doe')
    expect(decrypted.skills).toEqual(['TypeScript', 'React'])
  })

  it('produces an opaque encrypted string (not readable JSON)', () => {
    const encrypted = encrypt(JSON.stringify(mockPortfolio))
    expect(() => JSON.parse(encrypted)).toThrow()
  })
})
