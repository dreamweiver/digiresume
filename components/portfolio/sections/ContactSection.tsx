import type { SocialLinks } from '@/lib/portfolio-types'

interface Props { socialLinks: SocialLinks; name: string }

export function ContactSection({ socialLinks, name }: Props) {
  return (
    <section id="contact" className="py-20 bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
        <p className="text-slate-400 mb-8">Interested in working with {name}? Reach out via any of these channels.</p>
        <div className="flex flex-wrap justify-center gap-4">
          {socialLinks.github && (
            <a href={socialLinks.github} target="_blank" rel="noopener noreferrer"
              className="bg-white text-slate-900 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 transition-colors">GitHub</a>
          )}
          {socialLinks.linkedin && (
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
              className="bg-white text-slate-900 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 transition-colors">LinkedIn</a>
          )}
          {socialLinks.twitter && (
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
              className="bg-white text-slate-900 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 transition-colors">Twitter</a>
          )}
          {socialLinks.website && (
            <a href={socialLinks.website} target="_blank" rel="noopener noreferrer"
              className="bg-white text-slate-900 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 transition-colors">Website</a>
          )}
        </div>
      </div>
    </section>
  )
}
