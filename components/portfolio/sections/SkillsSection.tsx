interface Props { skills: string[] }

export function SkillsSection({ skills }: Props) {
  if (!skills.length) return null
  return (
    <section id="skills" className="py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Skills</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {skills.map((skill) => (
            <span key={skill} className="bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium">{skill}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
