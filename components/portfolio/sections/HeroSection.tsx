import type { HeroData, SocialLinks } from '@/lib/portfolio-types'

interface Props {
  hero: HeroData
  socialLinks: SocialLinks
}

export function HeroSection({ hero, socialLinks }: Props) {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white relative overflow-hidden hero-grid-bg">
      <div className="hero-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="text-center px-4 relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 gradient-text">{hero.name}</h1>
        <p className="text-xl md:text-2xl text-[#a1a1aa] mb-6">{hero.title}</p>
        <p className="max-w-2xl mx-auto text-[#a1a1aa] text-lg mb-10 leading-relaxed">{hero.bio}</p>
        <div className="flex gap-4 justify-center flex-wrap">
          {socialLinks.github && (
            <a href={socialLinks.github} target="_blank" rel="noopener noreferrer"
              className="text-[#00e599] hover:text-white transition-colors duration-200 text-sm font-medium border border-[#1f1f1f] px-4 py-2 rounded-md hover:border-[#00e599]">
              GitHub
            </a>
          )}
          {socialLinks.linkedin && (
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
              className="text-[#00e599] hover:text-white transition-colors duration-200 text-sm font-medium border border-[#1f1f1f] px-4 py-2 rounded-md hover:border-[#00e599]">
              LinkedIn
            </a>
          )}
          {socialLinks.website && (
            <a href={socialLinks.website} target="_blank" rel="noopener noreferrer"
              className="text-[#00e599] hover:text-white transition-colors duration-200 text-sm font-medium border border-[#1f1f1f] px-4 py-2 rounded-md hover:border-[#00e599]">
              Website
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
