'use client'
import { UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

interface Props { status: 'draft' | 'published'; publicUrl: string | null }

export function DashboardHeader({ status, publicUrl }: Props) {
  function copyUrl() {
    if (publicUrl) navigator.clipboard.writeText(window.location.origin + publicUrl)
  }
  return (
    <header className="border-b border-[#1f1f1f] bg-[#0a0a0a] px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-[#00e599] tracking-tight">DigiResume</h1>
        <span
          className={
            status === 'published'
              ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#00e599] text-black'
              : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1f1f1f] text-[#a1a1aa]'
          }
        >
          {status === 'published' ? 'Published' : 'Draft'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {publicUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={copyUrl}
            className="border-[#1f1f1f] text-white hover:border-[#00e599] hover:text-[#00e599] transition-colors duration-200 bg-transparent"
          >
            Copy Portfolio URL
          </Button>
        )}
        {publicUrl && (
          <a href={publicUrl} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="sm"
              className="border-[#1f1f1f] text-white hover:border-[#00e599] hover:text-[#00e599] transition-colors duration-200 bg-transparent"
            >
              View Live
            </Button>
          </a>
        )}
        <UserButton />
      </div>
    </header>
  )
}
