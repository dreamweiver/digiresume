import type { EducationEntry } from '@/lib/portfolio-types'

interface Props { education: EducationEntry[] }

export function EducationSection({ education }: Props) {
  if (!education.length) return null
  return (
    <section id="education" className="py-20 bg-[#111111] border-t border-[#1f1f1f]">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center gradient-text">Education</h2>
        <div className="space-y-4">
          {education.map((entry, i) => (
            <div key={i} className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-6 hover:border-[#00e599] transition-colors duration-200">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-white">{entry.degree}</h3>
                  <p className="text-[#00e599] text-sm font-medium mt-1">{entry.institution}</p>
                </div>
                <span className="text-[#52525b] text-sm font-mono">{entry.startDate} – {entry.endDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
