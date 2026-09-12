import { Button } from '@/components/ui/button'
import type { ThrowKind } from '../utils/scoring'

const RESULT_COPY: Record<ThrowKind, { title: string; hint: string }> = {
  strike: { title: 'STRIKE', hint: '全倒' },
  spare: { title: 'SPARE', hint: '补中' },
  gutter: { title: 'GUTTER', hint: '洗沟' },
  open: { title: '击倒', hint: '继续' },
}

export function GyroPermissionDialog({
  onEnable,
  onSkip,
}: {
  onEnable: () => void
  onSkip: () => void
}) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-950 p-7 text-center text-white shadow-2xl">
        <div className="text-xs font-semibold tracking-[0.22em] text-amber-300/80 uppercase">
          Bowling lanes
        </div>
        <h2 className="mt-2 text-2xl font-black">启用陀螺仪瞄准</h2>
        <p className="mt-3 text-sm leading-6 text-white/60">
          左右倾斜手机即可瞄准球瓶。桌面端也可以用拖动和 A / D 键瞄准。
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button className="bg-amber-400 py-5 font-bold text-zinc-950 hover:bg-amber-300" onClick={onEnable}>
            立即启用
          </Button>
          <Button variant="ghost" className="text-white/60 hover:text-white" onClick={onSkip}>
            稍后再说
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ThrowResultOverlay({
  kind,
  knockedDown,
}: {
  kind: ThrowKind
  knockedDown: number
}) {
  const copy = RESULT_COPY[kind]
  return (
    <div className="pointer-events-none absolute inset-x-0 top-28 z-30 flex justify-center px-4">
      <div className="rounded-2xl border border-white/10 bg-black/70 px-8 py-4 text-center shadow-2xl backdrop-blur-md">
        <div className="text-xs tracking-[0.28em] text-amber-200/80 uppercase">{copy.hint}</div>
        <div className="mt-1 text-4xl font-black text-white">
          {kind === 'open' ? knockedDown : copy.title}
        </div>
        {kind === 'open' && <div className="mt-1 text-sm text-white/55">本球击倒 {knockedDown} 瓶</div>}
      </div>
    </div>
  )
}

export function GameOverOverlay({
  totalScore,
  onReplay,
}: {
  totalScore: number
  onReplay: () => void
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/65 p-4 backdrop-blur-[3px]">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-950 p-7 text-center text-white shadow-2xl">
        <div className="text-xs font-semibold tracking-[0.22em] text-amber-300/80 uppercase">
          Game over
        </div>
        <h2 className="mt-2 text-2xl font-black">十局结束</h2>
        <div className="mt-5 font-mono text-6xl font-black text-amber-300 tabular-nums">{totalScore}</div>
        <p className="mt-2 text-sm text-white/55">本局总分</p>
        <Button
          className="mt-6 w-full bg-amber-400 py-5 font-bold text-zinc-950 hover:bg-amber-300"
          onClick={onReplay}
        >
          再来一局
        </Button>
      </div>
    </div>
  )
}
