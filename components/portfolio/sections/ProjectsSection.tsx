import type { ProjectEntry } from '@/lib/portfolio-types'

interface Props { projects: ProjectEntry[] }

export function ProjectsSection({ projects }: Props) {
  if (!projects.length) return null
  return (
    <section id="projects" className="py-24 bg-[#111111] border-t border-[#1f1f1f]">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold gradient-text mb-2">Projects</h2>
        <p className="text-[#52525b] text-sm uppercase tracking-widest mb-12">What I&apos;ve built</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <div key={i} className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-6 flex flex-col hover:border-[#00e599] transition-colors duration-200">
              <span className="text-[#00e599] text-4xl font-bold mb-4 font-mono">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="text-white font-semibold text-lg mb-2">{project.name}</h3>
              <p className="text-[#a1a1aa] text-sm leading-relaxed mb-4 flex-1">{project.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.techStack.map(tech => (
                  <span key={tech} className="bg-[#0a0a0a] border border-[#1f1f1f] text-[#a1a1aa] px-2 py-0.5 rounded text-xs">{tech}</span>
                ))}
              </div>
              <div className="flex gap-4 text-sm">
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[#00e599] hover:text-white transition-colors">
                    Live Demo &#8599;
                  </a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[#00e599] hover:text-white transition-colors">
                    GitHub &#8599;
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
