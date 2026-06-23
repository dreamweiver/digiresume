import type { EducationEntry } from '@/lib/portfolio-types'

interface Props {
  education: EducationEntry[]
}

export function EducationSection({ education }: Props) {
  if (!education.length) return null
  return (
    <section id="education" className="p-8 sm:p-12 md:p-16 lg:p-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        <div className="lg:col-span-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl xl:text-7xl font-bold text-white">
            Education
          </h2>
          <div className="w-[75px] h-[5px] mt-2 rounded-full bg-[#00e599]" />
        </div>

        <div className="lg:col-span-8">
          <div className="space-y-8">
            {education.map((entry, index) => (
              <div
                key={index}
                className="bg-[#0a2218] rounded-lg border border-[#1a3a2c] p-4 sm:p-5 md:p-6 hover:border-[#00e599]/30 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white">{entry.degree}</h3>
                    <p className="text-base sm:text-lg text-[#00e599]">{entry.institution}</p>
                    {entry.grade && <p className="text-sm text-[#a1b3a8] mt-1">{entry.grade}</p>}
                  </div>
                  <span className="text-xs sm:text-sm text-[#6b7d72] mt-2 sm:mt-0 font-mono">
                    {entry.startDate} &ndash; {entry.endDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
