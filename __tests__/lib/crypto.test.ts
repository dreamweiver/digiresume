import { describe, it, expect, beforeAll } from 'vitest'
import { encrypt, decrypt } from '@/lib/crypto'

beforeAll(() => {
  process.env.PORTFOLIO_ENCRYPTION_KEY = 'a'.repeat(64)
})

describe('encrypt / decrypt', () => {
  it('round-trips a string value', () => {
    const plaintext = JSON.stringify({ name: 'John Doe', skills: ['React'] })
    const ciphertext = encrypt(plaintext)
    expect(ciphertext).not.toEqual(plaintext)
    expect(decrypt(ciphertext)).toEqual(plaintext)
  })

  it('produces different ciphertext each call (random IV)', () => {
    const plaintext = 'same input'
    expect(encrypt(plaintext)).not.toEqual(encrypt(plaintext))
  })

  it('throws on tampered ciphertext', () => {
    const ciphertext = encrypt('hello')
    const tampered = ciphertext.slice(0, -4) + 'xxxx'
    expect(() => decrypt(tampered)).toThrow()
  })

  it('throws when PORTFOLIO_ENCRYPTION_KEY is missing', () => {
    const orig = process.env.PORTFOLIO_ENCRYPTION_KEY
    delete process.env.PORTFOLIO_ENCRYPTION_KEY
    expect(() => encrypt('test')).toThrow(
      'PORTFOLIO_ENCRYPTION_KEY must be a 64-char hex string (32 bytes)',
    )
    process.env.PORTFOLIO_ENCRYPTION_KEY = orig
  })

  it('throws when PORTFOLIO_ENCRYPTION_KEY is wrong length', () => {
    const orig = process.env.PORTFOLIO_ENCRYPTION_KEY
    process.env.PORTFOLIO_ENCRYPTION_KEY = 'tooshort'
    expect(() => encrypt('test')).toThrow(
      'PORTFOLIO_ENCRYPTION_KEY must be a 64-char hex string (32 bytes)',
    )
    process.env.PORTFOLIO_ENCRYPTION_KEY = orig
  })

  it('throws when ciphertext is missing sections', () => {
    expect(() => decrypt('onlyone')).toThrow('Invalid ciphertext format')
  })

  it('throws when ciphertext has empty section', () => {
    expect(() => decrypt('part1::part3')).toThrow('Invalid ciphertext format')
  })
})
