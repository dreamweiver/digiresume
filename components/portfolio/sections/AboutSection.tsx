interface Props { about: string }

export function AboutSection({ about }: Props) {
  return (
    <section id="about" className="py-20 bg-[#111111] border-t border-[#1f1f1f]">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-8 text-center gradient-text">About Me</h2>
        <p className="text-[#a1a1aa] text-lg leading-relaxed text-center">{about}</p>
      </div>
    </section>
  )
}
