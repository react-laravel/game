import type { SessionStats } from '../../types'

interface GameUIProps {
  stats: SessionStats
  timeLeft: number
  durationSeconds: number
  displayFps: number
  gameOver: boolean
  onRestart: () => void
  onViewHistory?: () => void
}

export function GameUI({
  stats,
  timeLeft,
  durationSeconds,
  displayFps,
  gameOver,
  onRestart,
  onViewHistory,
}: GameUIProps) {
  const { score, hits, misses, shots, accuracy, shotsPerMinute, bestStreak, avgReactionMs } = stats
  const timePercent = Math.max(0, Math.min(100, (timeLeft / durationSeconds) * 100))

  return (
    <div className="pointer-events-none absolute inset-0 z-20 text-white">
      <div className="absolute top-4 right-4 flex flex-wrap justify-end gap-2 sm:top-5 sm:right-5">
        <div className="rounded-xl border border-white/10 bg-slate-950/72 px-3 py-2 shadow-xl backdrop-blur-md">
          <div className="text-[10px] font-semibold tracking-[0.18em] text-emerald-200/70 uppercase">
            FPS
          </div>
          <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums">{displayFps}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/72 px-4 py-2 shadow-xl backdrop-blur-md">
          <div className="text-[10px] font-semibold tracking-[0.18em] text-cyan-200/70 uppercase">
            命中 / 射击
          </div>
          <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums">
            {hits} <span className="text-white/30">/</span> {shots}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/72 px-4 py-2 shadow-xl backdrop-blur-md">
          <div className="text-[10px] font-semibold tracking-[0.18em] text-cyan-200/70 uppercase">
            精准度
          </div>
          <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums">{accuracy}%</div>
        </div>
        <div className="hidden rounded-xl border border-white/10 bg-slate-950/72 px-4 py-2 shadow-xl backdrop-blur-md sm:block">
          <div className="text-[10px] font-semibold tracking-[0.18em] text-amber-200/75 uppercase">
            射速
          </div>
          <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums">
            {shotsPerMinute}/分
          </div>
        </div>
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
            {bestStreak > 0 && (
              <>
                <div className="mb-1 h-7 w-px bg-white/10" />
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.18em] text-orange-200/75 uppercase">
                    连击
                  </div>
                  <div className="font-mono text-lg font-semibold tabular-nums">{bestStreak}</div>
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

      {gameOver && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-slate-950/78 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-7 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/15 text-2xl text-amber-300">
              ◎
            </div>
            <div className="text-xs font-semibold tracking-[0.22em] text-cyan-200/65 uppercase">
              训练结束
            </div>
            <h2 className="mt-2 text-3xl font-black">{score} 分</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-left text-sm">
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
              {onViewHistory && (
                <button
                  className="w-full rounded-xl border border-white/15 px-4 py-3 font-semibold text-white/80 transition-colors hover:bg-white/5"
                  onClick={onViewHistory}
                >
                  查看训练记录
                </button>
              )}
            </div>
          </div>
        </div>
      )}
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
