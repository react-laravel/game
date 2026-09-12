import { useEffect, type RefObject } from 'react'
import type { ShootingSceneSnapshot } from '../components/game/GameScene'
import type { SessionStats, ShootingDifficulty, ShootingMapId, TrainingModeId } from '../types'

type ShootingWindow = Window &
  typeof globalThis & {
    render_game_to_text?: () => string
    advanceTime?: (ms: number) => Promise<void>
    endShootingSession?: () => void
    debugShootingSession?: (patch: Partial<SessionStats>) => void
  }

interface ShootingDebugBridgeOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>
  sceneSnapshot: RefObject<ShootingSceneSnapshot>
  difficulty: ShootingDifficulty
  mapId: ShootingMapId
  modeId: TrainingModeId
  gameOver: boolean
  gameStarted: boolean
  stats: SessionStats
  timeLeft: number
  onEndSession: () => void
  onInjectStats?: (patch: Partial<SessionStats>) => void
}

export function useShootingDebugBridge({
  canvasRef,
  sceneSnapshot,
  difficulty,
  mapId,
  modeId,
  gameOver,
  gameStarted,
  stats,
  timeLeft,
  onEndSession,
  onInjectStats,
}: ShootingDebugBridgeOptions) {
  useEffect(() => {
    const gameWindow = window as ShootingWindow
    gameWindow.render_game_to_text = () =>
      JSON.stringify({
        coordinateSystem: 'origin at camera start; +x right, +y up, -z forward',
        mode: gameOver ? 'game-over' : gameStarted ? 'playing' : 'ready',
        difficulty,
        mapId,
        modeId,
        ...stats,
        timeLeft,
        pointerLocked: document.pointerLockElement === canvasRef.current,
        camera: sceneSnapshot.current?.camera ?? { yaw: 0, pitch: 0 },
        targets: sceneSnapshot.current?.targets ?? [],
      })

    gameWindow.endShootingSession = () => {
      if (gameStarted && !gameOver) onEndSession()
    }

    if (onInjectStats) {
      gameWindow.debugShootingSession = patch => onInjectStats(patch)
    } else {
      delete gameWindow.debugShootingSession
    }

    const installedAdvanceTime = !gameWindow.advanceTime
    if (installedAdvanceTime) {
      gameWindow.advanceTime = (ms: number) =>
        new Promise(resolve => {
          const start = performance.now()
          const step = (now: number) => {
            if (now - start >= ms) resolve()
            else requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        })
    }

    return () => {
      delete gameWindow.render_game_to_text
      delete gameWindow.endShootingSession
      delete gameWindow.debugShootingSession
      if (installedAdvanceTime) delete gameWindow.advanceTime
    }
  }, [
    canvasRef,
    difficulty,
    gameOver,
    gameStarted,
    mapId,
    modeId,
    onEndSession,
    onInjectStats,
    sceneSnapshot,
    stats,
    timeLeft,
  ])
}
