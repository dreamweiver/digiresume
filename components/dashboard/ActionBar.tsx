'use client'

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

export function ActionBar({
  mode,
  onToggleMode,
  onSaveDraft,
  onPublish,
  onDownloadPDF,
  isSaving,
  isPublishing,
  isDownloading,
}: Props) {
  return (
    <div className="border-t border-[#1f1f1f] bg-[#0a0a0a]/95 backdrop-blur-sm px-6 h-14 flex items-center justify-between sticky bottom-0 z-50">
      <div className="flex items-center gap-2">
        <button
          onClick={onDownloadPDF}
          disabled={isDownloading}
          className="h-8 px-3 text-xs font-medium text-[#a1a1aa] border border-[#1f1f1f] rounded-lg hover:border-[#00e599] hover:text-[#00e599] transition-colors duration-200 disabled:opacity-40 inline-flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          {isDownloading ? 'Downloading...' : 'PDF'}
        </button>

        <button
          onClick={onSaveDraft}
          disabled={isSaving}
          className="h-8 px-3 text-xs font-medium text-[#a1a1aa] border border-[#1f1f1f] rounded-lg hover:border-[#00e599] hover:text-[#00e599] transition-colors duration-200 disabled:opacity-40 inline-flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
          </svg>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMode}
          className="h-8 px-3 text-xs font-medium text-[#a1a1aa] border border-[#1f1f1f] rounded-lg hover:border-[#00e599] hover:text-[#00e599] transition-colors duration-200 inline-flex items-center gap-1.5"
        >
          {mode === 'edit' ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Preview
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </>
          )}
        </button>

        <button
          onClick={onPublish}
          disabled={isPublishing}
          className="h-8 px-4 text-xs font-semibold bg-[#00e599] text-black rounded-lg hover:bg-[#00cc88] transition-colors duration-200 disabled:opacity-40 inline-flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14M12 5l7 7-7 7"
            />
          </svg>
          {isPublishing ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </div>
  )
}
