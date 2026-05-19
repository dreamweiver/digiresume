import { z } from 'zod'
import { parseMonthYear, rangesOverlap } from './date-utils'

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

// Cross-entry validation: flag every index that participates in a date-range
// overlap. We attach the issue to `startDate` so the visible cell takes the
// red border, and the message names the conflicting row so the user can find
// it without counting cards.
export const experienceArraySchema = z.array(experienceEntrySchema).superRefine((entries, ctx) => {
  const ranges = entries.map((e) => {
    const start = parseMonthYear(e.startDate)
    const end = parseMonthYear(e.endDate)
    return start && end ? { start, end } : null
  })

  for (let i = 0; i < ranges.length; i++) {
    const a = ranges[i]
    if (!a) continue
    for (let j = i + 1; j < ranges.length; j++) {
      const b = ranges[j]
      if (!b) continue
      if (rangesOverlap(a, b)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [i, 'startDate'],
          message: `Date range overlaps with Experience ${j + 1}`,
        })
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [j, 'startDate'],
          message: `Date range overlaps with Experience ${i + 1}`,
        })
      }
    }
  }
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
  email: z.string().email().or(z.literal('')),
  phone: z.string(),
})

export type HeroFormData = z.infer<typeof heroSchema>
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>
export type ProjectEntry = z.infer<typeof projectEntrySchema>
export type EducationEntry = z.infer<typeof educationEntrySchema>
export type SocialLinksFormData = z.infer<typeof socialLinksSchema>
