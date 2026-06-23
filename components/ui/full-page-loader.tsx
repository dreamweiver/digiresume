import { Spinner } from './spinner'

export function FullPageLoader({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#061a13]">
      <Spinner size="lg" />
      {message && <p className="mt-4 text-sm text-[#a1b3a8]">{message}</p>}
    </div>
  )
}
