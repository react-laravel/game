'use client'

import { useEffect, useState } from 'react'
import type { HitPulse, StreakToast } from '../../hooks/useShootingSession'

interface SessionFeedbackProps {
  hitPulse: HitPulse | null
  streakToast: StreakToast | null
  reducedMotion?: boolean
}

export function SessionFeedback({
  hitPulse,
  streakToast,
  reducedMotion = false,
}: SessionFeedbackProps) {
  const [visiblePop, setVisiblePop] = useState<HitPulse | null>(null)
  const [visibleToast, setVisibleToast] = useState<StreakToast | null>(null)

  useEffect(() => {
    if (!hitPulse) return
    setVisiblePop(hitPulse)
    const timer = window.setTimeout(() => setVisiblePop(null), 520)
    return () => window.clearTimeout(timer)
  }, [hitPulse])

  useEffect(() => {
    if (!streakToast) return
    setVisibleToast(streakToast)
    const timer = window.setTimeout(() => setVisibleToast(null), 1100)
    return () => window.clearTimeout(timer)
  }, [streakToast])

  return (
    <>
      {visiblePop && (
        <div
          key={visiblePop.id}
          className={`pointer-events-none absolute top-[42%] left-1/2 z-30 ${
            reducedMotion ? 'score-pop-static' : 'animate-score-pop'
          }`}
          aria-hidden="true"
        >
          <span
            className={`font-mono font-black tracking-tight text-amber-200 tabular-nums drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)] ${
              reducedMotion ? 'text-xl' : 'text-2xl'
            }`}
            style={{ textShadow: reducedMotion ? 'none' : '0 0 12px rgba(251, 191, 36, 0.45)' }}
          >
            +{visiblePop.points}
          </span>
        </div>
      )}

      {visibleToast && (
        <div
          key={visibleToast.id}
          className={`pointer-events-none absolute top-[7.5rem] left-1/2 z-30 ${
            reducedMotion ? 'streak-toast-static' : 'animate-streak-toast'
          }`}
          aria-live="polite"
        >
          <div className="rounded-full border border-orange-300/35 bg-slate-950/78 px-4 py-1.5 text-sm font-semibold text-orange-100 shadow-lg backdrop-blur-md">
            {visibleToast.streak} 连击
          </div>
        </div>
      )}
    </>
  )
}
