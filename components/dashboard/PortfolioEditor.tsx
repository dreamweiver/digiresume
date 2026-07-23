'use client'
import { useEffect, useRef, useState } from 'react'
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
import { SlugEditor } from './editor/SlugEditor'
import type { PortfolioData } from '@/lib/portfolio-types'

interface Props {
  data: PortfolioData
  onChange: (data: PortfolioData) => void
  slug: string
  onSlugChange: (slug: string) => void
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
  const listRef = useRef<HTMLDivElement | null>(null)
  const [activeId, setActiveId] = useState<string>(EDITOR_DEFAULT_TAB)

  // Keep activeId in sync with whichever trigger has data-active set —
  // works for clicks, keyboard, and programmatic value changes.
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const sync = () => {
      const active = list.querySelector<HTMLElement>('[data-active]')
      if (active?.dataset.tabId) setActiveId(active.dataset.tabId)
    }
    sync()
    const obs = new MutationObserver(sync)
    obs.observe(list, {
      attributes: true,
      attributeFilter: ['data-active'],
      subtree: true,
    })
    return () => obs.disconnect()
  }, [])

  // When the active tab changes, scroll it into view.
  // For the first/last items, scrollIntoView keeps them flush with the edge;
  // middle items center themselves.
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const el = list.querySelector<HTMLElement>(`[data-tab-id="${activeId}"]`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeId])

  return (
    <TabsList
      ref={listRef}
      className="flex w-full md:w-auto flex-nowrap md:flex-wrap h-auto gap-1 overflow-x-auto md:overflow-visible no-scrollbar bg-[#0a2218]/60 backdrop-blur-md border border-[#1a3a2c] p-1 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.35)] scroll-smooth"
    >
      {TABS.map(({ id, label, icon: Icon }) => (
        <TabsTrigger
          key={id}
          value={id}
          data-tab-id={id}
          className="shrink-0 relative inline-flex items-center justify-center gap-1.5 text-[#a1b3a8] text-xs font-semibold px-3 sm:px-3.5 py-1.5 rounded-xl transition-colors duration-200 hover:text-white hover:bg-white/5 data-active:text-[#00e599] data-active:bg-[#00e599]/10 after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-[#00e599] after:opacity-0 after:transition-opacity after:duration-200 data-active:after:opacity-100 data-active:after:shadow-[0_0_8px_rgba(0,229,153,0.7)]"
        >
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="whitespace-nowrap">{label}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  )
}

export function PortfolioEditor({ data, onChange, slug, onSlugChange }: Props) {
  return (
    <div>
      <TabsContent value="hero">
        <div className="space-y-4">
          <SlugEditor slug={slug} onSlugChange={onSlugChange} />
          <HeroEditor
            hero={data.hero}
            socialLinks={data.socialLinks}
            onChange={(hero) => onChange({ ...data, hero })}
          />
        </div>
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
