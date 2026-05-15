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
    <header className="border-b border-[#1f1f1f] bg-[#0a0a0a]/95 backdrop-blur-sm px-6 h-16 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Image
          src="/digiresume.png"
          alt="DigiResume"
          width={28}
          height={28}
          className="rounded-md"
        />
        <span className="text-white font-semibold text-2xl tracking-tight">DigiResume</span>
        <span
          className={
            status === 'published'
              ? 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium bg-[#00e599]/10 text-[#00e599] border border-[#00e599]/20'
              : 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium bg-[#1f1f1f] text-[#52525b] border border-[#2a2a2a]'
          }
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${status === 'published' ? 'bg-[#00e599]' : 'bg-[#52525b]'}`}
          />
          {status === 'published' ? 'Published' : 'Draft'}
        </span>
        {publicUrl && (
          <div className="inline-flex items-center gap-1.5">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#00e599] hover:underline inline-flex items-center gap-1"
            >
              {publicUrl}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="p-1.5 rounded-md cursor-pointer text-[#52525b] hover:text-[#00e599] hover:bg-[#00e599]/10 hover:scale-110 transition-all duration-200"
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

      <div className="flex items-center gap-3">
        <span className="text-base text-[#a1a1aa] hidden sm:block">{userName}</span>
        <UserButton />
      </div>
    </header>
  )
}
