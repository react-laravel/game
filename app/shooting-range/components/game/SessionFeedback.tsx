'use client'

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
  const isHeadshot = hitPulse?.hitZone === 'head'

  return (
    <>
      {hitPulse && (
        <div
          key={hitPulse.id}
          className={`pointer-events-none absolute top-[42%] left-1/2 z-30 ${
            reducedMotion
              ? isHeadshot
                ? 'headshot-pop-static'
                : 'score-pop-static'
              : isHeadshot
                ? 'animate-headshot-pop'
                : 'animate-score-pop'
          }`}
          aria-live={isHeadshot ? 'polite' : undefined}
          aria-label={isHeadshot ? `爆头，加 ${hitPulse.points} 分` : undefined}
          aria-hidden={isHeadshot ? undefined : 'true'}
        >
          <div className="flex flex-col items-center">
            <span
              className={`font-mono font-black tracking-tight tabular-nums drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)] ${
                isHeadshot
                  ? reducedMotion
                    ? 'text-2xl text-rose-100'
                    : 'text-3xl text-rose-50'
                  : reducedMotion
                    ? 'text-xl text-amber-200'
                    : 'text-2xl text-amber-200'
              }`}
              style={{
                textShadow: reducedMotion
                  ? 'none'
                  : isHeadshot
                    ? '0 0 16px rgba(251, 113, 133, 0.55), 0 0 6px rgba(254, 240, 138, 0.35)'
                    : '0 0 12px rgba(251, 191, 36, 0.45)',
              }}
            >
              +{hitPulse.points}
            </span>
            {isHeadshot ? (
              <span className="mt-1 rounded-full border border-rose-300/55 bg-rose-950/88 px-3 py-0.5 text-xs font-bold tracking-[0.14em] text-rose-50 shadow-[0_0_18px_rgba(244,63,94,0.35)]">
                爆头!
              </span>
            ) : (
              hitPulse.zoneLabel && (
                <span className="mt-0.5 text-[11px] font-semibold tracking-wide text-cyan-100/85">
                  {hitPulse.zoneLabel}
                </span>
              )
            )}
          </div>
        </div>
      )}

      {streakToast && (
        <div
          key={streakToast.id}
          className={`pointer-events-none absolute top-[7.5rem] left-1/2 z-30 ${
            reducedMotion ? 'streak-toast-static' : 'animate-streak-toast'
          }`}
          aria-live="polite"
        >
          <div className="rounded-full border border-orange-300/35 bg-slate-950/78 px-4 py-1.5 text-sm font-semibold text-orange-100 shadow-lg backdrop-blur-md">
            {streakToast.streak} 连击
          </div>
        </div>
      )}
    </>
  )
}
