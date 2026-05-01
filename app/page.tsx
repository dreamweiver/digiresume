import { Toaster } from '@/components/ui/sonner'
import { HeroLanding } from '@/components/landing/HeroLanding'
import { FeaturesSection } from '@/components/landing/FeaturesSection'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a]">
      <HeroLanding />
      <FeaturesSection />
      <Toaster />
    </div>
  )
}
