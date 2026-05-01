interface Props { skills: string[] }

export function SkillsSection({ skills }: Props) {
  if (!skills.length) return null
  return (
    <section id="skills" className="py-20 bg-[#0a0a0a] border-t border-[#1f1f1f]">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center gradient-text">Skills</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {skills.map((skill) => (
            <span
              key={skill}
              className="bg-[#161616] border border-[#00e599] text-[#00e599] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#00e599] hover:text-black transition-colors duration-200 cursor-default"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
