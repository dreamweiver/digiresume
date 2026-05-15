import Image from 'next/image'
import type { HeroData, SocialLinks } from '@/lib/portfolio-types'

interface Props {
  hero: HeroData
  socialLinks: SocialLinks
}

export function HeroSection({ hero, socialLinks }: Props) {
  const gender = hero.gender ?? 'unknown'

  let photoSrc: string
  if (hero.profilePhoto) {
    photoSrc = hero.profilePhoto
  } else if (socialLinks.github) {
    const username = socialLinks.github.replace(/\/$/, '').split('/').pop()
    photoSrc = `https://github.com/${username}.png`
  } else {
    photoSrc = gender === 'female' ? '/viking_women.jpeg' : '/viking_man.jpeg'
  }

  return (
    <section id="hero" className="relative isolate overflow-hidden bg-[#0a0a0a] min-h-screen">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_800px_1200px_at_0%_0%,rgba(0,229,153,0.15)_0%,rgba(0,229,153,0.08)_20%,rgba(0,229,153,0.03)_40%,transparent_70%)]" />
      <div className="h-full min-h-screen flex items-center p-8 sm:p-12 md:p-24">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16 w-full">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl md:text-5xl font-bold tracking-tight text-[#a1a1aa]">
              Hello! 👋
            </h2>
            <h1 className="mt-6 sm:mt-8 md:mt-10 text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold tracking-tight text-white">
              I&apos;m <span className="text-[#00e599]">{hero.name}</span>
            </h1>
            <p className="mt-4 sm:mt-6 md:mt-8 text-lg sm:text-xl md:text-2xl font-medium text-[#a1a1aa]">
              {hero.title}
            </p>
            {hero.bio && (
              <p className="mt-4 text-base sm:text-lg md:text-xl text-[#52525b] max-w-2xl leading-relaxed">
                {hero.bio}
              </p>
            )}
          </div>
          <div className="shrink-0">
            <Image
              src={photoSrc}
              alt={hero.name}
              width={180}
              height={180}
              className="rounded-full border-2 border-[#00e599] object-cover w-36 h-36 md:w-44 md:h-44"
            />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 md:p-24 flex gap-x-4 sm:gap-x-6 md:gap-x-8 text-[#a1a1aa]">
        {socialLinks.linkedin && (
          <a
            href={socialLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="transition-colors duration-300 hover:text-[#00e599]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
            >
              <path d="M8 11v5" />
              <path d="M8 8v.01" />
              <path d="M12 16v-5" />
              <path d="M16 16v-3a2 2 0 1 0-4 0" />
              <path d="M3 7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" />
            </svg>
          </a>
        )}
        {socialLinks.twitter && (
          <a
            href={socialLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="transition-colors duration-300 hover:text-[#00e599]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
            >
              <path d="M4 4l11.733 16h4.267l-11.733-16z" />
              <path d="M4 20l6.768-6.768m2.46-2.46L20 4" />
            </svg>
          </a>
        )}
        {socialLinks.github && (
          <a
            href={socialLinks.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="transition-colors duration-300 hover:text-[#00e599]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
            >
              <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0c-2.4-1.6-3.5-1.3-3.5-1.3a4.2 4.2 0 0 0-.1 3.2 4.6 4.6 0 0 0-1.3 3.2c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2v3.5" />
            </svg>
          </a>
        )}
        {socialLinks.website && (
          <a
            href={socialLinks.website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Website"
            className="transition-colors duration-300 hover:text-[#00e599]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </a>
        )}
      </div>
    </section>
  )
}
