'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LogOut, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { primeShootingAudio } from '../utils/audioUtils'
import { useFpsMeter } from '../hooks/useFpsMeter'
import { usePointerLock } from '../hooks/usePointerLock'
import { useShootingDebugBridge } from '../hooks/useShootingDebugBridge'
import { useShootingSession } from '../hooks/useShootingSession'
import type { CrosshairConfig } from '../utils/crosshairConfig'
import { drillLabelForConfig } from '../utils/drillPresets'
import {
  compareToPersonalBest,
  computeSessionGrade,
} from '../utils/sessionInsights'
import { loadSessionHistory } from '../utils/statsStorage'
import type { ShootingDifficulty, ShootingMapId, TrainingModeId } from '../types'
import { CrosshairSettings } from './CrosshairSettings'
import { Crosshair } from './game/Crosshair'
import { GameUI } from './game/GameUI'
import { SessionFeedback } from './game/SessionFeedback'
import type { ShootingSceneSnapshot } from './game/GameScene'
import { ShootingGameCanvas } from './ShootingGameCanvas'
import {
  ShootingPointerLockError,
  ShootingReadyOverlay,
  UnsupportedShootingDevice,
} from './ShootingGameOverlays'

interface ShootingGameProps {
  difficulty: ShootingDifficulty
  mapId: ShootingMapId
  modeId: TrainingModeId
  crosshairConfig: CrosshairConfig
  onCrosshairChange: (patch: Partial<CrosshairConfig>) => void
  onCrosshairReset: () => void
  setGameStarted?: (started: boolean) => void
  onViewHistory?: () => void
  onChangeDrill?: () => void
}

