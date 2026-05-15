interface Props {
  about: string
  skills: string[]
}

export function AboutSection({ about, skills }: Props) {
  return (
    <section id="about" className="p-8 sm:p-12 md:p-16 lg:p-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        <div className="lg:col-span-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl xl:text-7xl font-bold text-white">
            About Me
          </h2>
          <div className="w-[75px] h-[5px] mt-2 rounded-full bg-[#00e599]" />
        </div>

        <div className="lg:col-span-8 space-y-8">
          <p className="text-lg sm:text-xl md:text-2xl leading-relaxed text-[#a1a1aa]">{about}</p>

          {skills.length > 0 && (
            <div className="pt-4">
              <div className="flex flex-wrap gap-3">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1f1f1f] text-[#a1a1aa] rounded-full text-sm sm:text-base md:text-lg font-medium hover:bg-[#00e599] hover:text-black transition-colors duration-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
