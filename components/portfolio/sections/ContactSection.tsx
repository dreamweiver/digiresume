import type { SocialLinks } from '@/lib/portfolio-types'

interface Props { socialLinks: SocialLinks; name: string }

export function ContactSection({ socialLinks, name }: Props) {
  return (
    <section id="contact" className="py-20 bg-[#0a0a0a] border-t border-[#1f1f1f]">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4 gradient-text">Get In Touch</h2>
        <p className="text-[#a1a1aa] mb-10">Interested in working with {name}? Reach out via any of these channels.</p>
        <div className="flex flex-wrap justify-center gap-4">
          {socialLinks.github && (
            <a href={socialLinks.github} target="_blank" rel="noopener noreferrer"
              className="border border-[#1f1f1f] text-[#00e599] px-6 py-3 rounded-lg font-medium hover:border-[#00e599] hover:bg-[#161616] transition-colors duration-200">
              GitHub
            </a>
          )}
          {socialLinks.linkedin && (
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
              className="border border-[#1f1f1f] text-[#00e599] px-6 py-3 rounded-lg font-medium hover:border-[#00e599] hover:bg-[#161616] transition-colors duration-200">
              LinkedIn
            </a>
          )}
          {socialLinks.twitter && (
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
              className="border border-[#1f1f1f] text-[#00e599] px-6 py-3 rounded-lg font-medium hover:border-[#00e599] hover:bg-[#161616] transition-colors duration-200">
              Twitter
            </a>
          )}
          {socialLinks.website && (
            <a href={socialLinks.website} target="_blank" rel="noopener noreferrer"
              className="border border-[#1f1f1f] text-[#00e599] px-6 py-3 rounded-lg font-medium hover:border-[#00e599] hover:bg-[#161616] transition-colors duration-200">
              Website
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
