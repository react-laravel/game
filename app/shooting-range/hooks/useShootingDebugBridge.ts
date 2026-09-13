import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import type { ShootingSceneSnapshot } from '../components/game/GameScene'
import type { SessionStats, ShootingDifficulty, ShootingMapId, TargetShape, TrainingModeId } from '../types'

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
  targetShape: TargetShape
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
  targetShape,
  gameOver,
  gameStarted,
  stats,
  timeLeft,
  onEndSession,
  onInjectStats,
}: ShootingDebugBridgeOptions) {
  const statsRef = useRef(stats)
  const timeLeftRef = useRef(timeLeft)
  const gameOverRef = useRef(gameOver)
  const gameStartedRef = useRef(gameStarted)

  useLayoutEffect(() => {
    statsRef.current = stats
    timeLeftRef.current = timeLeft
    gameOverRef.current = gameOver
    gameStartedRef.current = gameStarted
  })

  useEffect(() => {
    const gameWindow = window as ShootingWindow
    gameWindow.render_game_to_text = () =>
      JSON.stringify({
        coordinateSystem: 'origin at camera start; +x right, +y up, -z forward',
        mode: gameOverRef.current ? 'game-over' : gameStartedRef.current ? 'playing' : 'ready',
        difficulty,
        mapId,
        modeId,
        targetShape,
        ...statsRef.current,
        timeLeft: timeLeftRef.current,
        pointerLocked: document.pointerLockElement === canvasRef.current,
        camera: sceneSnapshot.current?.camera ?? { yaw: 0, pitch: 0 },
        targets: sceneSnapshot.current?.targets ?? [],
      })

    gameWindow.endShootingSession = () => {
      if (gameStartedRef.current && !gameOverRef.current) onEndSession()
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
    mapId,
    modeId,
    targetShape,
    onEndSession,
    onInjectStats,
    sceneSnapshot,
  ])
}
