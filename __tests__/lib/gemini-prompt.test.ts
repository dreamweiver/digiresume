import { describe, it, expect } from 'vitest'
import { buildResumeParsePrompt } from '@/lib/gemini-prompt'

// These tests pin the hardening instructions added after analyzing 30
// real-world resumes. Each describe block targets one quirk we observed,
// so when the prompt is later rewritten, the failure mode is obvious.
describe('buildResumeParsePrompt', () => {
  const prompt = buildResumeParsePrompt('REPLACE_ME')

  it('embeds the resume text inside the delimited block', () => {
    expect(prompt).toContain('Resume text:\n---\nREPLACE_ME\n---')
  })

  it('demands raw JSON only', () => {
    expect(prompt.toLowerCase()).toMatch(/return only valid json/i)
    expect(prompt.toLowerCase()).toMatch(/do not include any explanation or markdown/i)
  })

  describe('bio extraction', () => {
    it('lists the standard headings, including the "Carrier Objective" typo', () => {
      // The misspelling shows up in real resumes; the prompt explicitly handles it.
      for (const heading of [
        'Intro',
        'Bio',
        'Objective',
        'Career Objective',
        'Carrier Objective',
      ]) {
        expect(prompt).toContain(heading)
      }
    })

    it('forbids inventing or summarizing a bio when no source heading exists', () => {
      expect(prompt).toMatch(/Do NOT invent or summarize/i)
    })
  })

  describe('about extraction', () => {
    it('lists every accepted heading and forbids falling back to bio', () => {
      for (const heading of [
        'About',
        'About Me',
        'Profile',
        'Summary',
        'Professional Summary',
        'Career Summary',
      ]) {
        expect(prompt).toContain(heading)
      }
      expect(prompt).toMatch(/Do NOT fall back to bio/i)
    })
  })

  describe('PDF extraction quirks', () => {
    it('warns about glued-together text from pdf-parse', () => {
      expect(prompt.toLowerCase()).toContain('missing spaces')
    })

    it('lists the bullet-marker variants seen in the wild', () => {
      // We won't pin every glyph, but the prompt should call out at least these.
      for (const bullet of ['•', '●', '◦', '▪', '–', '—']) {
        expect(prompt).toContain(bullet)
      }
    })

    it('mentions soft hyphens and zero-width spaces', () => {
      expect(prompt.toLowerCase()).toContain('soft hyphen')
      expect(prompt.toLowerCase()).toContain('zero-width')
    })
  })

  describe('section heading variations', () => {
    it('recognises the common experience aliases', () => {
      for (const heading of [
        'Work Experience',
        'Professional Experience',
        'Employment',
        'Employment History',
        'Career History',
        'Work History',
      ]) {
        expect(prompt).toContain(heading)
      }
    })

    it('recognises the common education aliases', () => {
      for (const heading of [
        'Academics',
        'Academic Background',
        'Educational Qualifications',
        'Qualifications',
      ]) {
        expect(prompt).toContain(heading)
      }
    })

    it('recognises the common skills aliases', () => {
      for (const heading of [
        'Technical Skills',
        'Tech Stack',
        'Core Competencies',
        'Key Skills',
        'Tools and Technologies',
      ]) {
        expect(prompt).toContain(heading)
      }
    })

    it('recognises the common projects aliases', () => {
      for (const heading of [
        'Personal Projects',
        'Side Projects',
        'Academic Projects',
        'Notable Projects',
        'Key Projects',
      ]) {
        expect(prompt).toContain(heading)
      }
    })
  })

  describe('skills extraction rules', () => {
    it('tells the model to flatten categorised skill prefixes', () => {
      for (const prefix of ['Frontend', 'Backend', 'Languages', 'Proficient', 'Comfortable']) {
        expect(prompt).toContain(prefix)
      }
      expect(prompt.toLowerCase()).toMatch(/flatten/i)
    })

    it('excludes spoken languages from the skills array', () => {
      expect(prompt.toLowerCase()).toMatch(/spoken languages/i)
      expect(prompt.toLowerCase()).toMatch(/not skills/i)
    })

    it('asks for trimmed and deduplicated skills', () => {
      expect(prompt.toLowerCase()).toMatch(/trim/i)
      expect(prompt.toLowerCase()).toMatch(/duplicate/i)
    })
  })

  describe('experience extraction rules', () => {
    it('separates company name from a trailing location', () => {
      // Two real-resume examples are in the prompt as anchors.
      expect(prompt).toContain('Cvent India Private Limited')
      expect(prompt).toContain('Gurgaon')
    })

    it('normalises every "currently working" phrase to literal "Present"', () => {
      for (const phrase of ['Present', 'Current', 'Now', 'Till date', 'To date', 'Ongoing']) {
        expect(prompt).toContain(phrase)
      }
    })

    it('asks for highlights and a separate technologies array', () => {
      expect(prompt.toLowerCase()).toContain('highlights')
      expect(prompt.toLowerCase()).toContain('technologies')
      // Soft skills should not leak into technologies.
      expect(prompt.toLowerCase()).toMatch(/do not include soft skills/i)
    })

    it('asks for full-month-name dates, not YYYY-MM', () => {
      expect(prompt).toMatch(/full month name and year/i)
      expect(prompt).toContain('January 2020')
    })
  })

  describe('education extraction rules', () => {
    it('describes the grade field with multiple example formats', () => {
      for (const example of ['CGPA', 'GPA', '%', 'First Class']) {
        expect(prompt).toContain(example)
      }
    })
  })

  describe('social links rules', () => {
    it('forbids guessing or constructing URLs', () => {
      expect(prompt.toLowerCase()).toMatch(/do not guess or construct/i)
    })

    it('warns that phone and email are often glued together in extracted text', () => {
      expect(prompt.toLowerCase()).toContain('glued together')
    })
  })

  describe('things to ignore', () => {
    it('lists the noise sections we never want in the output', () => {
      for (const section of [
        'References',
        'Hobbies',
        'Interests',
        'date of birth',
        'marital status',
        'nationality',
        'passport',
        'blood group',
      ]) {
        expect(prompt.toLowerCase()).toContain(section.toLowerCase())
      }
    })

    it('keeps gender (which we infer from the name)', () => {
      expect(prompt).toMatch(/infer gender/i)
    })
  })

  describe('JSON schema shape', () => {
    it('declares every top-level key the sanitizer expects', () => {
      for (const key of [
        '"hero"',
        '"about"',
        '"skills"',
        '"experience"',
        '"projects"',
        '"education"',
        '"socialLinks"',
      ]) {
        expect(prompt).toContain(key)
      }
    })

    it('declares the experience entry shape', () => {
      for (const key of [
        '"company"',
        '"role"',
        '"location"',
        '"startDate"',
        '"endDate"',
        '"description"',
        '"highlights"',
        '"technologies"',
      ]) {
        expect(prompt).toContain(key)
      }
    })

    it('declares the education entry shape including grade', () => {
      for (const key of ['"institution"', '"degree"', '"startDate"', '"endDate"', '"grade"']) {
        expect(prompt).toContain(key)
      }
    })
  })
})
