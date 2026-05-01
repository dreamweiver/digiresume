const features = [
  {
    number: '01',
    title: 'AI-Powered Parsing',
    description:
      'Upload your PDF resume and our AI extracts your experience, skills, projects, and education automatically.',
  },
  {
    number: '02',
    title: 'Instant Portfolio',
    description:
      'Get a beautiful, shareable portfolio page at digiresume.vercel.app/u/your-name. No design skills needed.',
  },
  {
    number: '03',
    title: 'Always Up to Date',
    description:
      'Edit any section, save changes, and re-publish. Your portfolio URL stays the same.',
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-[#111111] px-6 py-24 border-t border-[#1f1f1f]">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl sm:text-4xl font-bold gradient-text mb-4">
          Everything you need, nothing you don&apos;t
        </h2>
        <p className="text-center text-[#a1a1aa] mb-14 text-base max-w-xl mx-auto">
          Three steps from resume to published portfolio — no design tools, no friction.
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-6 hover:border-[#00e599] transition-colors duration-200 group"
            >
              <div className="text-[#00e599] font-mono text-sm font-semibold mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
                {feature.number}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-[#a1a1aa] text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
