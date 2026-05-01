'use client'
import { Button } from '@/components/ui/button'

interface Props {
  mode: 'edit' | 'preview'
  onToggleMode: () => void
  onSaveDraft: () => void
  onPublish: () => void
  onDownloadPDF: () => void
  isSaving: boolean
  isPublishing: boolean
  isDownloading: boolean
}

export function ActionBar({ mode, onToggleMode, onSaveDraft, onPublish, onDownloadPDF, isSaving, isPublishing, isDownloading }: Props) {
  return (
    <div className="border-t border-[#1f1f1f] bg-[#111111] px-6 py-4 flex items-center justify-between">
      <Button
        variant="outline"
        onClick={onToggleMode}
        className="border-[#1f1f1f] text-white hover:border-[#00e599] hover:text-[#00e599] transition-colors duration-200 bg-transparent"
      >
        {mode === 'edit' ? 'Preview' : 'Back to Edit'}
      </Button>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onDownloadPDF}
          disabled={isDownloading}
          className="border-[#1f1f1f] text-white hover:border-[#00e599] hover:text-[#00e599] transition-colors duration-200 bg-transparent disabled:opacity-40"
        >
          {isDownloading ? 'Downloading...' : 'Download PDF'}
        </Button>
        <Button
          variant="outline"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="border-[#1f1f1f] text-white hover:border-[#00e599] hover:text-[#00e599] transition-colors duration-200 bg-transparent disabled:opacity-40"
        >
          {isSaving ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button
          onClick={onPublish}
          disabled={isPublishing}
          className="bg-[#00e599] text-black font-semibold hover:bg-[#00cc88] transition-colors duration-200 disabled:opacity-40"
        >
          {isPublishing ? 'Publishing...' : 'Publish'}
        </Button>
      </div>
    </div>
  )
}
