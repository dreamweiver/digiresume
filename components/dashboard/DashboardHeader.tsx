'use client'
import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'
import { toast } from 'sonner'

interface Props {
  status: 'draft' | 'published'
  publicUrl: string | null
  userName: string
}

export function DashboardHeader({ status, publicUrl, userName }: Props) {
  function copyUrl() {
    if (publicUrl) {
      navigator.clipboard.writeText(window.location.origin + publicUrl)
      toast.success('URL is copied to clipboard')
    }
  }

  return (
    <header className="border-b border-[#1a3a2c] bg-[#061a13]/95 backdrop-blur-sm px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Image
          src="/digiresume.png"
          alt="DigiResume"
          width={28}
          height={28}
          className="rounded-md shrink-0"
        />
        <span className="text-white font-semibold text-lg sm:text-2xl tracking-tight">
          DigiResume
        </span>
        <span
          className={
            status === 'published'
              ? 'inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-[#00e599]/10 text-[#00e599] border border-[#00e599]/20 shrink-0'
              : 'inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-[#1a3a2c] text-[#6b7d72] border border-[#234a3a] shrink-0'
          }
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${status === 'published' ? 'bg-[#00e599]' : 'bg-[#6b7d72]'}`}
          />
          {status === 'published' ? 'Published' : 'Draft'}
        </span>
        {publicUrl && (
          <div className="inline-flex items-center gap-1.5 min-w-0">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex text-sm text-[#00e599] hover:underline items-center gap-1 truncate max-w-[40vw]"
            >
              <span className="truncate">{publicUrl}</span>
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
            <button
              onClick={copyUrl}
              title="Copy URL to clipboard"
              aria-label="Copy public URL to clipboard"
              className="p-2 sm:p-1.5 rounded-md cursor-pointer text-[#6b7d72] hover:text-[#00e599] hover:bg-[#00e599]/10 hover:scale-110 transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <span className="text-base text-[#a1b3a8] hidden sm:block">{userName}</span>
        <UserButton />
      </div>
    </header>
  )
}
