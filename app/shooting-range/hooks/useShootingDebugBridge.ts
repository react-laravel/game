import { useEffect, type RefObject } from 'react'
import type { ShootingSceneSnapshot } from '../components/game/GameScene'
import type { ShootingDifficulty } from '../types'

type ShootingWindow = Window &
  typeof globalThis & {
    render_game_to_text?: () => string
    advanceTime?: (ms: number) => Promise<void>
  }

interface ShootingDebugBridgeOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>
  sceneSnapshot: RefObject<ShootingSceneSnapshot>
  difficulty: ShootingDifficulty
  gameOver: boolean
  gameStarted: boolean
  score: number
  shots: number
  timeLeft: number
}

export function useShootingDebugBridge({
  canvasRef,
  sceneSnapshot,
  difficulty,
  gameOver,
  gameStarted,
  score,
  shots,
  timeLeft,
}: ShootingDebugBridgeOptions) {
  useEffect(() => {
    const gameWindow = window as ShootingWindow
    gameWindow.render_game_to_text = () =>
      JSON.stringify({
        coordinateSystem: 'origin at camera start; +x right, +y up, -z forward',
        mode: gameOver ? 'game-over' : gameStarted ? 'playing' : 'ready',
        difficulty,
        score,
        shots,
        timeLeft,
        pointerLocked: document.pointerLockElement === canvasRef.current,
        camera: sceneSnapshot.current?.camera ?? { yaw: 0, pitch: 0 },
        targets: sceneSnapshot.current?.targets ?? [],
      })

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
      if (installedAdvanceTime) delete gameWindow.advanceTime
    }
  }, [
    canvasRef,
    difficulty,
    gameOver,
    gameStarted,
    sceneSnapshot,
    score,
    shots,
    timeLeft,
  ])
}
