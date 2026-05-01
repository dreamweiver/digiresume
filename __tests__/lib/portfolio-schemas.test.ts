import { describe, it, expect } from 'vitest'
import {
  heroSchema,
  socialLinksSchema,
  experienceEntrySchema,
  projectEntrySchema,
  educationEntrySchema,
} from '@/lib/portfolio-schemas'

describe('heroSchema', () => {
  it('rejects empty name', () => {
    expect(() =>
      heroSchema.parse({ name: '', title: 'Dev', bio: 'Hello' })
    ).toThrow()
  })

  it('rejects empty title', () => {
    expect(() =>
      heroSchema.parse({ name: 'Jane', title: '', bio: 'Hello' })
    ).toThrow()
  })

  it('rejects empty bio', () => {
    expect(() =>
      heroSchema.parse({ name: 'Jane', title: 'Dev', bio: '' })
    ).toThrow()
  })

  it('accepts valid hero object', () => {
    const result = heroSchema.parse({ name: 'Jane Doe', title: 'Engineer', bio: 'Building things.' })
    expect(result.name).toBe('Jane Doe')
    expect(result.title).toBe('Engineer')
    expect(result.bio).toBe('Building things.')
  })

  it('accepts hero with null profilePhoto', () => {
    const result = heroSchema.parse({
      name: 'Jane',
      title: 'Dev',
      bio: 'Hello',
      profilePhoto: null,
    })
    expect(result.profilePhoto).toBeNull()
  })

  it('accepts hero without profilePhoto field', () => {
    const result = heroSchema.parse({ name: 'Jane', title: 'Dev', bio: 'Hello' })
    expect(result.profilePhoto).toBeUndefined()
  })
})

describe('socialLinksSchema', () => {
  it('accepts all empty strings (valid)', () => {
    const result = socialLinksSchema.parse({
      github: '',
      linkedin: '',
      twitter: '',
      website: '',
    })
    expect(result.github).toBe('')
    expect(result.website).toBe('')
  })

  it('accepts valid URLs', () => {
    const result = socialLinksSchema.parse({
      github: 'https://github.com/user',
      linkedin: 'https://linkedin.com/in/user',
      twitter: 'https://twitter.com/user',
      website: 'https://example.com',
    })
    expect(result.github).toBe('https://github.com/user')
  })

  it('rejects non-URL string on github field', () => {
    expect(() =>
      socialLinksSchema.parse({
        github: 'not-a-url',
        linkedin: '',
        twitter: '',
        website: '',
      })
    ).toThrow()
  })

  it('rejects non-URL string on website field', () => {
    expect(() =>
      socialLinksSchema.parse({
        github: '',
        linkedin: '',
        twitter: '',
        website: 'not-a-url',
      })
    ).toThrow()
  })

  it('rejects http-less domain on linkedin', () => {
    expect(() =>
      socialLinksSchema.parse({
        github: '',
        linkedin: 'linkedin.com/in/user',
        twitter: '',
        website: '',
      })
    ).toThrow()
  })
})

describe('experienceEntrySchema', () => {
  it('rejects missing company', () => {
    expect(() =>
      experienceEntrySchema.parse({
        company: '',
        role: 'Engineer',
        startDate: '2020-01',
        endDate: 'present',
        description: 'Worked on stuff',
      })
    ).toThrow()
  })

  it('rejects missing role', () => {
    expect(() =>
      experienceEntrySchema.parse({
        company: 'Acme',
        role: '',
        startDate: '2020-01',
        endDate: 'present',
        description: '',
      })
    ).toThrow()
  })

  it('accepts valid experience entry', () => {
    const result = experienceEntrySchema.parse({
      company: 'Acme Corp',
      role: 'Software Engineer',
      startDate: '2020-01',
      endDate: 'present',
      description: 'Built features',
    })
    expect(result.company).toBe('Acme Corp')
  })
})

describe('projectEntrySchema', () => {
  it('accepts empty liveUrl and githubUrl', () => {
    const result = projectEntrySchema.parse({
      name: 'My App',
      description: 'A cool app',
      techStack: ['React', 'TypeScript'],
      liveUrl: '',
      githubUrl: '',
    })
    expect(result.liveUrl).toBe('')
    expect(result.githubUrl).toBe('')
  })

  it('accepts valid URLs for liveUrl and githubUrl', () => {
    const result = projectEntrySchema.parse({
      name: 'My App',
      description: '',
      techStack: [],
      liveUrl: 'https://myapp.com',
      githubUrl: 'https://github.com/user/repo',
    })
    expect(result.liveUrl).toBe('https://myapp.com')
  })

  it('rejects invalid liveUrl', () => {
    expect(() =>
      projectEntrySchema.parse({
        name: 'My App',
        description: '',
        techStack: [],
        liveUrl: 'not-a-url',
        githubUrl: '',
      })
    ).toThrow()
  })

  it('rejects invalid githubUrl', () => {
    expect(() =>
      projectEntrySchema.parse({
        name: 'My App',
        description: '',
        techStack: [],
        liveUrl: '',
        githubUrl: 'github.com/user/repo',
      })
    ).toThrow()
  })

  it('rejects empty project name', () => {
    expect(() =>
      projectEntrySchema.parse({
        name: '',
        description: '',
        techStack: [],
        liveUrl: '',
        githubUrl: '',
      })
    ).toThrow()
  })
})

describe('educationEntrySchema', () => {
  it('rejects empty institution', () => {
    expect(() =>
      educationEntrySchema.parse({
        institution: '',
        degree: 'B.Sc. Computer Science',
        startDate: '2016',
        endDate: '2020',
      })
    ).toThrow()
  })

  it('accepts valid education entry', () => {
    const result = educationEntrySchema.parse({
      institution: 'MIT',
      degree: 'B.Sc. Computer Science',
      startDate: '2016',
      endDate: '2020',
    })
    expect(result.institution).toBe('MIT')
    expect(result.degree).toBe('B.Sc. Computer Science')
  })
})
