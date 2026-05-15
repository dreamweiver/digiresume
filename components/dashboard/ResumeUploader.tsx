'use client'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import type { PortfolioData } from '@/lib/portfolio-types'

interface Props {
  onGenerated: (data: PortfolioData, usernameSlug?: string) => void
  onParsingChange?: (isParsing: boolean) => void
}

export function ResumeUploader({ onGenerated, onParsingChange }: Props) {
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
    onParsingChange?.(true)
    try {
      const formData = new FormData()
      formData.append('resume', file)
      const res = await fetch('/api/parse', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Parse failed')
      onGenerated(json.portfolioData, json.usernameSlug)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
      onParsingChange?.(false)
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
          ${
            isDragging
              ? 'border-[#00e599] bg-white/10'
              : 'border-white/20 bg-white/5 hover:border-[#00e599] hover:bg-white/10'
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) {
              setFile(f)
              setError(null)
            }
          }}
        />

        <div className="relative z-10">
          {file ? (
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#00e599]/10 border border-[#00e599]/30 mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-[#00e599]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-[#00e599] font-semibold text-base">{file.name}</p>
              <p className="text-[#52525b] text-sm">Click to change file</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] mx-auto">
                <svg
                  className="w-6 h-6 text-[#a1a1aa]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium text-base">Drop your resume here</p>
                <p className="text-[#52525b] text-sm mt-1">
                  or <span className="text-[#00e599]">click to browse</span> · PDF only
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm flex items-center gap-1.5">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}

      <Button
        onClick={handleGenerate}
        disabled={!file || isLoading}
        className="w-full h-11 bg-[#00e599] text-black font-semibold hover:bg-[#00cc88] transition-colors duration-200 disabled:opacity-40 rounded-xl text-sm"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Generating Portfolio...
          </span>
        ) : (
          'Generate Portfolio'
        )}
      </Button>
    </div>
  )
}
