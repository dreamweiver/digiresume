const sizes = {
  sm: 40,
  md: 64,
  lg: 96,
} as const

export function Spinner({ size = 'md' }: { size?: keyof typeof sizes }) {
  const px = sizes[size]
  return (
    <div className="relative flex items-center justify-center" style={{ width: px, height: px }}>
      <span className="pulse-ring" style={{ width: px, height: px }} />
      <span className="pulse-ring pulse-ring-delay" style={{ width: px, height: px }} />
      <span
        className="absolute rounded-full bg-[#00e599]"
        style={{ width: px * 0.2, height: px * 0.2 }}
      />
    </div>
  )
}
