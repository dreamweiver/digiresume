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
    <main className="font-sans">
      <HeroSection hero={data.hero} socialLinks={data.socialLinks} />
      <AboutSection about={data.about} />
      <ExperienceSection experience={data.experience} />
      <ProjectsSection projects={data.projects} />
      <SkillsSection skills={data.skills} />
      <EducationSection education={data.education} />
      <ContactSection socialLinks={data.socialLinks} name={data.hero.name} />
    </main>
  )
}
