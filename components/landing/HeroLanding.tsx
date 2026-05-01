'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroLanding() {
  return (
    <section className="flex flex-col items-center justify-center flex-1 px-6 py-24 text-center bg-slate-900">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white max-w-3xl">
        Turn Your Resume Into a Portfolio
      </h1>
      <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl">
        Upload your PDF resume and get a beautiful, shareable developer portfolio page in seconds.
        Powered by AI.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Button
          size="lg"
          render={<Link href="/sign-up" />}
          className="px-8 text-base h-12"
        >
          Get Started Free
        </Button>
        <Button
          size="lg"
          variant="outline"
          render={<Link href="/sign-in" />}
          className="px-8 text-base h-12 border-slate-600 text-white hover:bg-slate-800 hover:text-white"
        >
          Sign In
        </Button>
      </div>
    </section>
  )
}
