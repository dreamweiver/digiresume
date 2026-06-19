'use client'

interface Props {
  onSaveDraft: () => void
  onDownloadPDF: () => void
  isSaving: boolean
  isDownloading: boolean
  isDisabled?: boolean
  /**
   * Editor-mode actions. When provided they render only on mobile/tablet
   * (md:hidden) — on desktop they stay in EditorActionBar next to tabs.
   */
  editorMode?: 'edit' | 'preview'
  onToggleMode?: () => void
  onPublish?: () => void
  onReupload?: () => void
  isPublishing?: boolean
}

export function ActionBar({
  onSaveDraft,
  onDownloadPDF,
  isSaving,
  isDownloading,
  isDisabled = false,
  editorMode,
  onToggleMode,
  onPublish,
  onReupload,
  isPublishing = false,
}: Props) {
  const showEditorActions = editorMode !== undefined

  return (
    <div className="border-t border-[#1a3a2c] bg-[#061a13]/95 backdrop-blur-sm px-3 sm:px-6 h-12 sm:h-14 flex items-center justify-between gap-2 sticky bottom-0 z-50">
      <p className="hidden md:block text-[#6b7d72] text-xs">
        Created by{' '}
        <a
          href="https://github.com/dreamweiver"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#a1b3a8] hover:text-[#00e599] hover:underline"
        >
          @dreamweiver
        </a>
      </p>

      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto overflow-x-auto no-scrollbar">
        {/* Editor actions — mobile/tablet only (icon-only to fit) */}
        {showEditorActions && onToggleMode && (
          <button
            onClick={onToggleMode}
            disabled={isDisabled}
            aria-label={editorMode === 'edit' ? 'Preview' : 'Edit'}
            title={editorMode === 'edit' ? 'Preview' : 'Edit'}
            className="md:hidden shrink-0 h-9 w-9 inline-flex items-center justify-center text-[#a1b3a8] border border-[#1a3a2c] rounded-full hover:border-[#00e599] hover:text-[#00e599] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {editorMode === 'edit' ? (
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
          </button>
        )}

        {showEditorActions && onReupload && (
          <button
            onClick={onReupload}
            disabled={isDisabled}
            aria-label="Re-upload resume"
            title="Re-upload resume"
            className="md:hidden shrink-0 h-9 w-9 inline-flex items-center justify-center text-[#a1b3a8] border border-[#1a3a2c] rounded-full hover:border-[#00e599] hover:text-[#00e599] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
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
          </button>
        )}

        {/* Subtle divider between editor actions and Save/PDF on mobile */}
        {showEditorActions && (
          <span className="md:hidden h-5 w-px bg-[#1a3a2c] mx-0.5" aria-hidden="true" />
        )}

        <button
          onClick={onDownloadPDF}
          disabled={isDownloading || isDisabled}
          className="shrink-0 h-9 sm:h-8 px-3 text-xs font-medium text-[#a1b3a8] border border-[#1a3a2c] rounded-full hover:border-[#00e599] hover:text-[#00e599] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
        >
          <svg
            className="w-3.5 h-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          {isDownloading ? 'Downloading...' : 'PDF'}
        </button>

        {showEditorActions && onPublish && (
          <button
            onClick={onPublish}
            disabled={isPublishing || isDisabled}
            className="md:hidden shrink-0 h-9 px-3.5 text-xs font-semibold text-[#061a13] rounded-full bg-gradient-to-b from-[#5fe3a1] to-[#00b377] shadow-[0_4px_14px_rgba(0,229,153,0.4),inset_0_1px_0_rgba(255,255,255,0.4)] active:translate-y-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
            {isPublishing ? 'Publishing...' : 'Publish'}
          </button>
        )}

        <button
          onClick={onSaveDraft}
          disabled={isSaving || isDisabled}
          className="shrink-0 h-9 sm:h-8 px-4 text-xs font-semibold text-[#061a13] rounded-full bg-gradient-to-b from-[#5fe3a1] to-[#00b377] shadow-[0_4px_14px_rgba(0,229,153,0.4),inset_0_1px_0_rgba(255,255,255,0.4)] hover:shadow-[0_6px_20px_rgba(0,229,153,0.55),inset_0_1px_0_rgba(255,255,255,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
        >
          <svg
            className="w-3.5 h-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 21v-8H7v8M7 3v5h8"
            />
          </svg>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}
