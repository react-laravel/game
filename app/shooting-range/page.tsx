'use client'

import { Suspense, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Crosshair, Gauge, MousePointer2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GameRulesDialog } from '@/components/ui/game-rules-dialog'

const ShootingGame = dynamic(() => import('./components/ShootingGame'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-2xl bg-slate-950 text-cyan-100">
      正在装载射击场…
    </div>
  ),
})

type Difficulty = 'easy' | 'medium' | 'hard'

const DIFFICULTIES: Array<{
  id: Difficulty
  name: string
  label: string
  detail: string
}> = [
  { id: 'easy', name: '新兵', label: '8 个目标', detail: '移动速度较慢，适合熟悉瞄准' },
  { id: 'medium', name: '精英', label: '12 个目标', detail: '目标更多，移动节奏明显加快' },
  { id: 'hard', name: '专家', label: '16 个目标', detail: '高机动目标，考验快速反应' },
]

export default function ShootingRangePage() {
  const [isStarted, setIsStarted] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')

  useEffect(() => {
    const preventSpacebarScroll = (event: KeyboardEvent) => {
      if (event.code === 'Space') event.preventDefault()
    }
    window.addEventListener('keydown', preventSpacebarScroll, { passive: false })
    return () => window.removeEventListener('keydown', preventSpacebarScroll)
  }, [])

  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-hidden bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--primary)_8%,transparent),_transparent_38%)] p-3 sm:p-4">
      <div className="absolute top-3 right-3 z-40 sm:top-4 sm:right-4">
        <GameRulesDialog
          title="战术射击场规则"
          rules={[
            '移动鼠标控制准星，点击左键射击',
            '击中一个目标可获得 10 分',
            '训练时间为 60 秒',
            '按 ESC 可释放鼠标并暂停操作',
            '精准度按命中次数与射击次数计算',
          ]}
        />
      </div>

      {!isStarted ? (
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
                  {DIFFICULTIES.map(option => {
                    const selected = difficulty === option.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setDifficulty(option.id)}
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
                          {option.id === 'easy' ? '01' : option.id === 'medium' ? '02' : '03'}
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

                <Button className="mt-7 w-full py-6 text-base font-bold" onClick={() => setIsStarted(true)}>
                  进入射击场
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="relative min-h-[520px] w-full max-w-[1600px] flex-1">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center rounded-2xl bg-slate-950 text-cyan-100">
                加载游戏中…
              </div>
            }
          >
            <ShootingGame difficulty={difficulty} setGameStarted={setIsStarted} />
          </Suspense>
        </div>
      )}
    </main>
  )
}
