'use client'

interface Props {
  onSaveDraft: () => void
  onDownloadPDF: () => void
  isSaving: boolean
  isDownloading: boolean
  isDisabled?: boolean
}

export function ActionBar({
  onSaveDraft,
  onDownloadPDF,
  isSaving,
  isDownloading,
  isDisabled = false,
}: Props) {
  return (
    <div className="border-t border-[#1f1f1f] bg-[#0a0a0a]/95 backdrop-blur-sm px-6 h-14 flex items-center justify-between sticky bottom-0 z-50">
      <p className="text-[#52525b] text-xs">
        Created by{' '}
        <a
          href="https://github.com/dreamweiver"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#a1a1aa] hover:text-[#00e599] hover:underline"
        >
          @dreamweiver
        </a>
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={onDownloadPDF}
          disabled={isDownloading || isDisabled}
          className="h-8 px-3 text-xs font-medium text-[#a1a1aa] border border-[#1f1f1f] rounded-lg hover:border-[#00e599] hover:text-[#00e599] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
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
          disabled={isSaving || isDisabled}
          className="h-8 px-3 text-xs font-medium text-[#a1a1aa] border border-[#1f1f1f] rounded-lg hover:border-[#00e599] hover:text-[#00e599] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
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
    </div>
  )
}
