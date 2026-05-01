import type { ExperienceEntry } from '@/lib/portfolio-types'

interface Props { experience: ExperienceEntry[] }

export function ExperienceSection({ experience }: Props) {
  if (!experience.length) return null
  return (
    <section id="experience" className="py-20 bg-[#0a0a0a] border-t border-[#1f1f1f]">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center gradient-text">Experience</h2>
        <div className="space-y-6">
          {experience.map((entry, i) => (
            <div key={i} className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-6 hover:border-[#00e599] transition-colors duration-200">
              <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                <h3 className="text-lg font-semibold text-white">{entry.role}</h3>
                <span className="text-[#52525b] text-sm font-mono">{entry.startDate} – {entry.endDate}</span>
              </div>
              <p className="text-[#00e599] text-sm font-medium mb-3">{entry.company}</p>
              <p className="text-[#a1a1aa] text-sm leading-relaxed">{entry.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
