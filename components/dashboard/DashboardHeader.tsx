'use client'
import { UserButton } from '@clerk/nextjs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Props { status: 'draft' | 'published'; publicUrl: string | null }

export function DashboardHeader({ status, publicUrl }: Props) {
  function copyUrl() {
    if (publicUrl) navigator.clipboard.writeText(window.location.origin + publicUrl)
  }
  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-slate-900">DigiResume</h1>
        <Badge variant={status === 'published' ? 'default' : 'secondary'}>
          {status === 'published' ? 'Published' : 'Draft'}
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        {publicUrl && <Button variant="outline" size="sm" onClick={copyUrl}>Copy Portfolio URL</Button>}
        {publicUrl && (
          <a href={publicUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">View Live</Button>
          </a>
        )}
        <UserButton />
      </div>
    </header>
  )
}
