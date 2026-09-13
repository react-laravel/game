'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { GameRulesDialog } from '@/components/ui/game-rules-dialog'
import { cn } from '@/lib/helpers'
import { ShootingHistory } from './components/ShootingHistory'
import { ShootingSetup } from './components/ShootingSetup'
import { useCrosshairSettings } from './hooks/useCrosshairSettings'
import type { DrillPreset } from './utils/drillPresets'
import { setShootingSfxSettings } from './utils/audioUtils'
import { loadLastConfig, saveLastConfig } from './utils/lastConfigStorage'
import { DEFAULT_LOOK_SENSITIVITY } from './utils/lookSensitivity'
import { DEFAULT_SFX_VOLUME } from './utils/sfxVolume'
import type { ShootingDifficulty, ShootingMapId, TargetShape, TrainingModeId } from './types'
import { DEFAULT_TARGET_SHAPE, normalizeTargetShape } from './utils/targetShape'

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
  const [highlightLatestSession, setHighlightLatestSession] = useState(false)
  const [difficulty, setDifficulty] = useState<ShootingDifficulty>(
    () => loadLastConfig()?.difficulty ?? 'medium'
  )
  const [mapId, setMapId] = useState<ShootingMapId>(() => loadLastConfig()?.mapId ?? 'indoor')
  const [modeId, setModeId] = useState<TrainingModeId>(
    () => loadLastConfig()?.modeId ?? 'moving'
  )
  const [lookSensitivity, setLookSensitivity] = useState(
    () => loadLastConfig()?.lookSensitivity ?? DEFAULT_LOOK_SENSITIVITY
  )
  const [sfxVolume, setSfxVolume] = useState(
    () => loadLastConfig()?.sfxVolume ?? DEFAULT_SFX_VOLUME
  )
  const [sfxMuted, setSfxMuted] = useState(() => loadLastConfig()?.sfxMuted ?? false)
  const [targetShape, setTargetShape] = useState<TargetShape>(
    () => normalizeTargetShape(loadLastConfig()?.targetShape ?? DEFAULT_TARGET_SHAPE)
  )
  const {
    config: crosshairConfig,
    updateConfig: updateCrosshair,
    resetConfig: resetCrosshair,
    applyConfig: applyCrosshair,
  } = useCrosshairSettings()

  useEffect(() => {
    setShootingSfxSettings({ volume: sfxVolume, muted: sfxMuted })
  }, [sfxMuted, sfxVolume])

  const persistConfig = useCallback(
    (
      next: {
        difficulty: ShootingDifficulty
        mapId: ShootingMapId
        modeId: TrainingModeId
        lookSensitivity: number
        sfxVolume: number
        sfxMuted: boolean
        targetShape: TargetShape
      },
      drillId?: string
    ) => {
      saveLastConfig(
        {
          difficulty: next.difficulty,
          mapId: next.mapId,
          modeId: next.modeId,
          lookSensitivity: next.lookSensitivity,
          sfxVolume: next.sfxVolume,
          sfxMuted: next.sfxMuted,
          targetShape: next.targetShape,
        },
        drillId
      )
    },
    []
  )

  const applyPreset = useCallback((preset: DrillPreset) => {
    setDifficulty(preset.difficulty)
    setMapId(preset.mapId)
    setModeId(preset.modeId)
    persistConfig({ ...preset, lookSensitivity, sfxVolume, sfxMuted, targetShape }, preset.id)
  }, [lookSensitivity, persistConfig, sfxMuted, sfxVolume, targetShape])

  const handleQuickStart = useCallback(
    (preset: DrillPreset) => {
      applyPreset(preset)
      setIsStarted(true)
    },
    [applyPreset]
  )

  const handleLookSensitivityChange = useCallback(
    (value: number) => {
      setLookSensitivity(value)
      persistConfig({ difficulty, mapId, modeId, lookSensitivity: value, sfxVolume, sfxMuted, targetShape })
    },
    [difficulty, mapId, modeId, persistConfig, sfxMuted, sfxVolume, targetShape]
  )

  const handleSfxVolumeChange = useCallback(
    (value: number) => {
      setSfxVolume(value)
      persistConfig({ difficulty, mapId, modeId, lookSensitivity, sfxVolume: value, sfxMuted, targetShape })
    },
    [difficulty, mapId, modeId, lookSensitivity, persistConfig, sfxMuted, targetShape]
  )

  const handleSfxMutedChange = useCallback(
    (muted: boolean) => {
      setSfxMuted(muted)
      persistConfig({ difficulty, mapId, modeId, lookSensitivity, sfxVolume, sfxMuted: muted, targetShape })
    },
    [difficulty, mapId, modeId, lookSensitivity, persistConfig, sfxVolume, targetShape]
  )

  const handleTargetShapeChange = useCallback(
    (value: TargetShape) => {
      setTargetShape(value)
      persistConfig({ difficulty, mapId, modeId, lookSensitivity, sfxVolume, sfxMuted, targetShape: value })
    },
    [difficulty, mapId, modeId, lookSensitivity, persistConfig, sfxMuted, sfxVolume]
  )

  const handleStart = useCallback(() => {
    persistConfig({ difficulty, mapId, modeId, lookSensitivity, sfxVolume, sfxMuted, targetShape })
    setIsStarted(true)
  }, [difficulty, lookSensitivity, mapId, modeId, persistConfig, sfxMuted, sfxVolume, targetShape])

  const handleReturnToSetup = useCallback(() => {
    setIsStarted(false)
  }, [])

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
            '点击训练卡片可一键开始专项训练',
            '移动鼠标控制准星，点击左键射击',
            '不同训练模式有不同目标行为与评分标准',
            '训练结束后会显示评级并自动保存到本地',
            '按 ESC 可释放鼠标并暂停操作',
          ]}
        />
      </div>

      {!isStarted ? (
        showHistory ? (
          <ShootingHistory
            highlightLatestSession={highlightLatestSession}
            onClose={() => {
              setShowHistory(false)
              setHighlightLatestSession(false)
            }}
          />
        ) : (
          <ShootingSetup
            difficulty={difficulty}
            mapId={mapId}
            modeId={modeId}
            lookSensitivity={lookSensitivity}
            sfxVolume={sfxVolume}
            sfxMuted={sfxMuted}
            onDifficultyChange={setDifficulty}
            onMapChange={setMapId}
            onModeChange={setModeId}
            onLookSensitivityChange={handleLookSensitivityChange}
            onSfxVolumeChange={handleSfxVolumeChange}
            onSfxMutedChange={handleSfxMutedChange}
            targetShape={targetShape}
            onTargetShapeChange={handleTargetShapeChange}
            onStart={handleStart}
            onQuickStart={handleQuickStart}
            onViewHistory={() => {
              setHighlightLatestSession(false)
              setShowHistory(true)
            }}
            crosshairConfig={crosshairConfig}
            onCrosshairApply={applyCrosshair}
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
              targetShape={targetShape}
              onTargetShapeChange={handleTargetShapeChange}
              lookSensitivity={lookSensitivity}
              sfxVolume={sfxVolume}
              sfxMuted={sfxMuted}
              onLookSensitivityChange={handleLookSensitivityChange}
              onSfxVolumeChange={handleSfxVolumeChange}
              onSfxMutedChange={handleSfxMutedChange}
              crosshairConfig={crosshairConfig}
              onCrosshairChange={updateCrosshair}
              onCrosshairReset={resetCrosshair}
              onCrosshairApply={applyCrosshair}
              setGameStarted={setIsStarted}
              onViewHistory={() => {
                setIsStarted(false)
                setHighlightLatestSession(true)
                setShowHistory(true)
              }}
              onChangeDrill={handleReturnToSetup}
            />
          </Suspense>
        </div>
      )}
    </main>
  )
}
