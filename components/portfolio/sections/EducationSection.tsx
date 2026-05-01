import type { EducationEntry } from '@/lib/portfolio-types'

interface Props { education: EducationEntry[] }

export function EducationSection({ education }: Props) {
  if (!education.length) return null
  return (
    <section id="education" className="py-24 bg-[#111111] border-t border-[#1f1f1f]">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold gradient-text mb-2">Education</h2>
        <p className="text-[#52525b] text-sm uppercase tracking-widest mb-12">My academic background</p>
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-[#1f1f1f]" />
          <div className="space-y-10">
            {education.map((entry, i) => (
              <div key={i} className="relative pl-8">
                {/* Timeline dot */}
                <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-[#00e599] -translate-x-[3.5px]" />
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                  <div>
                    <h3 className="text-white font-semibold">{entry.degree}</h3>
                    <p className="text-[#00e599] text-sm">{entry.institution}</p>
                  </div>
                  <span className="text-[#52525b] text-sm font-mono whitespace-nowrap">{entry.startDate} &ndash; {entry.endDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
