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
    <div className="border-t border-slate-200 bg-white px-6 py-4 flex items-center justify-between">
      <Button variant="outline" onClick={onToggleMode}>
        {mode === 'edit' ? 'Preview' : 'Back to Edit'}
      </Button>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onDownloadPDF} disabled={isDownloading}>{isDownloading ? 'Downloading...' : 'Download PDF'}</Button>
        <Button variant="outline" onClick={onSaveDraft} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Draft'}</Button>
        <Button onClick={onPublish} disabled={isPublishing}>{isPublishing ? 'Publishing...' : 'Publish'}</Button>
      </div>
    </div>
  )
}
