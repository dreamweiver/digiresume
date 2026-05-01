'use client'
import { useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { pdf } from '@react-pdf/renderer'
import type { Portfolio } from '@/lib/db/schema'
import type { PortfolioData } from '@/lib/portfolio-types'
import { EMPTY_PORTFOLIO } from '@/lib/portfolio-types'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { ActionBar } from '@/components/dashboard/ActionBar'
import { ResumeUploader } from '@/components/dashboard/ResumeUploader'
import { PortfolioEditor } from '@/components/dashboard/PortfolioEditor'
import { PortfolioTemplate } from '@/components/portfolio/PortfolioTemplate'
import { PortfolioPDF } from '@/components/portfolio/PortfolioPDF'

interface Props {
  initialPortfolio: Portfolio | null
  initialData: PortfolioData | null
  usernameSlug: string
}

export function DashboardClient({ initialPortfolio, initialData, usernameSlug }: Props) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(
    initialData ?? EMPTY_PORTFOLIO
  )
  const [hasPortfolio, setHasPortfolio] = useState<boolean>(initialPortfolio !== null)
  const rawStatus = initialPortfolio?.status
  const [status, setStatus] = useState<'draft' | 'published'>(
    rawStatus === 'published' ? 'published' : 'draft'
  )
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const publicUrl = status === 'published' && usernameSlug
    ? `/u/${usernameSlug}`
    : null

  function handleGenerated(data: PortfolioData) {
    setPortfolioData(data)
    setHasPortfolio(true)
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioData }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Failed to save')
      }
      toast.success('Draft saved successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePublish() {
    setIsPublishing(true)
    try {
      // auto-save first so published content is always current
      const saveRes = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioData }),
      })
      if (!saveRes.ok) throw new Error('Failed to save before publishing')

      // then publish
      const res = await fetch('/api/portfolio/publish', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to publish')
      setStatus('published')
      toast.success('Portfolio published!')
    } catch {
      toast.error('Failed to publish portfolio')
    } finally {
      setIsPublishing(false)
    }
  }

  async function handleDownload() {
    setIsDownloading(true)
    try {
      const blob = await pdf(<PortfolioPDF data={portfolioData} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'resume.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 100)
    } catch {
      toast.error('Failed to generate PDF')
    } finally {
      setIsDownloading(false)
    }
  }

  function handleToggleMode() {
    setMode((prev) => (prev === 'edit' ? 'preview' : 'edit'))
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <DashboardHeader status={status} publicUrl={publicUrl} />

      <main className="flex-1 overflow-auto p-6">
        {!hasPortfolio ? (
          <div className="max-w-xl mx-auto mt-16">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Upload your resume to get started
            </h2>
            <p className="text-[#a1a1aa] mb-6 text-sm">Drop your PDF below and let AI do the rest.</p>
            <ResumeUploader onGenerated={handleGenerated} />
            {/* Preview of what they'll get */}
            <div className="mt-10 rounded-xl overflow-hidden border border-[#1f1f1f] shadow-[0_0_40px_rgba(0,229,153,0.06)] opacity-60">
              <Image
                src="/digiresume.jpg"
                alt="Example portfolio preview"
                width={800}
                height={480}
                className="w-full h-auto"
              />
            </div>
            <p className="text-center text-xs text-[#52525b] mt-3">Your portfolio will look like this</p>
          </div>
        ) : mode === 'edit' ? (
          <div className="max-w-3xl mx-auto">
            <PortfolioEditor data={portfolioData} onChange={setPortfolioData} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <PortfolioTemplate data={portfolioData} />
          </div>
        )}
      </main>

      {hasPortfolio && (
        <ActionBar
          mode={mode}
          onToggleMode={handleToggleMode}
          onSaveDraft={handleSave}
          onPublish={handlePublish}
          onDownloadPDF={handleDownload}
          isSaving={isSaving}
          isPublishing={isPublishing}
          isDownloading={isDownloading}
        />
      )}
    </div>
  )
}
