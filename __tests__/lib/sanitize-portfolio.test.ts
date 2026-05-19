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

  // The remaining tests cover patterns observed in 30 real referral resumes —
  // categorised skill blocks, separate company/location, "Present" variants,
  // grade strings, glued contact info, and partial / minimal resumes. These
  // are sanitizer-level guards: the model still does the heavy lifting, but
  // the sanitizer must not strip valid data that comes through these shapes.
  describe('real-resume patterns', () => {
    it('keeps location separate from company on experience entries', () => {
      const input = {
        hero: { name: 'X', title: '', bio: '' },
        experience: [
          {
            company: 'Cvent India Private Limited',
            role: 'Senior Software Engineer',
            location: 'Gurgaon',
            startDate: 'January 2020',
            endDate: 'Present',
            description: 'Built things.',
          },
        ],
      }
      const { data } = sanitizePortfolio(input)
      expect(data.experience[0]).toMatchObject({
        company: 'Cvent India Private Limited',
        location: 'Gurgaon',
        endDate: 'Present',
      })
    })

    it('preserves bullet highlights and technologies arrays per role', () => {
      const input = {
        hero: { name: 'X', title: '', bio: '' },
        experience: [
          {
            company: 'QBurst Technologies',
            role: 'Engineer',
            startDate: 'April 2011',
            endDate: 'July 2013',
            description: '',
            highlights: [
              'Designed and developed REST APIs',
              'Mentored 3 junior engineers',
              'Migrated legacy code to TypeScript',
            ],
            technologies: ['Node.js', 'TypeScript', 'PostgreSQL'],
          },
        ],
      }
      const { data } = sanitizePortfolio(input)
      expect(data.experience[0].highlights).toHaveLength(3)
      expect(data.experience[0].technologies).toEqual(['Node.js', 'TypeScript', 'PostgreSQL'])
    })

    it('drops non-string entries inside highlights / technologies but keeps the role', () => {
      const input = {
        hero: { name: 'X', title: '', bio: '' },
        experience: [
          {
            company: 'Acme',
            role: 'Eng',
            startDate: '',
            endDate: '',
            description: '',
            highlights: ['shipped', 42, null, 'fixed bug'],
            technologies: ['ts', { foo: 'bar' }, 'react'],
          },
        ],
      }
      const { data } = sanitizePortfolio(input)
      expect(data.experience).toHaveLength(1)
      expect(data.experience[0].highlights).toEqual(['shipped', 'fixed bug'])
      expect(data.experience[0].technologies).toEqual(['ts', 'react'])
    })

    it('keeps the grade string when education uses CGPA / percentage / class', () => {
      const input = {
        hero: { name: 'X', title: '', bio: '' },
        education: [
          {
            institution: 'IIT',
            degree: 'B.Tech',
            startDate: '2009',
            endDate: '2013',
            grade: '8.42 CGPA',
          },
          {
            institution: 'BITS',
            degree: 'M.Tech',
            startDate: '2013',
            endDate: '2015',
            grade: '85%',
          },
          {
            institution: 'St. Xavier',
            degree: '12th',
            startDate: '2008',
            endDate: '2009',
            grade: 'First Class with Distinction',
          },
        ],
      }
      const { data } = sanitizePortfolio(input)
      expect(data.education.map((e) => e.grade)).toEqual([
        '8.42 CGPA',
        '85%',
        'First Class with Distinction',
      ])
    })

    it('survives a minimal resume that has no projects, no socials, no about', () => {
      const input = {
        hero: { name: 'Wasim', title: 'Engineer', bio: '' },
        skills: ['React', 'Node.js'],
        experience: [
          {
            company: 'Tiny Co',
            role: 'Eng',
            startDate: '2022',
            endDate: 'Present',
            description: '',
          },
        ],
        education: [
          { institution: 'State University', degree: 'B.Sc', startDate: '2018', endDate: '2022' },
        ],
      }
      const { data, warnings } = sanitizePortfolio(input)
      expect(warnings).toEqual([])
      expect(data.about).toBe('')
      expect(data.projects).toEqual([])
      expect(data.socialLinks).toEqual({
        github: '',
        linkedin: '',
        twitter: '',
        website: '',
        email: '',
        phone: '',
      })
      expect(data.experience).toHaveLength(1)
      expect(data.education).toHaveLength(1)
    })

    it('keeps email-only socials when no LinkedIn / GitHub URL is present', () => {
      const input = {
        hero: { name: 'X', title: '', bio: '' },
        socialLinks: {
          github: '',
          linkedin: '',
          twitter: '',
          website: '',
          email: 'wasim@example.com',
          phone: '+91 9847059251',
        },
      }
      const { data } = sanitizePortfolio(input)
      expect(data.socialLinks.email).toBe('wasim@example.com')
      expect(data.socialLinks.phone).toBe('+91 9847059251')
      expect(data.socialLinks.github).toBe('')
      expect(data.socialLinks.linkedin).toBe('')
    })

    it('preserves description text containing newlines and bullet markers', () => {
      // The model is asked to keep description as paragraphs separated by \n.
      // The sanitizer must not collapse / strip these.
      const description =
        'Led the platform team.\n\n- Designed APIs\n- Mentored juniors\n- Owned migrations'
      const input = {
        hero: { name: 'X', title: '', bio: '' },
        experience: [
          {
            company: 'Acme',
            role: 'Lead',
            startDate: 'January 2020',
            endDate: 'Present',
            description,
          },
        ],
      }
      const { data } = sanitizePortfolio(input)
      expect(data.experience[0].description).toBe(description)
    })

    it('treats categorised skill output from the model as a flat array', () => {
      // Even if the model partially fails to flatten and emits "Frontend: React, ..."
      // as a single string, the sanitizer should still keep it as a string entry —
      // we never silently drop it.
      const input = {
        hero: { name: 'X', title: '', bio: '' },
        skills: ['Frontend: React, Vue', 'TypeScript', 'Backend: Node.js, Python'],
      }
      const { data } = sanitizePortfolio(input)
      expect(data.skills).toEqual([
        'Frontend: React, Vue',
        'TypeScript',
        'Backend: Node.js, Python',
      ])
    })

    it('drops entries where company is a non-empty string but role is missing', () => {
      // sanitizeExperienceEntry requires both company and role to be strings.
      const input = {
        hero: { name: 'X', title: '', bio: '' },
        experience: [
          { company: 'Acme', startDate: '', endDate: '', description: '' },
          { company: 'Beta', role: 'Dev', startDate: '', endDate: '', description: '' },
        ],
      }
      const { data } = sanitizePortfolio(input)
      expect(data.experience).toHaveLength(1)
      expect(data.experience[0].company).toBe('Beta')
    })

    it('coerces non-string startDate / endDate to empty strings without rejecting the entry', () => {
      const input = {
        hero: { name: 'X', title: '', bio: '' },
        experience: [
          {
            company: 'Acme',
            role: 'Eng',
            startDate: 2020,
            endDate: null,
            description: '',
          },
        ],
      }
      const { data } = sanitizePortfolio(input)
      expect(data.experience[0]).toMatchObject({
        company: 'Acme',
        role: 'Eng',
        startDate: '',
        endDate: '',
      })
    })
  })
})
