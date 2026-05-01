'use client'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import type { PortfolioData } from '@/lib/portfolio-types'

interface Props {
  onGenerated: (data: PortfolioData) => void
}

export function ResumeUploader({ onGenerated }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type === 'application/pdf') {
      setFile(dropped)
      setError(null)
    } else {
      setError('Only PDF files are supported')
    }
  }

  async function handleGenerate() {
    if (!file) return
    setIsLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('resume', file)
      const res = await fetch('/api/parse', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Parse failed')
      onGenerated(json.portfolioData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors duration-200 bg-[#111111]
          ${isDragging
            ? 'border-[#00e599] bg-[#0d1a14]'
            : 'border-[#1f1f1f] hover:border-[#00e599]'
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) { setFile(f); setError(null) }
          }}
        />
        {file ? (
          <div>
            <p className="text-[#00e599] font-medium">{file.name}</p>
            <p className="text-[#a1a1aa] text-sm mt-1">Click to change file</p>
          </div>
        ) : (
          <>
            <div className="text-[#00e599] mb-3 opacity-60">
              <svg className="mx-auto w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-[#a1a1aa] text-base">Drag & drop your resume PDF here</p>
            <p className="text-[#52525b] text-sm mt-1">or click to browse</p>
          </>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button
        onClick={handleGenerate}
        disabled={!file || isLoading}
        className="w-full bg-[#00e599] text-black font-semibold hover:bg-[#00cc88] transition-colors duration-200 disabled:opacity-40"
      >
        {isLoading ? 'Generating Portfolio...' : 'Generate Portfolio'}
      </Button>
    </div>
  )
}
