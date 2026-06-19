/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const mockAuth = vi.fn()
const mockCurrentUser = vi.fn()
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
  currentUser: () => mockCurrentUser(),
}))

const dbLimit = vi.fn()
const dbOnConflict = vi.fn()
// Drizzle's builder is a thenable: you can either await it directly OR chain
// further methods like .onConflictDoNothing(). Model both: dbValues returns an
// object with `.onConflictDoNothing` AND a `.then` that resolves with whatever
// dbValuesResult is currently set to.
const dbValuesResult = vi.fn()
const dbValues = vi.fn(() => ({
  onConflictDoNothing: dbOnConflict,
  then: (resolve: (v: unknown) => void, reject: (e: unknown) => void) =>
    dbValuesResult().then(resolve, reject),
}))
const dbSet = vi.fn()
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: dbLimit,
    insert: vi.fn().mockReturnThis(),
    values: dbValues,
    update: vi.fn().mockReturnThis(),
    set: dbSet,
  },
}))

vi.mock('@/lib/db/schema', () => ({
  users: { id: 'id' },
  portfolios: { userId: 'userId' },
}))

vi.mock('@/lib/crypto', () => ({
  encrypt: vi.fn((data: string) => `encrypted:${data}`),
}))

vi.mock('@/lib/slug', () => ({
  generateSlug: vi.fn(() => 'test-user-abc123'),
}))

const mockGenerateContent = vi.fn()
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent: mockGenerateContent }
    }
  },
}))

