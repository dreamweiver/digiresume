import type { ExperienceEntry } from '@/lib/portfolio-types'

interface Props { experience: ExperienceEntry[] }

export function ExperienceSection({ experience }: Props) {
  if (!experience.length) return null
  return (
    <section id="experience" className="py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Experience</h2>
        <div className="space-y-8">
          {experience.map((entry, i) => (
            <div key={i} className="border-l-4 border-slate-800 pl-6">
              <h3 className="text-xl font-semibold text-slate-900">{entry.role}</h3>
              <p className="text-slate-600 font-medium">{entry.company}</p>
              <p className="text-slate-400 text-sm mb-3">{entry.startDate} – {entry.endDate}</p>
              <p className="text-slate-600">{entry.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
