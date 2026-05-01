import type { HeroData, SocialLinks } from '@/lib/portfolio-types'

interface Props {
  hero: HeroData
  socialLinks: SocialLinks
}

export function HeroSection({ hero, socialLinks }: Props) {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center bg-slate-900 text-white relative">
      <div className="text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-4">{hero.name}</h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-6">{hero.title}</p>
        <p className="max-w-2xl mx-auto text-slate-400 text-lg mb-8">{hero.bio}</p>
        <div className="flex gap-4 justify-center">
          {socialLinks.github && (
            <a href={socialLinks.github} target="_blank" rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors underline">GitHub</a>
          )}
          {socialLinks.linkedin && (
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors underline">LinkedIn</a>
          )}
          {socialLinks.website && (
            <a href={socialLinks.website} target="_blank" rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors underline">Website</a>
          )}
        </div>
      </div>
    </section>
  )
}