describe('POST /api/parse', () => {
  const samplePdf = readFileSync(resolve(__dirname, '../mock/sample-resume.pdf'))
  const sampleDocx = readFileSync(resolve(__dirname, '../fixtures/sample-resume-plain.docx'))
  const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

  const mockPortfolioData = {
    hero: {
      name: 'Manoj Kumar',
      title: 'Software Engineer',
      bio: 'A developer',
      profilePhoto: null,
      gender: 'unknown',
    },
    about: 'About text',
    skills: ['React', 'TypeScript'],
    experience: [
      {
        company: 'Acme',
        role: 'Dev',
        startDate: '2020',
        endDate: 'present',
        description: 'Built things',
      },
    ],
    projects: [
      { name: 'App', description: 'An app', techStack: ['React'], liveUrl: '', githubUrl: '' },
    ],
    education: [{ institution: 'University', degree: 'CS', startDate: '2016', endDate: '2020' }],
    socialLinks: { github: '', linkedin: '', twitter: '', website: '', email: '', phone: '' },
  }

  // Default db sequence: existing user found → no existing portfolio (insert path).
  function defaultDbHappyPath() {
    dbLimit
      .mockResolvedValueOnce([{ id: 'user_test123', usernameSlug: 'test-user-abc123' }])
      .mockResolvedValueOnce([])
    dbValuesResult.mockResolvedValue(undefined)
    dbSet.mockReturnThis()
    dbOnConflict.mockResolvedValue(undefined)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ userId: 'user_test123' })
    mockCurrentUser.mockResolvedValue({
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    })
    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(mockPortfolioData) },
    })
    defaultDbHappyPath()
  })

  async function callRoute(file?: File) {
    const { POST } = await import('@/app/api/parse/route')
    const formData = new FormData()
    if (file) formData.append('resume', file)
    const req = new Request('http://localhost/api/parse', { method: 'POST', body: formData })
    const { NextRequest } = await import('next/server')
    return POST(new NextRequest(req))
  }

  it('returns 400 if no file is uploaded', async () => {
    const res = await callRoute()
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('No file uploaded')
  })

  it('returns 400 if file is not a PDF or DOCX', async () => {
    const file = new File(['hello'], 'resume.txt', { type: 'text/plain' })
    const res = await callRoute(file)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Only PDF or DOCX files are supported')
  })

  it('returns 502 with a friendly message if Gemini API fails (technical detail not leaked)', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Model not found'))
    const file = new File([samplePdf], 'resume.pdf', { type: 'application/pdf' })
    const res = await callRoute(file)
    expect(res.status).toBe(502)
    const json = await res.json()
    expect(json.error).toBe("We couldn't process your resume. Please try again.")
    // The raw model error must not appear in the user-facing payload.
    expect(json.error).not.toContain('Model not found')
  })

  it('returns 500 if AI response is not valid JSON', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => 'not json at all' },
    })
    const file = new File([samplePdf], 'resume.pdf', { type: 'application/pdf' })
    const res = await callRoute(file)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe('Failed to parse AI response')
  })

  it('parses a PDF resume and returns portfolio data', async () => {
    const file = new File([samplePdf], 'resume.pdf', { type: 'application/pdf' })
    const res = await callRoute(file)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.portfolioData).toEqual(mockPortfolioData)
    expect(json.usernameSlug).toBe('test-user-abc123')
  })

  it('handles AI response wrapped in markdown code fences', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => '```json\n' + JSON.stringify(mockPortfolioData) + '\n```' },
    })
    const file = new File([samplePdf], 'resume.pdf', { type: 'application/pdf' })
    const res = await callRoute(file)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.portfolioData).toEqual(mockPortfolioData)
    expect(json.usernameSlug).toBe('test-user-abc123')
  })

  it('returns 401 when no Clerk userId', async () => {
    mockAuth.mockResolvedValueOnce({ userId: null })
    const file = new File([samplePdf], 'resume.pdf', { type: 'application/pdf' })
    const res = await callRoute(file)
    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe('Unauthorized')
  })

  it('returns 503 with friendly message when Gemini is overloaded (retryable)', async () => {
    // After all 3 attempts fail with a retryable error, the route maps to 503.
    mockGenerateContent.mockRejectedValue(new Error('[503] model is overloaded, try again'))
    const file = new File([samplePdf], 'resume.pdf', { type: 'application/pdf' })
    const res = await callRoute(file)
    expect(res.status).toBe(503)
    const json = await res.json()
    expect(json.error).toBe('Our AI service is busy right now. Please try again in a moment.')
    expect(json.error).not.toContain('overloaded')
  }, 15000)

  it('creates user row when none exists, then proceeds', async () => {
    // 1st limit: no user, 2nd limit: re-read after insert, 3rd: no portfolio.
    dbLimit.mockReset()
    dbLimit
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'user_test123', usernameSlug: 'test-user-abc123' }])
      .mockResolvedValueOnce([])
    const file = new File([samplePdf], 'resume.pdf', { type: 'application/pdf' })
    const res = await callRoute(file)
    expect(res.status).toBe(200)
    expect(mockCurrentUser).toHaveBeenCalled()
    expect(dbOnConflict).toHaveBeenCalled()
  })

  it('updates existing portfolio (rather than inserting) when one exists', async () => {
    dbLimit.mockReset()
    dbLimit
      .mockResolvedValueOnce([{ id: 'user_test123', usernameSlug: 'test-user-abc123' }])
      .mockResolvedValueOnce([{ userId: 'user_test123', portfolioData: 'old' }])
    const file = new File([samplePdf], 'resume.pdf', { type: 'application/pdf' })
    const res = await callRoute(file)
    expect(res.status).toBe(200)
    expect(dbSet).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'draft', portfolioData: expect.any(String) }),
    )
  })

  it('returns 500 if DB save throws', async () => {
    // Make any awaited values() call reject. Note this also rejects the
    // user insert chain since both go through dbValuesResult, which is
    // exactly what we want for "any DB write fails".
    dbValuesResult.mockReset()
    dbValuesResult.mockRejectedValue(new Error('boom'))
    const file = new File([samplePdf], 'resume.pdf', { type: 'application/pdf' })
    const res = await callRoute(file)
    expect(res.status).toBe(500)
    expect((await res.json()).error).toBe('Failed to save portfolio')
  })

  it('falls back to empty fullName/email when Clerk user has no fields', async () => {
    mockCurrentUser.mockResolvedValueOnce({ firstName: null, lastName: null, emailAddresses: [] })
    dbLimit.mockReset()
    dbLimit
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'user_test123', usernameSlug: 'test-user-abc123' }])
      .mockResolvedValueOnce([])
    const file = new File([samplePdf], 'resume.pdf', { type: 'application/pdf' })
    const res = await callRoute(file)
    expect(res.status).toBe(200)
  })

  describe('DOCX support', () => {
    it('parses a DOCX resume and returns portfolio data', async () => {
      const file = new File([sampleDocx], 'resume.docx', { type: DOCX_MIME })
      const res = await callRoute(file)
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.portfolioData).toEqual(mockPortfolioData)
      expect(json.usernameSlug).toBe('test-user-abc123')
      // Sanity: Gemini received a non-empty prompt derived from the DOCX text.
      expect(mockGenerateContent).toHaveBeenCalled()
      const promptArg = mockGenerateContent.mock.calls[0][0] as string
      expect(promptArg).toContain('JANE DOE')
    })

    it('returns 422 when DOCX is empty (no extractable text)', async () => {
      // Minimal valid-looking DOCX (zip) that mammoth will treat as empty/invalid.
      // Easier to assert: pass a corrupt buffer so extractRawText throws → 422.
      const file = new File([Buffer.from('totally not a docx')], 'resume.docx', {
        type: DOCX_MIME,
      })
      const res = await callRoute(file)
      expect(res.status).toBe(422)
      const json = await res.json()
      expect(json.error).toBe('Failed to read resume file')
    })

    it('updates existing portfolio when uploading a DOCX', async () => {
      dbLimit.mockReset()
      dbLimit
        .mockResolvedValueOnce([{ id: 'user_test123', usernameSlug: 'test-user-abc123' }])
        .mockResolvedValueOnce([{ userId: 'user_test123', portfolioData: 'old' }])
      const file = new File([sampleDocx], 'resume.docx', { type: DOCX_MIME })
      const res = await callRoute(file)
      expect(res.status).toBe(200)
      expect(dbSet).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'draft', portfolioData: expect.any(String) }),
      )
    })

    it('rejects legacy .doc (application/msword) MIME', async () => {
      const file = new File([Buffer.from('legacy doc bytes')], 'resume.doc', {
        type: 'application/msword',
      })
      const res = await callRoute(file)
      expect(res.status).toBe(400)
      expect((await res.json()).error).toBe('Only PDF or DOCX files are supported')
    })
  })

  describe('bio/about post-processing', () => {
    it('derives hero.bio from first sentence of about when bio is empty', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              ...mockPortfolioData,
              hero: { ...mockPortfolioData.hero, bio: '' },
              about: 'Lead engineer with 10 years of experience. Loves distributed systems.',
            }),
        },
      })
      const file = new File([samplePdf], 'resume.pdf', { type: 'application/pdf' })
      const res = await callRoute(file)
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.portfolioData.hero.bio).toBe('Lead engineer with 10 years of experience.')
      // about should remain untouched.
      expect(json.portfolioData.about).toBe(
        'Lead engineer with 10 years of experience. Loves distributed systems.',
      )
    })

    it('fills about from bio when about is empty', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              ...mockPortfolioData,
              hero: {
                ...mockPortfolioData.hero,
                bio: 'Frontend specialist. Shipped design systems used by millions.',
              },
              about: '',
            }),
        },
      })
      const file = new File([samplePdf], 'resume.pdf', { type: 'application/pdf' })
      const res = await callRoute(file)
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.portfolioData.hero.bio).toBe('Frontend specialist.')
      expect(json.portfolioData.about).toBe(
        'Frontend specialist. Shipped design systems used by millions.',
      )
    })

    it('trims bio to first sentence when both bio and about are present', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              ...mockPortfolioData,
              hero: {
                ...mockPortfolioData.hero,
                bio: 'Senior dev. Many years experience. Likes Go.',
              },
              about: 'Pre-existing about section copy.',
            }),
        },
      })
      const file = new File([samplePdf], 'resume.pdf', { type: 'application/pdf' })
      const res = await callRoute(file)
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.portfolioData.hero.bio).toBe('Senior dev.')
      expect(json.portfolioData.about).toBe('Pre-existing about section copy.')
    })
  })
})
