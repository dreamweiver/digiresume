'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { pdf } from '@react-pdf/renderer'
import type { Portfolio } from '@/lib/db/schema'
import type { PortfolioData } from '@/lib/portfolio-types'
import { EMPTY_PORTFOLIO } from '@/lib/portfolio-types'
import { PARSING_MESSAGES } from '@/lib/parsing-messages'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { ActionBar } from '@/components/dashboard/ActionBar'
import { ResumeUploader } from '@/components/dashboard/ResumeUploader'
import { Spinner } from '@/components/ui/spinner'
import { PortfolioEditor } from '@/components/dashboard/PortfolioEditor'
import { PortfolioTemplate } from '@/components/portfolio/PortfolioTemplate'
import { PortfolioPDF } from '@/components/portfolio/PortfolioPDF'

interface Props {
  initialPortfolio: Portfolio | null
  initialData: PortfolioData | null
  usernameSlug: string
  userName: string
}

export function DashboardClient({ initialPortfolio, initialData, usernameSlug, userName }: Props) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(initialData ?? EMPTY_PORTFOLIO)
  const [hasPortfolio, setHasPortfolio] = useState<boolean>(initialPortfolio !== null)
  const rawStatus = initialPortfolio?.status
  const [status, setStatus] = useState<'draft' | 'published'>(
    rawStatus === 'published' ? 'published' : 'draft',
  )
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [isParsing, setIsParsing] = useState(false)
  const [parsingMessage, setParsingMessage] = useState(
    () => PARSING_MESSAGES[Math.floor(Math.random() * PARSING_MESSAGES.length)],
  )
  const [slug, setSlug] = useState(usernameSlug)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isReuploading, setIsReuploading] = useState(false)

  useEffect(() => {
    if (!isParsing) return
    const shuffled = [...PARSING_MESSAGES].sort(() => Math.random() - 0.5)
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % shuffled.length
      setParsingMessage(shuffled[i])
    }, 3000)
    return () => clearInterval(interval)
  }, [isParsing])

  const publicUrl = status === 'published' && slug ? `/u/${slug}` : null

  const handleGenerated = useCallback((data: PortfolioData, newSlug?: string) => {
    setPortfolioData(data)
    setHasPortfolio(true)
    setIsReuploading(false)
    if (newSlug) setSlug(newSlug)
  }, [])

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
      if (slug) {
        window.open(`/u/${slug}`, '_blank')
      } else {
        toast.error('Could not determine your profile URL. Please refresh.')
      }
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
      <DashboardHeader status={status} publicUrl={publicUrl} userName={userName} />

      <main className="relative flex-1 flex items-center justify-center overflow-hidden p-[clamp(16px,5vw,16px)]">
        <Image src="/fuji-bg.jpg" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-transparent" />

        {isParsing && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-sm">
            <Spinner size="lg" />
            <p className="mt-4 text-sm text-[#00e599] text-center max-w-md px-4 transition-opacity duration-500">
              {parsingMessage}
            </p>
          </div>
        )}

        {!hasPortfolio || isReuploading ? (
          <div className="relative z-10 w-full max-w-xl mx-auto p-4 rounded-2xl bg-white/20 backdrop-blur-[12px] border border-white/20 shadow-2xl flex flex-col gap-3">
            {isReuploading && (
              <button
                onClick={() => setIsReuploading(false)}
                className="absolute top-3 right-3 p-1 rounded-md text-gray-500 hover:text-gray-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">
              {isReuploading ? 'Upload a new resume' : 'Upload your resume to get started'}
            </h2>
            <p className="text-gray-600 mb-2 text-sm">
              Drop your PDF below and let AI do the rest.
            </p>
            <ResumeUploader onGenerated={handleGenerated} onParsingChange={setIsParsing} />
          </div>
        ) : mode === 'edit' ? (
          <div className="relative z-10 w-[75vw] mx-auto p-4 rounded-2xl bg-white/20 backdrop-blur-[12px] border border-white/20 shadow-2xl flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-12rem)]">
            <PortfolioEditor
              data={portfolioData}
              onChange={setPortfolioData}
              onReupload={() => setIsReuploading(true)}
            />
          </div>
        ) : (
          <div className="relative z-10 flex items-center gap-4 w-full max-w-6xl mx-auto">
            <div className="flex-1 p-4 rounded-2xl bg-white/20 backdrop-blur-[12px] border border-white/20 shadow-2xl flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-12rem)]">
              <PortfolioTemplate data={portfolioData} />
            </div>
            <button
              onClick={() => setMode('edit')}
              className="shrink-0 p-3 rounded-full cursor-pointer text-[#52525b] border border-[#1f1f1f] bg-[#0a0a0a]/80 hover:text-[#00e599] hover:border-[#00e599] hover:bg-[#00e599]/10 hover:scale-110 transition-all duration-200"
              title="Close preview"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
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
