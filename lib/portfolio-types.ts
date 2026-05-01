// lib/portfolio-types.ts
export interface HeroData {
  name: string
  title: string
  bio: string
  profilePhoto: string | null
}

export interface ExperienceEntry {
  company: string
  role: string
  startDate: string
  endDate: string
  description: string
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
}

export interface SocialLinks {
  github: string
  linkedin: string
  twitter: string
  website: string
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
  hero: { name: '', title: '', bio: '', profilePhoto: null },
  about: '',
  skills: [],
  experience: [],
  projects: [],
  education: [],
  socialLinks: { github: '', linkedin: '', twitter: '', website: '' },
}
