import type { ProjectEntry } from '@/lib/portfolio-types'

interface Props {
  projects: ProjectEntry[]
}

export function ProjectsSection({ projects }: Props) {
  if (!projects.length) return null
  return (
    <section id="projects" className="p-8 sm:p-12 md:p-16 lg:p-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        <div className="lg:col-span-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl xl:text-7xl font-bold text-white">
            Side Projects
          </h2>
          <div className="w-[75px] h-[5px] mt-2 rounded-full bg-[#00e599]" />
        </div>

        <div className="lg:col-span-8">
          <div className="space-y-8">
            {projects.map((project, index) => {
              const hasLink = project.liveUrl || project.githubUrl
              const linkUrl = project.liveUrl || project.githubUrl

              return (
                <div key={index} className="group relative">
                  <div className="block relative p-4 sm:p-6 md:p-8 bg-[#111111] rounded-xl sm:rounded-2xl border border-[#1f1f1f] transition-all duration-300 hover:border-[#00e599]/30 hover:-translate-y-1">
                    {hasLink && (
                      <a
                        href={linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center bg-[#00e599] rounded-full text-black transition-all duration-300 hover:bg-[#00cc88]"
                      >
                        <svg
                          className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 17L17 7M17 7H7M17 7V17"
                          />
                        </svg>
                      </a>
                    )}

                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-mono text-[#00e599]">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                          {project.name}
                        </h3>
                      </div>

                      <p
                        className={`text-base sm:text-lg text-[#a1a1aa] leading-relaxed ${hasLink ? 'pr-12 sm:pr-14 md:pr-16' : ''}`}
                      >
                        {project.description}
                      </p>

                      {project.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-3 pt-2">
                          {project.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#2a2a2a] text-white rounded-full text-sm sm:text-base md:text-lg font-medium hover:bg-[#00e599] hover:text-black transition-colors duration-200"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 mt-2 text-sm font-medium text-black bg-[#00e599] rounded-lg hover:bg-[#00cc88] transition-colors duration-200"
                        >
                          Demo
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
