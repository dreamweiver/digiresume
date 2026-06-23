import { HeroLanding } from '@/components/landing/HeroLanding'
import { FeaturesSection } from '@/components/landing/FeaturesSection'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#061a13]">
      <HeroLanding />
      <FeaturesSection />
    </div>
  )
}
