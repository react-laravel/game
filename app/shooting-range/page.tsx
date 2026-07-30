'use client'

import { Suspense, useState } from 'react'
import dynamic from 'next/dynamic'
import { GameRulesDialog } from '@/components/ui/game-rules-dialog'
import { ShootingSetup } from './components/ShootingSetup'
import type { ShootingDifficulty } from './types'

const ShootingGame = dynamic(() => import('./components/ShootingGame'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-2xl bg-slate-950 text-cyan-100">
      正在装载射击场…
    </div>
  ),
})

export default function ShootingRangePage() {
  const [isStarted, setIsStarted] = useState(false)
  const [difficulty, setDifficulty] = useState<ShootingDifficulty>('easy')

  return (
    <main
      className={`relative flex flex-col items-center overflow-hidden bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--primary)_8%,transparent),_transparent_38%)] p-3 sm:p-4 ${
        isStarted ? 'h-dvh' : 'min-h-dvh'
      }`}
    >
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
        <ShootingSetup
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          onStart={() => setIsStarted(true)}
        />
      ) : (
        <div className="relative h-full min-h-0 w-full max-w-[1600px] flex-1">
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
