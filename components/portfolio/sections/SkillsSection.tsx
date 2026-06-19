interface Props {
  skills: string[]
}

export function SkillsSection({ skills }: Props) {
  if (!skills.length) return null
  return (
    <section id="skills" className="p-8 sm:p-12 md:p-16 lg:p-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        <div className="lg:col-span-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl xl:text-7xl font-bold text-white">
            Skills
          </h2>
          <div className="w-[75px] h-[5px] mt-2 rounded-full bg-[#00e599]" />
        </div>

        <div className="lg:col-span-8">
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1a3a2c] text-white rounded-full text-sm sm:text-base md:text-lg font-medium hover:bg-[#00e599] hover:text-black transition-colors duration-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
