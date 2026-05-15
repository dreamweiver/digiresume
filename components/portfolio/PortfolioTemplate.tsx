import type { PortfolioData } from '@/lib/portfolio-types'
import { HeroSection } from './sections/HeroSection'
import { AboutSection } from './sections/AboutSection'
import { ExperienceSection } from './sections/ExperienceSection'
import { ProjectsSection } from './sections/ProjectsSection'
import { EducationSection } from './sections/EducationSection'
import { ContactSection } from './sections/ContactSection'

interface Props {
  data: PortfolioData
}

export function PortfolioTemplate({ data }: Props) {
  return (
    <div className="font-[var(--font-ibm-plex-mono)] bg-[#0a0a0a] text-white">
      <HeroSection hero={data.hero} socialLinks={data.socialLinks} />
      <AboutSection about={data.about} skills={data.skills} />
      <ExperienceSection experience={data.experience} />
      <EducationSection education={data.education} />
      <ProjectsSection projects={data.projects} />
      <ContactSection socialLinks={data.socialLinks} name={data.hero.name} />
    </div>
  )
}
