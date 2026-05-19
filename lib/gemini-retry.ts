// Retry helper for transient Gemini API errors (rate limit, overloaded, 5xx).
// Real parsing or auth errors are NOT retried — they bubble up immediately.

interface GenerativeModel {
  generateContent: (prompt: string) => Promise<{ response: { text: () => string } }>
}

const RETRYABLE_PATTERNS = [
  'overloaded',
  'rate limit',
  'rate-limit',
  'quota',
  'resource_exhausted',
  'unavailable',
  'try again',
  'busy',
  '429',
  '503',
  '500',
] as const

export function isRetryableGeminiError(e: unknown): boolean {
  if (!(e instanceof Error)) return false
  const msg = e.message.toLowerCase()
  return RETRYABLE_PATTERNS.some((p) => msg.includes(p))
}

export async function generateWithRetry(
  model: GenerativeModel,
  prompt: string,
  options: { maxAttempts?: number; baseDelayMs?: number } = {},
): Promise<string> {
  const maxAttempts = options.maxAttempts ?? 3
  const baseDelayMs = options.baseDelayMs ?? 1000
  let lastError: unknown
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (e) {
      lastError = e
      if (!isRetryableGeminiError(e) || attempt === maxAttempts) throw e
      // Exponential backoff with jitter so concurrent callers don't retry in
      // lockstep against the same overload window: 1s±25%, 2s±25%, 4s±25%.
      const expDelay = baseDelayMs * 2 ** (attempt - 1)
      const jitter = expDelay * 0.25 * (Math.random() * 2 - 1)
      await new Promise((res) => setTimeout(res, expDelay + jitter))
    }
  }
  throw lastError
}
