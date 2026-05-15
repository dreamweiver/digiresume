interface Props {
  skills: string[]
}

export function SkillsSection({ skills }: Props) {
  if (!skills.length) return null
  return (
    <section id="skills" className="py-24 bg-[#0a0a0a] border-t border-[#1f1f1f]">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold gradient-text mb-2">Skills</h2>
        <p className="text-[#52525b] text-sm uppercase tracking-widest mb-12">
          Technologies I work with
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {skills.map((skill) => (
            <span
              key={skill}
              className="bg-[#161616] border border-[#00e599] text-[#00e599] px-4 py-2 rounded-full text-base font-medium hover:bg-[#00e599] hover:text-black transition-colors duration-200 cursor-default"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
