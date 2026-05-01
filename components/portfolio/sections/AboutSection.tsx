interface Props { about: string }

export function AboutSection({ about }: Props) {
  return (
    <section id="about" className="py-24 bg-[#111111] border-t border-[#1f1f1f]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-bold gradient-text mb-3">About Me</h2>
            <p className="text-[#52525b] text-sm uppercase tracking-widest">Who I am</p>
          </div>
          <div>
            <p className="text-[#a1a1aa] text-base leading-relaxed">{about}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
