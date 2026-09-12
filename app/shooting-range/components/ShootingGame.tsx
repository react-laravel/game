'use client'

import { useCallback, useEffect, useRef } from 'react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { primeShootingAudio } from '../utils/audioUtils'
import { useFpsMeter } from '../hooks/useFpsMeter'
import { usePointerLock } from '../hooks/usePointerLock'
import { useShootingDebugBridge } from '../hooks/useShootingDebugBridge'
import { useShootingSession } from '../hooks/useShootingSession'
import type { ShootingDifficulty, ShootingMapId, TrainingModeId } from '../types'
import { Crosshair } from './game/Crosshair'
import { GameUI } from './game/GameUI'
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
  setGameStarted?: (started: boolean) => void
  onViewHistory?: () => void
}

export default function ShootingGame({
  difficulty,
  mapId,
  modeId,
  setGameStarted,
  onViewHistory,
}: ShootingGameProps) {
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
    sessionStats,
    recordShot,
    showHitFeedback,
    beginTraining,
    restartTraining,
    returnToSettings,
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
    }

    window.addEventListener('keydown', handleKeyDown, { passive: false })
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameOver, gameStarted, startGame])

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

      {gameStarted && !gameOver && isPointerLocked && <Crosshair hit={hitMarker} />}

      {gameStarted && (
        <Button
          variant="ghost"
          className="absolute top-5 left-5 z-40 border border-white/10 bg-slate-950/70 text-white shadow-xl backdrop-blur-md hover:bg-slate-900 hover:text-white"
          onClick={handleBackToSettings}
        >
          <LogOut className="h-4 w-4" />
          结束训练
        </Button>
      )}

      <GameUI
        stats={sessionStats}
        timeLeft={timeLeft}
        durationSeconds={durationSeconds}
        displayFps={displayFps}
        gameOver={gameOver}
        onRestart={handleRestart}
        onViewHistory={onViewHistory}
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
    </div>
  )
}
