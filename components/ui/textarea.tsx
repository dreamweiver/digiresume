import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-16 w-full resize-none rounded-lg border border-[#1a3a2c] bg-[#0a2218]/40 px-3 py-2 text-sm text-white transition-colors outline-none focus:bg-[#0a2218]/70 placeholder:text-[#6b7d72] focus-visible:border-[#00e599]/60 focus-visible:ring-2 focus-visible:ring-[#00e599]/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
