import type { ProjectEntry } from '@/lib/portfolio-types'

interface Props { projects: ProjectEntry[] }

export function ProjectsSection({ projects }: Props) {
  if (!projects.length) return null
  return (
    <section id="projects" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{project.name}</h3>
              <p className="text-slate-600 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.techStack.map((tech) => (
                  <span key={tech} className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-sm">{tech}</span>
                ))}
              </div>
              <div className="flex gap-3">
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                    className="text-slate-700 hover:text-slate-900 underline text-sm">Live Demo</a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                    className="text-slate-700 hover:text-slate-900 underline text-sm">GitHub</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
