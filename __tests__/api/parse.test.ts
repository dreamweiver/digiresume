import { describe, it, expect } from 'vitest'
import { buildResumeParsePrompt } from '@/lib/gemini-prompt'

describe('buildResumeParsePrompt', () => {
  it('includes the resume text in the prompt', () => {
    const prompt = buildResumeParsePrompt('John Doe\nSoftware Engineer')
    expect(prompt).toContain('John Doe')
    expect(prompt).toContain('Software Engineer')
  })

  it('instructs to return raw JSON only', () => {
    const prompt = buildResumeParsePrompt('test')
    expect(prompt).toContain('raw JSON only')
  })

  it('includes all required portfolio fields in the schema', () => {
    const prompt = buildResumeParsePrompt('test')
    expect(prompt).toContain('"hero"')
    expect(prompt).toContain('"about"')
    expect(prompt).toContain('"skills"')
    expect(prompt).toContain('"experience"')
    expect(prompt).toContain('"projects"')
    expect(prompt).toContain('"education"')
    expect(prompt).toContain('"socialLinks"')
  })
})