export default function ShootingGame({
  difficulty,
  mapId,
  modeId,
  crosshairConfig,
  onCrosshairChange,
  onCrosshairReset,
  setGameStarted,
  onViewHistory,
  onChangeDrill,
}: ShootingGameProps) {
  const [showCrosshairSettings, setShowCrosshairSettings] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneSnapshot = useRef<ShootingSceneSnapshot>({
    camera: { yaw: 0, pitch: 0 },
    targets: [],
  })
  const config = { difficulty, mapId, modeId }
  const { displayFps, reportFps } = useFpsMeter()
  const {
    timeLeft,
    durationSeconds,
    gameOver,
    gameStarted,
    showStartOverlay,
    hitMarker,
    hitPulse,
    streakToast,
    sessionStats,
    recordShot,
    showHitFeedback,
    beginTraining,
    restartTraining,
    returnToSettings,
    endSessionEarly,
    injectSessionStats,
  } = useShootingSession(config, setGameStarted)
  const {
    browserSupport,
    pointerLockError,
    isPointerLocked,
    requestPointerLock,
    enableFallbackControls,
    releasePointerLock,
  } = usePointerLock(canvasRef)

  const needsPointerLock =
    gameStarted &&
    !gameOver &&
    !browserSupport.useFallback &&
    !isPointerLocked &&
    !pointerLockError

  useShootingDebugBridge({
    canvasRef,
    sceneSnapshot,
    difficulty,
    mapId,
    modeId,
    gameOver,
    gameStarted,
    stats: sessionStats,
    timeLeft,
    onEndSession: endSessionEarly,
    onInjectStats: injectSessionStats,
  })

  const startGame = useCallback(() => {
    primeShootingAudio()
    beginTraining()
    requestPointerLock()
  }, [beginTraining, requestPointerLock])

  const resumePointerLock = useCallback(() => {
    requestPointerLock()
  }, [requestPointerLock])

  const handleShotResult = useCallback(
    (didHit: boolean, reactionMs?: number) => {
      recordShot(didHit, reactionMs)
    },
    [recordShot]
  )

  const handleRestart = useCallback(() => {
    restartTraining()
    requestPointerLock()
  }, [requestPointerLock, restartTraining])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') event.preventDefault()
      if (
        (event.code === 'Enter' || event.code === 'Space') &&
        !gameStarted &&
        !gameOver
      ) {
        event.preventDefault()
        startGame()
      }
      if (
        (event.code === 'Enter' || event.code === 'Space') &&
        needsPointerLock &&
        !showStartOverlay &&
        !pointerLockError
      ) {
        event.preventDefault()
        resumePointerLock()
      }
    }

    window.addEventListener('keydown', handleKeyDown, { passive: false })
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    gameOver,
    gameStarted,
    needsPointerLock,
    pointerLockError,
    resumePointerLock,
    showStartOverlay,
    startGame,
  ])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || browserSupport.useFallback) return

    const handleCanvasClick = () => {
      if (gameStarted && !gameOver && !isPointerLocked) {
        requestPointerLock()
      }
    }

    canvas.addEventListener('click', handleCanvasClick)
    return () => canvas.removeEventListener('click', handleCanvasClick)
  }, [
    browserSupport.useFallback,
    gameOver,
    gameStarted,
    isPointerLocked,
    requestPointerLock,
  ])

  const handleBackToSettings = useCallback(() => {
    releasePointerLock()
    returnToSettings()
  }, [releasePointerLock, returnToSettings])

  const drillLabel = drillLabelForConfig(modeId, mapId, difficulty)
  const sessionGrade = useMemo(
    () => (gameOver ? computeSessionGrade(sessionStats, modeId) : null),
    [gameOver, modeId, sessionStats]
  )
  const personalBestComparison = useMemo(
    () =>
      gameOver ? compareToPersonalBest(sessionStats, modeId, loadSessionHistory()) : null,
    [gameOver, modeId, sessionStats]
  )

  if (!browserSupport.supported && !browserSupport.useFallback) {
    return <UnsupportedShootingDevice message={browserSupport.message} />
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-slate-950 shadow-2xl ring-1 ring-white/10">
      <ShootingGameCanvas
        canvasRef={canvasRef}
        sceneSnapshot={sceneSnapshot}
        difficulty={difficulty}
        mapId={mapId}
        modeId={modeId}
        gameStarted={gameStarted}
        gameOver={gameOver}
        useFallbackControls={browserSupport.useFallback}
        onShotResult={handleShotResult}
        onHitFeedback={showHitFeedback}
        onFpsReport={reportFps}
      />

      {gameStarted && !gameOver && isPointerLocked && (
        <>
          <Crosshair config={crosshairConfig} hit={hitMarker} />
          <SessionFeedback hitPulse={hitPulse} streakToast={streakToast} />
        </>
      )}

      {gameStarted && !gameOver && browserSupport.useFallback && (
        <SessionFeedback hitPulse={hitPulse} streakToast={streakToast} />
      )}

      {gameStarted && (
        <div className="absolute top-5 left-5 z-40 flex gap-2">
          <Button
            variant="ghost"
            className="border border-white/10 bg-slate-950/70 text-white shadow-xl backdrop-blur-md hover:bg-slate-900 hover:text-white"
            onClick={handleBackToSettings}
          >
            <LogOut className="h-4 w-4" />
            结束训练
          </Button>
          <Button
            variant="ghost"
            className="border border-white/10 bg-slate-950/70 text-white shadow-xl backdrop-blur-md hover:bg-slate-900 hover:text-white"
            onClick={() => {
              releasePointerLock()
              setShowCrosshairSettings(true)
            }}
            aria-label="准星设置"
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <GameUI
        stats={sessionStats}
        timeLeft={timeLeft}
        durationSeconds={durationSeconds}
        displayFps={displayFps}
        gameOver={gameOver}
        modeId={modeId}
        drillLabel={drillLabel}
        grade={sessionGrade}
        comparison={personalBestComparison}
        onRestart={handleRestart}
        onViewHistory={onViewHistory}
        onChangeDrill={onChangeDrill}
      />

      {showStartOverlay && !gameOver && !pointerLockError && (
        <ShootingReadyOverlay onStart={startGame} />
      )}

      {needsPointerLock && !showStartOverlay && (
        <ShootingReadyOverlay onStart={resumePointerLock} resume />
      )}

      {pointerLockError && (
        <ShootingPointerLockError
          message={pointerLockError}
          onRetry={resumePointerLock}
          onFallback={enableFallbackControls}
        />
      )}

      {showCrosshairSettings && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-card p-6 shadow-2xl">
            <CrosshairSettings
              compact
              config={crosshairConfig}
              onChange={onCrosshairChange}
              onReset={onCrosshairReset}
            />
            <Button
              className="mt-6 w-full"
              onClick={() => {
                setShowCrosshairSettings(false)
                if (gameStarted && !gameOver) requestPointerLock()
              }}
            >
              保存并继续
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
