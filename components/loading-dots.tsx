'use client'

export function LoadingDots() {
  return (
    <div className="flex items-center gap-1 h-4">
      <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse-dot-1"></div>
      <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse-dot-2"></div>
      <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse-dot-3"></div>
    </div>
  )
}
