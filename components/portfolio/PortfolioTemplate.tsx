import type { PortfolioData } from '@/lib/portfolio-types'
import { HeroSection } from './sections/HeroSection'
import { AboutSection } from './sections/AboutSection'
import { ExperienceSection } from './sections/ExperienceSection'
import { ProjectsSection } from './sections/ProjectsSection'
import { SkillsSection } from './sections/SkillsSection'
import { EducationSection } from './sections/EducationSection'
import { ContactSection } from './sections/ContactSection'

interface Props { data: PortfolioData }

export function PortfolioTemplate({ data }: Props) {
  return (
    <div className="font-sans bg-[#0a0a0a]">
      {/* Sticky nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-[#1f1f1f]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-[#00e599] font-semibold text-sm">{data.hero.name}</span>
          <div className="hidden sm:flex gap-6 text-sm text-[#a1a1aa]">
            {(['about', 'experience', 'projects', 'skills', 'education', 'contact'] as const).map(s => (
              <a key={s} href={`#${s}`} className="hover:text-[#00e599] transition-colors capitalize">{s}</a>
            ))}
          </div>
        </div>
      </nav>
      <div className="pt-14">
        <HeroSection hero={data.hero} socialLinks={data.socialLinks} />
        <AboutSection about={data.about} />
        <ExperienceSection experience={data.experience} />
        <ProjectsSection projects={data.projects} />
        <SkillsSection skills={data.skills} />
        <EducationSection education={data.education} />
        <ContactSection socialLinks={data.socialLinks} name={data.hero.name} />
      </div>
    </div>
  )
}
