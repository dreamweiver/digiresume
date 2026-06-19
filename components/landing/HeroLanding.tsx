import Link from 'next/link'
import Image from 'next/image'

export function HeroLanding() {
  return (
    <section className="relative flex items-center flex-1 min-h-screen px-6 py-12 bg-[#061a13] overflow-hidden hero-grid-bg">
      {/* Glowing green orb */}
      <div className="hero-glow top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left — text + CTA */}
        <div>
          <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full border border-[#1a3a2c] bg-[#0a2218] text-sm text-[#a1b3a8]">
            <span className="w-2 h-2 rounded-full bg-[#00e599] inline-block" />
            AI-powered resume to portfolio in seconds
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight gradient-text mb-6">
            Turn Your Resume
            <br />
            Into a Portfolio
          </h1>

          <p className="text-lg text-[#a1b3a8] max-w-lg mb-10 leading-relaxed">
            Upload your PDF resume and get a beautiful, shareable developer portfolio page in
            seconds. Powered by Google Gemini AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center px-8 text-base h-12 text-[#061a13] font-semibold rounded-full bg-gradient-to-b from-[#5fe3a1] to-[#00b377] shadow-[0_6px_20px_rgba(0,229,153,0.4),inset_0_1px_0_rgba(255,255,255,0.4)] hover:shadow-[0_8px_28px_rgba(0,229,153,0.55),inset_0_1px_0_rgba(255,255,255,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Get Started Free
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center px-8 text-base h-12 border border-[#1a3a2c] text-white hover:border-[#00e599] hover:text-[#00e599] transition-colors duration-200 rounded-full bg-[#0a2218]/40"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Right — app preview image */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="rounded-xl overflow-hidden border border-[#1a3a2c] shadow-[0_0_60px_rgba(0,229,153,0.12)]">
            <Image
              src="/digiresume.jpg"
              alt="DigiResume app preview"
              width={540}
              height={380}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
