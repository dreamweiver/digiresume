import { describe, it, expect, vi } from 'vitest'
import { generateWithRetry, isRetryableGeminiError } from '@/lib/gemini-retry'

describe('isRetryableGeminiError', () => {
  it('returns true for overloaded error', () => {
    expect(
      isRetryableGeminiError(new Error('The model is overloaded. Please try again later.')),
    ).toBe(true)
  })

  it('returns true for 429 rate limit', () => {
    expect(isRetryableGeminiError(new Error('429 Too Many Requests: rate limit exceeded'))).toBe(
      true,
    )
  })

  it('returns true for 503 unavailable', () => {
    expect(isRetryableGeminiError(new Error('503 Service Unavailable'))).toBe(true)
  })

  it('returns true for RESOURCE_EXHAUSTED', () => {
    expect(isRetryableGeminiError(new Error('RESOURCE_EXHAUSTED: quota exceeded'))).toBe(true)
  })

  it('returns false for parse error', () => {
    expect(isRetryableGeminiError(new Error('Invalid JSON in response'))).toBe(false)
  })

  it('returns false for auth error', () => {
    expect(isRetryableGeminiError(new Error('401 Unauthorized'))).toBe(false)
  })

  it('returns false for non-Error inputs', () => {
    expect(isRetryableGeminiError('string error')).toBe(false)
    expect(isRetryableGeminiError(null)).toBe(false)
    expect(isRetryableGeminiError(undefined)).toBe(false)
  })
})

describe('generateWithRetry', () => {
  function makeModel(behavior: Array<'ok' | Error>) {
    let i = 0
    return {
      generateContent: vi.fn(async () => {
        const next = behavior[i++]
        if (next instanceof Error) throw next
        return { response: { text: () => 'parsed-text' } }
      }),
    }
  }

  it('returns text on first-attempt success', async () => {
    const model = makeModel(['ok'])
    const result = await generateWithRetry(model, 'prompt', { baseDelayMs: 1 })
    expect(result).toBe('parsed-text')
    expect(model.generateContent).toHaveBeenCalledTimes(1)
  })

  it('retries up to 3 times on transient errors and eventually succeeds', async () => {
    const model = makeModel([new Error('503 Service Unavailable'), new Error('overloaded'), 'ok'])
    const result = await generateWithRetry(model, 'prompt', { baseDelayMs: 1 })
    expect(result).toBe('parsed-text')
    expect(model.generateContent).toHaveBeenCalledTimes(3)
  })

  it('throws after 3 failed attempts on transient errors', async () => {
    const model = makeModel([
      new Error('503 Service Unavailable'),
      new Error('503 Service Unavailable'),
      new Error('503 Service Unavailable'),
    ])
    await expect(generateWithRetry(model, 'prompt', { baseDelayMs: 1 })).rejects.toThrow(
      '503 Service Unavailable',
    )
    expect(model.generateContent).toHaveBeenCalledTimes(3)
  })

  it('does NOT retry on non-retryable errors', async () => {
    const model = makeModel([new Error('Invalid prompt format')])
    await expect(generateWithRetry(model, 'prompt', { baseDelayMs: 1 })).rejects.toThrow(
      'Invalid prompt format',
    )
    expect(model.generateContent).toHaveBeenCalledTimes(1)
  })

  it('respects custom maxAttempts', async () => {
    const model = makeModel([new Error('overloaded'), new Error('overloaded')])
    await expect(
      generateWithRetry(model, 'prompt', { maxAttempts: 2, baseDelayMs: 1 }),
    ).rejects.toThrow('overloaded')
    expect(model.generateContent).toHaveBeenCalledTimes(2)
  })
})
