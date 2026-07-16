'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Crosshair as CrosshairIcon, LogOut, MousePointer2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GameScene, type ShootingSceneSnapshot } from './game/GameScene'
import { GameUI } from './game/GameUI'
import { Crosshair } from './game/Crosshair'
import { primeShootingAudio } from '../utils/audioUtils'

interface ShootingGameProps {
  difficulty: 'easy' | 'medium' | 'hard'
  setGameStarted?: (started: boolean) => void
}

type ShootingWindow = Window &
  typeof globalThis & {
    render_game_to_text?: () => string
    advanceTime?: (ms: number) => Promise<void>
  }

export default function ShootingGame({ difficulty, setGameStarted }: ShootingGameProps) {
  const [score, setScore] = useState(0)
  const [shots, setShots] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStartedState] = useState(false)
  const [showStartOverlay, setShowStartOverlay] = useState(true)
  const [hitMarker, setHitMarker] = useState(false)
  const [pointerLockError, setPointerLockError] = useState<string | null>(null)
  const [browserSupport, setBrowserSupport] = useState(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
    if (isMobile) {
      return {
        supported: false,
        message: '射击游戏需要使用鼠标控制，暂不支持移动设备。',
        useFallback: false,
      }
    }
    if (!('pointerLockElement' in document)) {
      return {
        supported: false,
        message: '浏览器不支持鼠标锁定，已切换为点击目标模式。',
        useFallback: true,
      }
    }
    return { supported: true, message: '', useFallback: false }
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hitMarkerTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sceneStateRef = useRef<ShootingSceneSnapshot>({ targets: [] })

  const handleScore = useCallback(() => setScore(previous => previous + 10), [])
  const handleShot = useCallback(() => setShots(previous => previous + 1), [])
  const handleHitFeedback = useCallback(() => {
    if (hitMarkerTimer.current) clearTimeout(hitMarkerTimer.current)
    setHitMarker(true)
    hitMarkerTimer.current = setTimeout(() => setHitMarker(false), 110)
  }, [])

  useEffect(() => {
    const preventSpacebarScroll = (event: KeyboardEvent) => {
      if (event.code === 'Space') event.preventDefault()
    }
    window.addEventListener('keydown', preventSpacebarScroll, { passive: false })
    return () => window.removeEventListener('keydown', preventSpacebarScroll)
  }, [])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const timer = setInterval(() => {
      setTimeLeft(previous => {
        if (previous <= 1) {
          setGameOver(true)
          return 0
        }
        return previous - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameOver, gameStarted])

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
        targets: sceneStateRef.current.targets,
      })

    let installedAdvanceTime = false
    if (!gameWindow.advanceTime) {
      installedAdvanceTime = true
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
  }, [difficulty, gameOver, gameStarted, score, shots, timeLeft])

  useEffect(() => {
    const handlePointerLockError = () => {
      setPointerLockError('浏览器拒绝了鼠标锁定请求。')
      setBrowserSupport(previous => ({ ...previous, useFallback: true }))
    }

    document.addEventListener('pointerlockerror', handlePointerLockError)
    return () => document.removeEventListener('pointerlockerror', handlePointerLockError)
  }, [])

  useEffect(
    () => () => {
      if (hitMarkerTimer.current) clearTimeout(hitMarkerTimer.current)
      document.exitPointerLock?.()
    },
    []
  )

  const startGame = useCallback(() => {
    primeShootingAudio()
    setPointerLockError(null)
    setShowStartOverlay(false)
    setGameStartedState(true)
    setGameStarted?.(true)

    if (!browserSupport.useFallback) {
      try {
        const lockResult = canvasRef.current?.requestPointerLock()
        if (lockResult && 'catch' in lockResult) {
          void lockResult.catch(() => {
            setPointerLockError('浏览器拒绝了鼠标锁定请求。')
            setBrowserSupport(previous => ({ ...previous, useFallback: true }))
          })
        }
      } catch {
        setPointerLockError('浏览器拒绝了鼠标锁定请求。')
        setBrowserSupport(previous => ({ ...previous, useFallback: true }))
      }
    }
  }, [browserSupport.useFallback, setGameStarted])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.code === 'Enter' || event.code === 'Space') && !gameStarted && !gameOver) {
        event.preventDefault()
        startGame()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameOver, gameStarted, startGame])

  const handleRestart = useCallback(() => {
    setScore(0)
    setShots(0)
    setTimeLeft(60)
    setGameOver(false)
    setGameStartedState(true)
  }, [])

  const handleBackToSettings = useCallback(() => {
    document.exitPointerLock?.()
    setGameStartedState(false)
    setShowStartOverlay(true)
    setGameStarted?.(false)
  }, [setGameStarted])

  if (!browserSupport.supported && !browserSupport.useFallback) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-950 p-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-7 text-center">
          <CrosshairIcon className="mx-auto mb-4 h-10 w-10 text-amber-300" />
          <h2 className="text-xl font-bold">当前设备无法开始训练</h2>
          <p className="mt-3 text-sm text-white/60">{browserSupport.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-slate-950 shadow-2xl ring-1 ring-white/10">
      <Canvas
        shadows
        ref={canvasRef}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 62, position: [0, 1.6, 0], rotation: [0, 0, 0], near: 0.05, far: 90 }}
        onCreated={({ gl, camera }) => {
          gl.setClearColor('#07141e')
          camera.rotation.set(0, 0, 0)
        }}
        style={{ touchAction: 'none' }}
        className="outline-none"
      >
        <GameScene
          key={difficulty}
          difficulty={difficulty}
          onScore={handleScore}
          onShot={handleShot}
          onHitFeedback={handleHitFeedback}
          gameStarted={gameStarted && !gameOver}
          setGameStarted={setGameStartedState}
          useFallbackControls={browserSupport.useFallback}
          onError={setPointerLockError}
          sceneStateRef={sceneStateRef}
        />
      </Canvas>

      {gameStarted && !gameOver && <Crosshair hit={hitMarker} />}

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
        onRestart={handleRestart}
      />

      {showStartOverlay && !gameOver && !pointerLockError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/48 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/95 p-7 text-center text-white shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 ring-1 ring-cyan-200/20">
              <CrosshairIcon className="h-7 w-7 text-cyan-200" />
            </div>
            <div className="mt-5 text-xs font-semibold tracking-[0.22em] text-amber-300/80 uppercase">
              Tactical range
            </div>
            <h2 className="mt-2 text-2xl font-black">准备进入训练</h2>
            <p className="mt-2 text-sm leading-6 text-white/55">
              锁定鼠标后移动瞄准，左键射击。按 ESC 可随时释放鼠标。
            </p>
            <Button
              className="mt-6 w-full bg-amber-400 py-5 font-bold text-slate-950 hover:bg-amber-300"
              onClick={startGame}
            >
              <MousePointer2 className="h-4 w-4" />
              锁定鼠标并开始
            </Button>
          </div>
        </div>
      )}

      {pointerLockError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-7 text-center text-white shadow-2xl">
            <h2 className="text-xl font-bold">无法锁定鼠标</h2>
            <p className="mt-2 text-sm text-white/55">{pointerLockError}</p>
            <div className="mt-6 flex gap-3">
              <Button className="flex-1" onClick={startGame}>
                重试
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                onClick={() => {
                  setPointerLockError(null)
                  setBrowserSupport(previous => ({ ...previous, useFallback: true }))
                }}
              >
                点击目标模式
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
