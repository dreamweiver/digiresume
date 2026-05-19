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
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

export const EDITOR_DEFAULT_TAB = 'hero'

export function EditorTabsList() {
  return (
    <TabsList className="flex flex-wrap h-auto gap-1 bg-[#0a0a0a]/95 backdrop-blur-sm border border-[#1f1f1f] p-1 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      {TABS.map(({ id, label, icon: Icon }) => (
        <TabsTrigger
          key={id}
          value={id}
          className="inline-flex items-center gap-1.5 text-[#a1a1aa] text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors duration-200 hover:text-white hover:bg-white/5 data-active:bg-[#00e599] data-active:text-black data-active:shadow-[0_4px_14px_rgba(0,229,153,0.4)]"
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {label}
        </TabsTrigger>
      ))}
    </TabsList>
  )
}

export function PortfolioEditor({ data, onChange }: Props) {
  return (
    <div>
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
    </div>
  )
}
