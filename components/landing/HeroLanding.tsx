'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function HeroLanding() {
  return (
    <section className="relative flex flex-col items-center justify-center flex-1 min-h-screen px-6 py-24 text-center bg-[#0a0a0a] overflow-hidden hero-grid-bg">
      {/* Glowing green orb behind headline */}
      <div className="hero-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full border border-[#1f1f1f] bg-[#111111] text-sm text-[#a1a1aa]">
          <span className="w-2 h-2 rounded-full bg-[#00e599] inline-block" />
          AI-powered resume to portfolio in seconds
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight gradient-text mb-6">
          Turn Your Resume<br />Into a Portfolio
        </h1>

        <p className="text-lg sm:text-xl text-[#a1a1aa] max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload your PDF resume and get a beautiful, shareable developer portfolio page in seconds.
          Powered by AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            render={<Link href="/sign-up" />}
            className="px-8 text-base h-12 bg-[#00e599] text-black font-semibold hover:bg-[#00cc88] transition-colors duration-200 rounded-md"
          >
            Get Started Free
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={<Link href="/sign-in" />}
            className="px-8 text-base h-12 border-[#1f1f1f] text-white hover:border-[#00e599] hover:text-[#00e599] transition-colors duration-200 rounded-md bg-transparent"
          >
            Sign In
          </Button>
        </div>

        {/* App preview image */}
        <div className="mt-16 relative mx-auto max-w-4xl rounded-xl overflow-hidden border border-[#1f1f1f] shadow-[0_0_60px_rgba(0,229,153,0.08)]">
          <Image
            src="/digiresume.jpg"
            alt="DigiResume app preview"
            width={1200}
            height={700}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
    </section>
  )
}
