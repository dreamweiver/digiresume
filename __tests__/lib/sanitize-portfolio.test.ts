import { describe, it, expect } from 'vitest'
import { sanitizePortfolio } from '@/lib/sanitize-portfolio'

describe('sanitizePortfolio', () => {
  it('returns empty defaults and warns hero when input is not an object', () => {
    const { data, warnings } = sanitizePortfolio(null)
    expect(data.hero).toEqual({
      name: '',
      title: '',
      bio: '',
      profilePhoto: null,
      gender: 'unknown',
    })
    expect(data.about).toBe('')
    expect(data.skills).toEqual([])
    expect(data.experience).toEqual([])
    expect(data.projects).toEqual([])
    expect(data.education).toEqual([])
    expect(warnings).toContain('hero')
  })

  it('passes through a fully valid portfolio with no warnings', () => {
    const input = {
      hero: {
        name: 'Jane Doe',
        title: 'Engineer',
        bio: 'Builds things.',
        profilePhoto: null,
        gender: 'female',
      },
      about: 'About me',
      skills: ['ts', 'react'],
      experience: [
        {
          company: 'Acme',
          role: 'Eng',
          location: 'NY',
          startDate: 'January 2020',
          endDate: 'Present',
          description: 'Did stuff.',
          highlights: ['shipped'],
          technologies: ['ts'],
        },
      ],
      projects: [
        {
          name: 'Proj',
          description: 'desc',
          techStack: ['ts'],
          liveUrl: '',
          githubUrl: '',
        },
      ],
      education: [
        {
          institution: 'MIT',
          degree: 'BS',
          startDate: '2016',
          endDate: '2020',
          grade: '3.9 GPA',
        },
      ],
      socialLinks: {
        github: 'g',
        linkedin: 'l',
        twitter: '',
        website: '',
        email: 'a@b.c',
        phone: '',
      },
    }
    const { data, warnings } = sanitizePortfolio(input)
    expect(warnings).toEqual([])
    expect(data.hero.name).toBe('Jane Doe')
    expect(data.experience).toHaveLength(1)
    expect(data.projects).toHaveLength(1)
    expect(data.education).toHaveLength(1)
  })

  it('drops malformed experience entries while keeping good ones', () => {
    const input = {
      hero: { name: 'X', title: '', bio: '' },
      experience: [
        { company: 'Good Co', role: 'Eng', startDate: '', endDate: '', description: '' },
        { company: 123, role: 'Eng' }, // malformed: company not a string
        { role: 'Eng' }, // malformed: missing company
        null,
        'not an object',
      ],
    }
    const { data, warnings } = sanitizePortfolio(input)
    expect(data.experience).toHaveLength(1)
    expect(data.experience[0].company).toBe('Good Co')
    expect(warnings).not.toContain('experience')
  })

  it('warns experience when input had items but all were malformed', () => {
    const input = {
      hero: { name: 'X', title: '', bio: '' },
      experience: [{ company: 123 }, null, { role: 42 }],
    }
    const { data, warnings } = sanitizePortfolio(input)
    expect(data.experience).toEqual([])
    expect(warnings).toContain('experience')
  })

  it('drops projects without a non-empty name and warns when all rejected', () => {
    const input = {
      hero: { name: 'X', title: '', bio: '' },
      projects: [{ name: '' }, { description: 'no name' }, { name: 123 }],
    }
    const { data, warnings } = sanitizePortfolio(input)
    expect(data.projects).toEqual([])
    expect(warnings).toContain('projects')
  })

  it('keeps valid projects and drops invalid ones in same array', () => {
    const input = {
      hero: { name: 'X', title: '', bio: '' },
      projects: [
        { name: 'Real', description: 'd', techStack: ['ts'] },
        { name: '' },
        { description: 'orphan' },
      ],
    }
    const { data, warnings } = sanitizePortfolio(input)
    expect(data.projects).toHaveLength(1)
    expect(data.projects[0].name).toBe('Real')
    expect(warnings).not.toContain('projects')
  })

  it('drops malformed education entries and warns when all rejected', () => {
    const input = {
      hero: { name: 'X', title: '', bio: '' },
      education: [{ institution: 123 }, { degree: 42 }, null],
    }
    const { data, warnings } = sanitizePortfolio(input)
    expect(data.education).toEqual([])
    expect(warnings).toContain('education')
  })

  it('warns hero when name is empty after sanitize', () => {
    const input = {
      hero: { name: '', title: 'Eng', bio: 'b' },
    }
    const { warnings } = sanitizePortfolio(input)
    expect(warnings).toContain('hero')
  })

  it('does not warn about empty arrays (section simply absent)', () => {
    const input = {
      hero: { name: 'X', title: '', bio: '' },
      experience: [],
      projects: [],
      education: [],
    }
    const { warnings } = sanitizePortfolio(input)
    expect(warnings).not.toContain('experience')
    expect(warnings).not.toContain('projects')
    expect(warnings).not.toContain('education')
  })

  it('coerces non-string skills out of the skills array', () => {
    const input = {
      hero: { name: 'X', title: '', bio: '' },
      skills: ['ts', 42, null, 'react', { foo: 'bar' }],
    }
    const { data } = sanitizePortfolio(input)
    expect(data.skills).toEqual(['ts', 'react'])
  })

  it('falls back to empty social links when input is malformed', () => {
    const input = {
      hero: { name: 'X', title: '', bio: '' },
      socialLinks: 'nope',
    }
    const { data } = sanitizePortfolio(input)
    expect(data.socialLinks).toEqual({
      github: '',
      linkedin: '',
      twitter: '',
      website: '',
      email: '',
      phone: '',
    })
  })

  it('defaults hero gender to "unknown" for invalid values', () => {
    const input = {
      hero: { name: 'X', title: '', bio: '', gender: 'other' },
    }
    const { data } = sanitizePortfolio(input)
    expect(data.hero.gender).toBe('unknown')
  })
})
