import { Crosshair, Gauge, MousePointer2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { ShootingDifficulty } from '../types'

const DIFFICULTIES: Array<{
  id: ShootingDifficulty
  name: string
  label: string
  detail: string
}> = [
  { id: 'easy', name: '新兵', label: '8 个目标', detail: '移动速度较慢，适合熟悉瞄准' },
  { id: 'medium', name: '精英', label: '12 个目标', detail: '目标更多，移动节奏明显加快' },
  { id: 'hard', name: '专家', label: '16 个目标', detail: '高机动目标，考验快速反应' },
]

interface ShootingSetupProps {
  difficulty: ShootingDifficulty
  onDifficultyChange: (difficulty: ShootingDifficulty) => void
  onStart: () => void
}

export function ShootingSetup({
  difficulty,
  onDifficultyChange,
  onStart,
}: ShootingSetupProps) {
  return (
    <div className="flex w-full flex-1 items-center justify-center pb-10">
      <Card className="border-border/70 relative w-full max-w-3xl overflow-hidden p-0 shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-amber-400 to-cyan-400" />
        <div className="grid md:grid-cols-[0.9fr_1.5fr]">
          <div className="relative overflow-hidden bg-slate-950 p-7 text-white sm:p-9">
            <div className="absolute -top-20 -left-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 ring-1 ring-cyan-200/20">
                <Crosshair className="h-7 w-7 text-cyan-200" />
              </div>
              <p className="mt-7 text-xs font-bold tracking-[0.24em] text-amber-300 uppercase">
                Tactical range
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">精准反应训练</h1>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                在 60 秒内追踪移动靶，稳定命中并提升射击精准度。
              </p>
              <div className="mt-8 space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <MousePointer2 className="h-4 w-4 text-cyan-300" />
                  鼠标瞄准与射击
                </div>
                <div className="flex items-center gap-3">
                  <Gauge className="h-4 w-4 text-cyan-300" />
                  实时命中率统计
                </div>
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                  动态无人靶训练
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card p-7 sm:p-9">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-primary text-xs font-bold tracking-[0.18em] uppercase">
                  训练配置
                </p>
                <h2 className="mt-1 text-2xl font-bold">选择难度</h2>
              </div>
              <span className="text-muted-foreground text-xs">可随时返回调整</span>
            </div>

            <div className="mt-6 space-y-3">
              {DIFFICULTIES.map((option, index) => {
                const selected = difficulty === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onDifficultyChange(option.id)}
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                      selected
                        ? 'border-primary bg-primary/7 shadow-sm ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/40 hover:bg-muted/40'
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black ${
                        selected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="font-bold">{option.name}</span>
                        <span className="text-muted-foreground text-xs">{option.label}</span>
                      </span>
                      <span className="text-muted-foreground mt-1 block text-xs">
                        {option.detail}
                      </span>
                    </span>
                    <span
                      className={`h-3 w-3 rounded-full border-2 ${
                        selected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                      }`}
                    />
                  </button>
                )
              })}
            </div>

            <Button className="mt-7 w-full py-6 text-base font-bold" onClick={onStart}>
              进入射击场
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
