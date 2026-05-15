import type { ExperienceEntry } from '@/lib/portfolio-types'

interface Props {
  experience: ExperienceEntry[]
}

function ExperienceDescription({ entry }: { entry: ExperienceEntry }) {
  const hasStructured =
    (entry.highlights && entry.highlights.length > 0) ||
    (entry.technologies && entry.technologies.length > 0)

  if (hasStructured) {
    return (
      <div className="space-y-3">
        {entry.description && (
          <div className="space-y-2">
            {entry.description.split('\n').filter(Boolean).map((para, i) => (
              <p key={i} className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        )}

        {entry.highlights && entry.highlights.length > 0 && (
          <ul className="list-disc list-outside ml-4 space-y-1.5 text-sm sm:text-base text-[#a1a1aa] leading-relaxed">
            {entry.highlights.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}

        {entry.technologies && entry.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {entry.technologies.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 bg-[#1f1f1f] text-[#a1a1aa] rounded-md text-xs font-medium hover:text-[#00e599] hover:border-[#00e599]/30 border border-transparent transition-colors duration-200"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  const paragraphs = entry.description.split('\n').filter(Boolean)

  if (paragraphs.length > 1) {
    return (
      <div className="space-y-2">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed">
            {para}
          </p>
        ))}
      </div>
    )
  }

  const sentences = entry.description
    .split(/\.\s+/)
    .map((s) => s.replace(/\.$/, '').trim())
    .filter(Boolean)

  if (sentences.length <= 1) {
    return (
      <p className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed">{entry.description}</p>
    )
  }

  const [first, ...rest] = sentences

  return (
    <div className="space-y-2">
      <p className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed">{first}.</p>
      <ul className="list-disc list-outside ml-4 space-y-1.5 text-sm sm:text-base text-[#a1a1aa] leading-relaxed">
        {rest.map((bullet, i) => (
          <li key={i}>{bullet}.</li>
        ))}
      </ul>
    </div>
  )
}

export function ExperienceSection({ experience }: Props) {
  if (!experience.length) return null
  return (
    <section id="experience" className="p-8 sm:p-12 md:p-16 lg:p-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        <div className="lg:col-span-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl xl:text-7xl font-bold text-white">
            Experience
          </h2>
          <div className="w-[75px] h-[5px] mt-2 rounded-full bg-[#00e599]" />
        </div>

        <div className="lg:col-span-8">
          <div className="relative">
            {experience.map((entry, index) => (
              <div key={index} className="relative mb-12 last:mb-0">
                <div className="absolute left-1/2 -top-2 w-4 h-4 border-2 rounded-full -translate-x-1/2 z-20 border-[#00e599] bg-[#00e599]" />

                {index < experience.length - 1 && (
                  <div className="absolute left-1/2 bottom-0 w-0.5 h-12 bg-[#1f1f1f] -translate-x-1/2 translate-y-full z-10" />
                )}

                <div className="bg-[#111111] rounded-lg border border-[#1f1f1f] p-4 sm:p-5 md:p-6 hover:border-[#00e599]/30 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-white">{entry.role}</h3>
                      <p className="text-base sm:text-lg text-[#00e599]">
                        {entry.company}
                        {entry.location && (
                          <span className="text-[#52525b] text-sm ml-2">
                            &middot; {entry.location}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-xs sm:text-sm text-[#52525b] mt-2 sm:mt-0 font-mono">
                      {entry.startDate} &ndash; {entry.endDate}
                    </span>
                  </div>

                  <ExperienceDescription entry={entry} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
