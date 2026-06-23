'use client'

interface Props {
  mode: 'edit' | 'preview'
  onToggleMode: () => void
  onPublish: () => void
  onReupload?: () => void
  isPublishing: boolean
  isDisabled?: boolean
}

export function EditorActionBar({
  mode,
  onToggleMode,
  onPublish,
  onReupload,
  isPublishing,
  isDisabled = false,
}: Props) {
  return (
    <div className="flex items-center justify-end gap-2 sm:gap-3 w-full md:w-auto">
      <button
        onClick={onToggleMode}
        disabled={isDisabled}
        className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:px-3.5 sm:py-1.5 text-xs font-medium text-[#a1b3a8] border border-[#1a3a2c] rounded-full bg-[#0a2218]/60 hover:border-[#00e599] hover:text-[#00e599] hover:bg-[#0a2218] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mode === 'edit' ? (
            <>
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
            </>
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          )}
        </svg>
        {mode === 'edit' ? 'Preview' : 'Edit'}
      </button>

      <button
        onClick={onPublish}
        disabled={isPublishing || isDisabled}
        className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 text-xs font-semibold text-[#061a13] rounded-full bg-gradient-to-b from-[#5fe3a1] to-[#00b377] shadow-[0_4px_14px_rgba(0,229,153,0.4),inset_0_1px_0_rgba(255,255,255,0.4)] hover:shadow-[0_6px_20px_rgba(0,229,153,0.55),inset_0_1px_0_rgba(255,255,255,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12h14M12 5l7 7-7 7"
          />
        </svg>
        {isPublishing ? 'Publishing...' : 'Publish'}
      </button>

      {onReupload && (
        <button
          onClick={onReupload}
          disabled={isDisabled}
          aria-label="Re-upload resume"
          title="Re-upload resume"
          className="shrink-0 inline-flex items-center justify-center gap-1.5 p-2 sm:px-4 sm:py-1.5 text-xs font-semibold text-[#061a13] rounded-full bg-gradient-to-b from-[#5fe3a1] to-[#00b377] shadow-[0_4px_14px_rgba(0,229,153,0.4),inset_0_1px_0_rgba(255,255,255,0.4)] hover:shadow-[0_6px_20px_rgba(0,229,153,0.55),inset_0_1px_0_rgba(255,255,255,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="hidden sm:inline">Re-upload Resume</span>
        </button>
      )}
    </div>
  )
}
