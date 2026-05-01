import type { EducationEntry } from '@/lib/portfolio-types'

interface Props { education: EducationEntry[] }

export function EducationSection({ education }: Props) {
  if (!education.length) return null
  return (
    <section id="education" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Education</h2>
        <div className="space-y-6">
          {education.map((entry, i) => (
            <div key={i} className="border-l-4 border-slate-800 pl-6">
              <h3 className="text-xl font-semibold text-slate-900">{entry.degree}</h3>
              <p className="text-slate-600">{entry.institution}</p>
              <p className="text-slate-400 text-sm">{entry.startDate} – {entry.endDate}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
