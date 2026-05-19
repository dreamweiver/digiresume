// lib/portfolio-types.ts
export interface HeroData {
  name: string
  title: string
  bio: string
  profilePhoto: string | null
  gender: 'male' | 'female' | 'unknown'
}

export interface ExperienceEntry {
  company: string
  role: string
  location?: string
  startDate: string
  endDate: string
  description: string
  highlights?: string[]
  technologies?: string[]
}

export interface ProjectEntry {
  name: string
  description: string
  techStack: string[]
  liveUrl: string
  githubUrl: string
}

export interface EducationEntry {
  institution: string
  degree: string
  startDate: string
  endDate: string
  grade?: string
}

export interface SocialLinks {
  github: string
  linkedin: string
  twitter: string
  website: string
  email: string
  phone: string
}

export interface PortfolioData {
  hero: HeroData
  about: string
  skills: string[]
  experience: ExperienceEntry[]
  projects: ProjectEntry[]
  education: EducationEntry[]
  socialLinks: SocialLinks
}

export const EMPTY_PORTFOLIO: PortfolioData = {
  hero: { name: '', title: '', bio: '', profilePhoto: null, gender: 'unknown' },
  about: '',
  skills: [],
  experience: [],
  projects: [],
  education: [],
  socialLinks: { github: '', linkedin: '', twitter: '', website: '', email: '', phone: '' },
}
