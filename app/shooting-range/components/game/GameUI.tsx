import type { PersonalBestComparison, SessionGrade } from '../../utils/sessionInsights'
import { gradeColor } from '../../utils/sessionInsights'
import type { SessionStats, TrainingModeId } from '../../types'
import { trainingModes } from '../../utils/trainingModes'

interface GameUIProps {
  stats: SessionStats
  timeLeft: number
  durationSeconds: number
  displayFps: number
  gameOver: boolean
  modeId: TrainingModeId
  drillLabel: string
  grade: SessionGrade | null
  comparison: PersonalBestComparison | null
  onRestart: () => void
  onViewHistory?: () => void
  onChangeDrill?: () => void
}

export function GameUI({
  stats,
  timeLeft,
  durationSeconds,
  displayFps,
  gameOver,
  modeId,
  drillLabel,
  grade,
  comparison,
  onRestart,
  onViewHistory,
  onChangeDrill,
}: GameUIProps) {
  const { score, hits, misses, shots, accuracy, shotsPerMinute, bestStreak, avgReactionMs } = stats
  const timePercent = Math.max(0, Math.min(100, (timeLeft / durationSeconds) * 100))
  const mode = trainingModes[modeId]
  const showReaction = modeId === 'flick' || modeId === 'precision'

  return (
    <div className="pointer-events-none absolute inset-0 z-20 text-white">
      <div className="absolute top-4 left-4 hidden rounded-xl border border-white/10 bg-slate-950/72 px-3 py-2 shadow-xl backdrop-blur-md sm:block">
        <div className="text-[10px] font-semibold tracking-[0.16em] text-cyan-200/70 uppercase">
          {mode.focus}
        </div>
        <div className="mt-0.5 text-sm font-semibold">{drillLabel}</div>
      </div>

      <div className="absolute top-4 right-4 flex flex-wrap justify-end gap-2 sm:top-5 sm:right-5">
        <HudStat label="FPS" value={`${displayFps}`} accent="emerald" />
        <HudStat label="命中 / 射击" value={`${hits} / ${shots}`} />
        <HudStat label="精准度" value={`${accuracy}%`} />
        <HudStat label="射速" value={`${shotsPerMinute}/分`} accent="amber" className="hidden sm:flex" />
        {showReaction && avgReactionMs !== null && (
          <HudStat label="反应" value={`${avgReactionMs}ms`} accent="rose" className="hidden md:flex" />
        )}
      </div>

      <div className="absolute top-4 left-1/2 w-44 -translate-x-1/2 sm:top-5 sm:w-56">
        <div className="rounded-xl border border-white/10 bg-slate-950/72 px-4 py-2 text-center shadow-xl backdrop-blur-md">
          <div className="flex items-end justify-center gap-3">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.18em] text-amber-200/75 uppercase">
                得分
              </div>
              <div className="font-mono text-2xl font-black tracking-tight tabular-nums">{score}</div>
            </div>
            <div className="mb-1 h-7 w-px bg-white/10" />
            <div>
              <div className="text-[10px] font-semibold tracking-[0.18em] text-cyan-200/70 uppercase">
                剩余
              </div>
              <div className="font-mono text-lg font-semibold tabular-nums">{timeLeft.toFixed(0)}s</div>
            </div>
            {bestStreak > 1 && (
              <>
                <div className="mb-1 h-7 w-px bg-white/10" />
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.18em] text-orange-200/75 uppercase">
                    连击
                  </div>
                  <div className="font-mono text-lg font-semibold tabular-nums text-orange-200">
                    {bestStreak}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-cyan-300 transition-[width] duration-500"
              style={{ width: `${timePercent}%` }}
            />
          </div>
        </div>
      </div>

      {!gameOver && (
        <div className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/55 px-4 py-1.5 text-xs text-white/55 backdrop-blur sm:block">
          移动鼠标瞄准 · 左键射击 · ESC 释放鼠标
        </div>
      )}

      {gameOver && grade && comparison && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/95 p-7 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold tracking-[0.2em] text-cyan-200/65 uppercase">
                  训练完成
                </div>
                <h2 className="mt-1 text-xl font-bold">{drillLabel}</h2>
                <p className="text-muted-foreground mt-0.5 text-sm">{mode.name}</p>
              </div>
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-4xl font-black ${gradeColor(grade)}`}
              >
                {grade}
              </div>
            </div>

            <div className="mt-5 text-center">
              <div className="font-mono text-5xl font-black tracking-tight tabular-nums">{score}</div>
              <div className="text-muted-foreground mt-1 text-sm">本场得分</div>
            </div>

            {comparison.isNewBest && (
              <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-center text-sm font-semibold text-amber-200">
                新纪录！模式最佳成绩
              </div>
            )}

            {comparison.previous && !comparison.isNewBest && comparison.scoreDelta !== null && (
              <div className="mt-4 rounded-xl border border-white/8 bg-white/4 px-4 py-2 text-center text-sm text-white/70">
                较个人最佳 {comparison.scoreDelta >= 0 ? '+' : ''}{comparison.scoreDelta} 分
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2 text-left text-sm sm:grid-cols-3">
              <SummaryItem label="命中" value={`${hits}`} />
              <SummaryItem label="未命中" value={`${misses}`} />
              <SummaryItem label="精准度" value={`${accuracy}%`} />
              <SummaryItem label="射速" value={`${shotsPerMinute}/分`} />
              <SummaryItem label="最高连击" value={`${bestStreak}`} />
              <SummaryItem
                label="平均反应"
                value={avgReactionMs !== null ? `${avgReactionMs}ms` : '—'}
              />
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                className="w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 transition-colors hover:bg-amber-300"
                onClick={onRestart}
              >
                再来一局
              </button>
              <div className="grid grid-cols-2 gap-2">
                {onChangeDrill && (
                  <button
                    className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/5"
                    onClick={onChangeDrill}
                  >
                    换训练项
                  </button>
                )}
                {onViewHistory && (
                  <button
                    className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/5"
                    onClick={onViewHistory}
                  >
                    查看进步
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function HudStat({
  label,
  value,
  accent,
  className = '',
}: {
  label: string
  value: string
  accent?: 'emerald' | 'amber' | 'rose'
  className?: string
}) {
  const accentClass =
    accent === 'emerald'
      ? 'text-emerald-200/70'
      : accent === 'amber'
        ? 'text-amber-200/75'
        : accent === 'rose'
          ? 'text-rose-200/70'
          : 'text-cyan-200/70'

  return (
    <div
      className={`rounded-xl border border-white/10 bg-slate-950/72 px-3 py-2 shadow-xl backdrop-blur-md ${className}`}
    >
      <div className={`text-[10px] font-semibold tracking-[0.18em] uppercase ${accentClass}`}>
        {label}
      </div>
      <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums">{value}</div>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/4 px-3 py-2">
      <div className="text-[10px] tracking-[0.14em] text-white/45 uppercase">{label}</div>
      <div className="mt-0.5 font-mono text-base font-semibold tabular-nums">{value}</div>
    </div>
  )
}
