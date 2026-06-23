'use client'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { pdf } from '@react-pdf/renderer'
import type { Portfolio } from '@/lib/db/schema'
import type { PortfolioData } from '@/lib/portfolio-types'
import { EMPTY_PORTFOLIO } from '@/lib/portfolio-types'
import { PARSING_MESSAGES } from '@/lib/parsing-messages'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { ActionBar } from '@/components/dashboard/ActionBar'
import { EditorActionBar } from '@/components/dashboard/EditorActionBar'
import { ResumeUploader } from '@/components/dashboard/ResumeUploader'
import { Spinner } from '@/components/ui/spinner'
import {
  PortfolioEditor,
  EditorTabsList,
  EDITOR_DEFAULT_TAB,
} from '@/components/dashboard/PortfolioEditor'
import { Tabs } from '@/components/ui/tabs'
import { PortfolioTemplate } from '@/components/portfolio/PortfolioTemplate'
import { PortfolioPDF } from '@/components/portfolio/PortfolioPDF'
import { experienceArraySchema } from '@/lib/portfolio-schemas'

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

  function validateExperienceOrToast(): boolean {
    const result = experienceArraySchema.safeParse(portfolioData.experience)
    if (!result.success) {
      toast.error('Fix overlapping experience dates before continuing')
      return false
    }
    return true
  }

  async function handleSave() {
    if (!validateExperienceOrToast()) return
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
    if (!validateExperienceOrToast()) return
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
    <div className="min-h-screen flex flex-col bg-[#061a13]">
      <DashboardHeader status={status} publicUrl={publicUrl} userName={userName} />

      <main className="relative flex-1 flex items-center justify-center overflow-hidden p-3 sm:p-4 aurora-bg">
        {isParsing && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#061a13]/85 backdrop-blur-sm">
            <Spinner size="lg" />
            <p className="mt-4 text-base sm:text-lg md:text-xl font-medium text-[#00e599] text-center max-w-2xl px-4 transition-opacity duration-500">
              {parsingMessage}
            </p>
          </div>
        )}

        {!hasPortfolio || isReuploading ? (
          <div className="relative z-10 w-full max-w-xl mx-auto p-4 sm:p-6 rounded-2xl glass-surface flex flex-col gap-3">
            {isReuploading && (
              <button
                onClick={() => setIsReuploading(false)}
                className="absolute top-3 right-3 p-1 rounded-md text-[#a1b3a8] hover:text-white transition-colors"
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
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-1">
              {isReuploading ? 'Upload a new resume' : 'Upload your resume to get started'}
            </h2>
            <p className="text-[#a1b3a8] mb-2 text-sm">
              Drop your PDF below and let AI do the rest.
            </p>
            <ResumeUploader onGenerated={handleGenerated} onParsingChange={setIsParsing} />
          </div>
        ) : mode === 'edit' ? (
          <div className="relative z-10 w-full md:w-[78vw] lg:w-[75vw] mx-auto p-3 sm:p-4 rounded-2xl glass-surface flex flex-col gap-2.5 sm:gap-3 h-[calc(100dvh-7rem)] sm:h-[calc(100dvh-8rem)] md:h-[78vh] min-h-0 text-sm">
            <Tabs
              defaultValue={EDITOR_DEFAULT_TAB}
              className="flex flex-col gap-2.5 sm:gap-3 flex-1 min-h-0"
            >
              <div className="flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-between gap-2 md:gap-3">
                <EditorTabsList />
                <div className="hidden md:flex md:items-center md:gap-3">
                  <EditorActionBar
                    mode={mode}
                    onToggleMode={handleToggleMode}
                    onPublish={handlePublish}
                    onReupload={() => setIsReuploading(true)}
                    isPublishing={isPublishing}
                    isDisabled={isParsing}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto -mx-1 px-1">
                <PortfolioEditor data={portfolioData} onChange={setPortfolioData} />
              </div>
            </Tabs>
          </div>
        ) : (
          <div className="relative z-10 w-full max-w-6xl mx-auto">
            <div className="p-3 sm:p-4 rounded-2xl glass-surface flex flex-col gap-2.5 sm:gap-3 h-[calc(100dvh-7rem)] sm:h-[calc(100dvh-8rem)] md:h-[78vh] min-h-0">
              <div className="hidden md:flex md:items-center md:justify-end">
                <EditorActionBar
                  mode={mode}
                  onToggleMode={handleToggleMode}
                  onPublish={handlePublish}
                  isPublishing={isPublishing}
                  isDisabled={isParsing}
                />
              </div>
              <div className="flex-1 overflow-y-auto -mx-1 px-1">
                <PortfolioTemplate data={portfolioData} />
              </div>
            </div>
          </div>
        )}
      </main>

      {hasPortfolio && (
        <ActionBar
          onSaveDraft={handleSave}
          onDownloadPDF={handleDownload}
          isSaving={isSaving}
          isDownloading={isDownloading}
          isDisabled={isParsing}
          editorMode={mode}
          onToggleMode={handleToggleMode}
          onPublish={handlePublish}
          onReupload={() => setIsReuploading(true)}
          isPublishing={isPublishing}
        />
      )}
    </div>
  )
}
