/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'user_test123' }),
}))

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('@/lib/db/schema', () => ({
  portfolios: { userId: 'userId' },
}))

vi.mock('@/lib/crypto', () => ({
  encrypt: vi.fn((data: string) => `encrypted:${data}`),
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

  const mockPortfolioData = {
    hero: { name: 'Manoj Kumar', title: 'Software Engineer', bio: 'A developer', profilePhoto: null },
    about: 'About text',
    skills: ['React', 'TypeScript'],
    experience: [{ company: 'Acme', role: 'Dev', startDate: '2020', endDate: 'present', description: 'Built things' }],
    projects: [{ name: 'App', description: 'An app', techStack: ['React'], liveUrl: '', githubUrl: '' }],
    education: [{ institution: 'University', degree: 'CS', startDate: '2016', endDate: '2020' }],
    socialLinks: { github: '', linkedin: '', twitter: '', website: '' },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(mockPortfolioData) },
    })
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

  it('returns 400 if file is not a PDF', async () => {
    const file = new File(['hello'], 'resume.txt', { type: 'text/plain' })
    const res = await callRoute(file)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Only PDF files are supported')
  })

  it('returns 502 if Gemini API fails', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Model not found'))
    const file = new File([samplePdf], 'resume.pdf', { type: 'application/pdf' })
    const res = await callRoute(file)
    expect(res.status).toBe(502)
    const json = await res.json()
    expect(json.error).toBe('Model not found')
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
  })
})
