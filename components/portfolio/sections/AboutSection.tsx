interface Props { about: string }

export function AboutSection({ about }: Props) {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">About Me</h2>
        <p className="text-slate-600 text-lg leading-relaxed text-center">{about}</p>
      </div>
    </section>
  )
}
