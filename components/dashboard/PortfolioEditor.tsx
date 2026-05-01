'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HeroEditor } from './editor/HeroEditor'
import { AboutEditor } from './editor/AboutEditor'
import { SkillsEditor } from './editor/SkillsEditor'
import { ExperienceEditor } from './editor/ExperienceEditor'
import { ProjectsEditor } from './editor/ProjectsEditor'
import { EducationEditor } from './editor/EducationEditor'
import { SocialEditor } from './editor/SocialEditor'
import type { PortfolioData } from '@/lib/portfolio-types'

interface Props { data: PortfolioData; onChange: (data: PortfolioData) => void }

export function PortfolioEditor({ data, onChange }: Props) {
  return (
    <Tabs defaultValue="hero">
      <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
        {['hero', 'about', 'skills', 'experience', 'projects', 'education', 'social'].map((tab) => (
          <TabsTrigger key={tab} value={tab} className="capitalize">{tab}</TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="hero"><HeroEditor hero={data.hero} onChange={(hero) => onChange({ ...data, hero })} /></TabsContent>
      <TabsContent value="about"><AboutEditor about={data.about} onChange={(about) => onChange({ ...data, about })} /></TabsContent>
      <TabsContent value="skills"><SkillsEditor skills={data.skills} onChange={(skills) => onChange({ ...data, skills })} /></TabsContent>
      <TabsContent value="experience"><ExperienceEditor experience={data.experience} onChange={(experience) => onChange({ ...data, experience })} /></TabsContent>
      <TabsContent value="projects"><ProjectsEditor projects={data.projects} onChange={(projects) => onChange({ ...data, projects })} /></TabsContent>
      <TabsContent value="education"><EducationEditor education={data.education} onChange={(education) => onChange({ ...data, education })} /></TabsContent>
      <TabsContent value="social"><SocialEditor socialLinks={data.socialLinks} onChange={(socialLinks) => onChange({ ...data, socialLinks })} /></TabsContent>
    </Tabs>
  )
}
