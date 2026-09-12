'use client'

import { TOTAL_FRAMES } from '../utils/scoring'
import type { FrameScore } from '../utils/scoring'

interface BowlingScorecardProps {
  frames: FrameScore[]
  currentFrame: number
  totalScore: number
  gameFinished: boolean
}

export function BowlingScorecard({
  frames,
  currentFrame,
  totalScore,
  gameFinished,
}: BowlingScorecardProps) {
  return (
    <div className="pointer-events-none w-full max-w-4xl">
      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] tracking-[0.22em] text-amber-200/70 uppercase">总分</span>
          <span className="font-mono text-2xl font-black text-white tabular-nums">{totalScore}</span>
        </div>
        <div className="text-xs text-white/55">{gameFinished ? '十局结束' : `第 ${currentFrame} 局`}</div>
      </div>
      <div className="overflow-x-auto">
        <div className="grid min-w-[640px] grid-cols-10 overflow-hidden rounded-xl border border-white/10 bg-black/45 backdrop-blur-md">
          {frames.map((frame, index) => {
            const active = !gameFinished && index === currentFrame - 1
            const tenth = index === TOTAL_FRAMES - 1
            return (
              <div
                key={index}
                className={`border-white/10 ${index > 0 ? 'border-l' : ''} ${
                  active ? 'bg-amber-400/15' : ''
                }`}
              >
                <div className="border-b border-white/10 py-1 text-center text-[10px] tracking-wider text-white/50">
                  {index + 1}
                </div>
                <div className={`grid h-8 ${tenth ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {frame.marks.map((mark, markIndex) => (
                    <div
                      key={`${index}-${markIndex}`}
                      className={`flex items-center justify-center border-white/10 font-mono text-sm text-white ${
                        markIndex > 0 ? 'border-l' : ''
                      }`}
                    >
                      {mark}
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 py-1 text-center font-mono text-sm text-amber-100 tabular-nums">
                  {frame.cumulative ?? ''}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
