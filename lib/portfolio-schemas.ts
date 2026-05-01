import { z } from 'zod'

export const heroSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  bio: z.string().min(1, 'Bio is required'),
  profilePhoto: z.string().nullable().optional(),
})

export const experienceEntrySchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
})

const urlOrEmpty = z
  .string()
  .refine((v) => v === '' || /^https?:\/\//i.test(v), { message: 'Must be a valid URL' })

export const projectEntrySchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string(),
  techStack: z.array(z.string()),
  liveUrl: urlOrEmpty,
  githubUrl: urlOrEmpty,
})

export const educationEntrySchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  startDate: z.string(),
  endDate: z.string(),
})

export const socialLinksSchema = z.object({
  github: urlOrEmpty,
  linkedin: urlOrEmpty,
  twitter: urlOrEmpty,
  website: urlOrEmpty,
})

export type HeroFormData = z.infer<typeof heroSchema>
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>
export type ProjectEntry = z.infer<typeof projectEntrySchema>
export type EducationEntry = z.infer<typeof educationEntrySchema>
export type SocialLinksFormData = z.infer<typeof socialLinksSchema>
