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
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-slate-500 bg-slate-100' : 'border-slate-300 hover:border-slate-400'}`}
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
          <p className="text-slate-700 font-medium">{file.name}</p>
        ) : (
          <>
            <p className="text-slate-500 text-lg">Drag & drop your resume PDF here</p>
            <p className="text-slate-400 text-sm mt-1">or click to browse</p>
          </>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button onClick={handleGenerate} disabled={!file || isLoading} className="w-full">
        {isLoading ? 'Generating Portfolio...' : 'Generate Portfolio'}
      </Button>
    </div>
  )
}
