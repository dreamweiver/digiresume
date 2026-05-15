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

interface Props {
  data: PortfolioData
  onChange: (data: PortfolioData) => void
  onReupload?: () => void
}

export function PortfolioEditor({ data, onChange, onReupload }: Props) {
  return (
    <div>
      {onReupload && (
        <div className="flex items-center justify-end mb-3">
          <button
            onClick={onReupload}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#00e599] text-black rounded-lg hover:bg-[#00cc88] hover:scale-105 hover:shadow-[0_0_16px_rgba(0,229,153,0.4)] transition-all duration-200 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Re-upload Resume
          </button>
        </div>
      )}
      <Tabs defaultValue="hero">
        <TabsList className="flex flex-wrap h-auto gap-1 mb-6 bg-[#111111] border border-[#1f1f1f] p-1 rounded-lg">
          {['hero', 'about', 'skills', 'experience', 'projects', 'education', 'social'].map(
            (tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="capitalize text-[#a1a1aa] data-[state=active]:text-[#00e599] data-[state=active]:bg-[#161616] data-[state=active]:shadow-none rounded-md transition-colors duration-200"
              >
                {tab}
              </TabsTrigger>
            ),
          )}
        </TabsList>
        <TabsContent value="hero">
          <HeroEditor hero={data.hero} onChange={(hero) => onChange({ ...data, hero })} />
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
