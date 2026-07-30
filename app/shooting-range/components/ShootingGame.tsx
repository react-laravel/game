'use client'

import { useCallback, useEffect, useRef } from 'react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { primeShootingAudio } from '../utils/audioUtils'
import { usePointerLock } from '../hooks/usePointerLock'
import { useShootingDebugBridge } from '../hooks/useShootingDebugBridge'
import { useShootingSession } from '../hooks/useShootingSession'
import type { ShootingDifficulty } from '../types'
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
  setGameStarted?: (started: boolean) => void
}

export default function ShootingGame({ difficulty, setGameStarted }: ShootingGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneSnapshot = useRef<ShootingSceneSnapshot>({
    camera: { yaw: 0, pitch: 0 },
    targets: [],
  })
  const {
    score,
    shots,
    timeLeft,
    gameOver,
    gameStarted,
    setGameStarted: setSessionStarted,
    showStartOverlay,
    hitMarker,
    addScore,
    recordShot,
    showHitFeedback,
    beginTraining,
    restartTraining,
    returnToSettings,
  } = useShootingSession(setGameStarted)
  const {
    browserSupport,
    pointerLockError,
    requestPointerLock,
    enableFallbackControls,
    releasePointerLock,
  } = usePointerLock(canvasRef)

  useShootingDebugBridge({
    canvasRef,
    sceneSnapshot,
    difficulty,
    gameOver,
    gameStarted,
    score,
    shots,
    timeLeft,
  })

  const startGame = useCallback(() => {
    primeShootingAudio()
    beginTraining()
    requestPointerLock()
  }, [beginTraining, requestPointerLock])

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
        gameStarted={gameStarted}
        gameOver={gameOver}
        hitMarker={hitMarker}
        useFallbackControls={browserSupport.useFallback}
        onScore={addScore}
        onShot={recordShot}
        onHitFeedback={showHitFeedback}
        onGameStartedChange={setSessionStarted}
      />

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
        score={score}
        shots={shots}
        timeLeft={timeLeft}
        gameOver={gameOver}
        onRestart={restartTraining}
      />

      {showStartOverlay && !gameOver && !pointerLockError && (
        <ShootingReadyOverlay onStart={startGame} />
      )}

      {pointerLockError && (
        <ShootingPointerLockError
          message={pointerLockError}
          onRetry={startGame}
          onFallback={enableFallbackControls}
        />
      )}
    </div>
  )
}
