'use client'
import {
  User,
  FileText,
  Sparkles,
  Briefcase,
  FolderKanban,
  GraduationCap,
  Share2,
  type LucideIcon,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HeroEditor } from './editor/HeroEditor'
import { AboutEditor } from './editor/AboutEditor'
import { SkillsEditor } from './editor/SkillsEditor'
import { ExperienceEditor } from './editor/ExperienceEditor'
import { ProjectsEditor } from './editor/ProjectsEditor'
import { EducationEditor } from './editor/EducationEditor'
import { SocialEditor } from './editor/SocialEditor'
import type { PortfolioData } from '@/lib/portfolio-types'

interface Props {
  data: PortfolioData
  onChange: (data: PortfolioData) => void
}

const TABS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'hero', label: 'Hero', icon: User },
  { id: 'about', label: 'About', icon: FileText },
  { id: 'skills', label: 'Skills', icon: Sparkles },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'social', label: 'Social', icon: Share2 },
]

export function PortfolioEditor({ data, onChange }: Props) {
  return (
    <div>
      <Tabs defaultValue="hero">
        <TabsList className="flex flex-wrap h-auto gap-2 mb-6 bg-[#0a0a0a] border border-[#1f1f1f] p-1.5 rounded-full">
          {TABS.map(({ id, label, icon: Icon }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="inline-flex items-center gap-2 text-[#a1a1aa] text-base font-medium px-5 py-2 rounded-full transition-all duration-200 hover:bg-[#00e599]/15 hover:text-[#00e599] data-[state=active]:bg-[#00e599] data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-[0_0_20px_rgba(0,229,153,0.4)]"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="hero">
          <HeroEditor
            hero={data.hero}
            socialLinks={data.socialLinks}
            onChange={(hero) => onChange({ ...data, hero })}
          />
        </TabsContent>
        <TabsContent value="about">
          <AboutEditor about={data.about} onChange={(about) => onChange({ ...data, about })} />
        </TabsContent>
        <TabsContent value="skills">
          <SkillsEditor skills={data.skills} onChange={(skills) => onChange({ ...data, skills })} />
        </TabsContent>
        <TabsContent value="experience">
          <ExperienceEditor
            experience={data.experience}
            onChange={(experience) => onChange({ ...data, experience })}
          />
        </TabsContent>
        <TabsContent value="projects">
          <ProjectsEditor
            projects={data.projects}
            onChange={(projects) => onChange({ ...data, projects })}
          />
        </TabsContent>
        <TabsContent value="education">
          <EducationEditor
            education={data.education}
            onChange={(education) => onChange({ ...data, education })}
          />
        </TabsContent>
        <TabsContent value="social">
          <SocialEditor
            socialLinks={data.socialLinks}
            onChange={(socialLinks) => onChange({ ...data, socialLinks })}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
