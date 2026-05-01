import type { ProjectEntry } from '@/lib/portfolio-types'

interface Props { projects: ProjectEntry[] }

export function ProjectsSection({ projects }: Props) {
  if (!projects.length) return null
  return (
    <section id="projects" className="py-20 bg-[#111111] border-t border-[#1f1f1f]">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center gradient-text">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <div key={i} className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-6 hover:border-[#00e599] transition-colors duration-200 flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-2">{project.name}</h3>
              <p className="text-[#a1a1aa] text-sm mb-4 leading-relaxed flex-1">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.techStack.map((tech) => (
                  <span key={tech} className="bg-[#0a0a0a] border border-[#1f1f1f] text-[#a1a1aa] px-2 py-0.5 rounded text-xs">{tech}</span>
                ))}
              </div>
              <div className="flex gap-3">
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[#00e599] hover:text-white underline text-sm transition-colors duration-200">Live Demo</a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[#00e599] hover:text-white underline text-sm transition-colors duration-200">GitHub</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
