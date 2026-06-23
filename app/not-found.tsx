import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#061a13] px-6 text-center">
      <div className="text-[120px] sm:text-[160px] font-bold gradient-text leading-none select-none">
        404
      </div>
      <p className="text-lg text-[#a1b3a8] mt-4 mb-8 max-w-md">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center px-8 h-12 bg-[#00e599] text-black font-semibold hover:bg-[#00cc88] transition-colors duration-200 rounded-md"
      >
        Back to Home
      </Link>
    </div>
  )
}
