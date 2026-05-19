// Defensive sanitizer for Gemini-parsed portfolio data.
// If a section is malformed, it is dropped (or replaced with an empty default)
// and surfaced via `warnings` so the user can be prompted to fill it in manually.

import type {
  PortfolioData,
  HeroData,
  ExperienceEntry,
  ProjectEntry,
  EducationEntry,
  SocialLinks,
} from './portfolio-types'

export type SectionName =
  | 'hero'
  | 'about'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'education'
  | 'socialLinks'

export interface SanitizeResult {
  data: PortfolioData
  warnings: SectionName[]
}

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
}

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function sanitizeHero(raw: unknown): { hero: HeroData; ok: boolean } {
  if (!isObject(raw)) {
    return {
      hero: { name: '', title: '', bio: '', profilePhoto: null, gender: 'unknown' },
      ok: false,
    }
  }
  const gender =
    raw.gender === 'male' || raw.gender === 'female' || raw.gender === 'unknown'
      ? raw.gender
      : 'unknown'
  return {
    hero: {
      name: asString(raw.name),
      title: asString(raw.title),
      bio: asString(raw.bio),
      profilePhoto: typeof raw.profilePhoto === 'string' ? raw.profilePhoto : null,
      gender,
    },
    ok: true,
  }
}

function sanitizeExperienceEntry(raw: unknown): ExperienceEntry | null {
  if (!isObject(raw)) return null
  if (typeof raw.company !== 'string' || typeof raw.role !== 'string') return null
  if (!raw.company.trim() && !raw.role.trim()) return null
  return {
    company: raw.company,
    role: raw.role,
    location: typeof raw.location === 'string' ? raw.location : undefined,
    startDate: asString(raw.startDate),
    endDate: asString(raw.endDate),
    description: asString(raw.description),
    highlights: Array.isArray(raw.highlights) ? asStringArray(raw.highlights) : undefined,
    technologies: Array.isArray(raw.technologies) ? asStringArray(raw.technologies) : undefined,
  }
}

function sanitizeProjectEntry(raw: unknown): ProjectEntry | null {
  if (!isObject(raw)) return null
  if (typeof raw.name !== 'string' || !raw.name.trim()) return null
  return {
    name: raw.name,
    description: asString(raw.description),
    techStack: asStringArray(raw.techStack),
    liveUrl: asString(raw.liveUrl),
    githubUrl: asString(raw.githubUrl),
  }
}

function sanitizeEducationEntry(raw: unknown): EducationEntry | null {
  if (!isObject(raw)) return null
  if (typeof raw.institution !== 'string' || typeof raw.degree !== 'string') return null
  if (!raw.institution.trim() && !raw.degree.trim()) return null
  return {
    institution: raw.institution,
    degree: raw.degree,
    startDate: asString(raw.startDate),
    endDate: asString(raw.endDate),
    grade: typeof raw.grade === 'string' ? raw.grade : undefined,
  }
}

function sanitizeSocialLinks(raw: unknown): SocialLinks {
  if (!isObject(raw)) {
    return { github: '', linkedin: '', twitter: '', website: '', email: '', phone: '' }
  }
  return {
    github: asString(raw.github),
    linkedin: asString(raw.linkedin),
    twitter: asString(raw.twitter),
    website: asString(raw.website),
    email: asString(raw.email),
    phone: asString(raw.phone),
  }
}

export function sanitizePortfolio(raw: unknown): SanitizeResult {
  const r = isObject(raw) ? raw : {}
  const warnings: SectionName[] = []

  const { hero, ok: heroOk } = sanitizeHero(r.hero)
  if (!heroOk || !hero.name.trim()) warnings.push('hero')

  const about = asString(r.about)
  const skills = asStringArray(r.skills)

  let experience: ExperienceEntry[] = []
  if (Array.isArray(r.experience)) {
    experience = r.experience
      .map(sanitizeExperienceEntry)
      .filter((e): e is ExperienceEntry => e !== null)
    if (r.experience.length > 0 && experience.length === 0) warnings.push('experience')
  }

  let projects: ProjectEntry[] = []
  if (Array.isArray(r.projects)) {
    projects = r.projects.map(sanitizeProjectEntry).filter((p): p is ProjectEntry => p !== null)
    if (r.projects.length > 0 && projects.length === 0) warnings.push('projects')
  }

  let education: EducationEntry[] = []
  if (Array.isArray(r.education)) {
    education = r.education
      .map(sanitizeEducationEntry)
      .filter((e): e is EducationEntry => e !== null)
    if (r.education.length > 0 && education.length === 0) warnings.push('education')
  }

  const socialLinks = sanitizeSocialLinks(r.socialLinks)

  return {
    data: { hero, about, skills, experience, projects, education, socialLinks },
    warnings,
  }
}
