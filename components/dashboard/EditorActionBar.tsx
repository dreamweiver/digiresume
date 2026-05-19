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
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={onToggleMode}
        disabled={isDisabled}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#a1a1aa] border border-[#1f1f1f] rounded-lg bg-[#0a0a0a]/80 hover:border-[#00e599] hover:text-[#00e599] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#00e599] text-black rounded-lg hover:bg-[#00cc88] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#00e599] text-black rounded-lg hover:bg-[#00cc88] hover:scale-105 hover:shadow-[0_0_16px_rgba(0,229,153,0.4)] transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
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
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Re-upload Resume
        </button>
      )}
    </div>
  )
}
