'use client'

import { Suspense, useState } from 'react'
import dynamic from 'next/dynamic'
import { GameRulesDialog } from '@/components/ui/game-rules-dialog'
import { cn } from '@/lib/helpers'
import { ShootingHistory } from './components/ShootingHistory'
import { ShootingSetup } from './components/ShootingSetup'
import { useCrosshairSettings } from './hooks/useCrosshairSettings'
import type { ShootingDifficulty, ShootingMapId, TrainingModeId } from './types'

const ShootingGame = dynamic(() => import('./components/ShootingGame'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-slate-950 text-cyan-100">
      正在装载射击场…
    </div>
  ),
})

export default function ShootingRangePage() {
  const [isStarted, setIsStarted] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [difficulty, setDifficulty] = useState<ShootingDifficulty>('easy')
  const [mapId, setMapId] = useState<ShootingMapId>('indoor')
  const [modeId, setModeId] = useState<TrainingModeId>('moving')
  const { config: crosshairConfig, updateConfig: updateCrosshair, resetConfig: resetCrosshair } =
    useCrosshairSettings()

  return (
    <main
      className={cn(
        'relative flex flex-col items-center overflow-hidden bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--primary)_8%,transparent),_transparent_38%)]',
        isStarted ? 'h-dvh p-0' : 'min-h-dvh p-3 sm:p-4'
      )}
    >
      <div className="absolute top-3 right-3 z-40 sm:top-4 sm:right-4">
        <GameRulesDialog
          title="战术射击场规则"
          rules={[
            '移动鼠标控制准星，点击左键射击',
            '不同训练模式有不同目标行为与得分规则',
            '可在设置中选择室内、户外或仓库场景',
            '训练结束后会自动保存到本地记录',
            '按 ESC 可释放鼠标并暂停操作',
            '精准度按命中次数与射击次数计算',
          ]}
        />
      </div>

      {!isStarted ? (
        showHistory ? (
          <ShootingHistory onClose={() => setShowHistory(false)} />
        ) : (
          <ShootingSetup
            difficulty={difficulty}
            mapId={mapId}
            modeId={modeId}
            onDifficultyChange={setDifficulty}
            onMapChange={setMapId}
            onModeChange={setModeId}
            onStart={() => setIsStarted(true)}
            onViewHistory={() => setShowHistory(true)}
            crosshairConfig={crosshairConfig}
            onCrosshairChange={updateCrosshair}
            onCrosshairReset={resetCrosshair}
          />
        )
      ) : (
        <div className="relative h-full min-h-0 w-full flex-1">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center bg-slate-950 text-cyan-100">
                加载游戏中…
              </div>
            }
          >
            <ShootingGame
              difficulty={difficulty}
              mapId={mapId}
              modeId={modeId}
              crosshairConfig={crosshairConfig}
              onCrosshairChange={updateCrosshair}
              onCrosshairReset={resetCrosshair}
              setGameStarted={setIsStarted}
              onViewHistory={() => {
                setIsStarted(false)
                setShowHistory(true)
              }}
            />
          </Suspense>
        </div>
      )}
    </main>
  )
}
