import type { SocialLinks } from '@/lib/portfolio-types'

interface Props { socialLinks: SocialLinks; name: string }

export function ContactSection({ socialLinks, name }: Props) {
  return (
    <footer id="contact" className="py-16 bg-[#111111] border-t border-[#1f1f1f]">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold gradient-text mb-3">Get In Touch</h2>
        <p className="text-[#a1a1aa] mb-8 max-w-md mx-auto">Open to new opportunities. Feel free to reach out.</p>
        {/* Social links */}
        <div className="flex justify-center gap-4 flex-wrap mb-12">
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
        {/* Footer nav */}
        <div className="flex justify-center gap-6 text-sm text-[#52525b] mb-6">
          {(['about', 'experience', 'projects', 'skills', 'education'] as const).map(s => (
            <a key={s} href={`#${s}`} className="hover:text-[#00e599] transition-colors capitalize">{s}</a>
          ))}
        </div>
        <p className="text-[#52525b] text-xs">&copy; {new Date().getFullYear()} {name}. Built with DigiResume.</p>
      </div>
    </footer>
  )
}
