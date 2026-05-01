import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

const features = [
  {
    title: 'AI-Powered Parsing',
    description:
      'Upload your PDF resume and our AI extracts your experience, skills, projects, and education automatically.',
  },
  {
    title: 'Instant Portfolio',
    description:
      'Get a beautiful, shareable portfolio page at digiresume.vercel.app/u/your-name. No design skills needed.',
  },
  {
    title: 'Always Up to Date',
    description:
      'Edit any section, save changes, and re-publish. Your portfolio URL stays the same.',
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-slate-950 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-white mb-12">
          Everything you need, nothing you don&apos;t
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="bg-slate-800 border-slate-700 ring-slate-700 text-white"
            >
              <CardHeader>
                <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                <CardDescription className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
