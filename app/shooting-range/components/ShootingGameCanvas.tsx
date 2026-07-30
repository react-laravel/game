import { Canvas } from '@react-three/fiber'
import type { MutableRefObject, RefObject } from 'react'
import { Crosshair } from './game/Crosshair'
import { GameScene, type ShootingSceneSnapshot } from './game/GameScene'
import type { ShootingDifficulty } from '../types'

interface ShootingGameCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>
  sceneSnapshot: MutableRefObject<ShootingSceneSnapshot>
  difficulty: ShootingDifficulty
  gameStarted: boolean
  gameOver: boolean
  hitMarker: boolean
  useFallbackControls: boolean
  onScore: () => void
  onShot: () => void
  onHitFeedback: () => void
  onGameStartedChange: (started: boolean) => void
}

export function ShootingGameCanvas({
  canvasRef,
  sceneSnapshot,
  difficulty,
  gameStarted,
  gameOver,
  hitMarker,
  useFallbackControls,
  onScore,
  onShot,
  onHitFeedback,
  onGameStartedChange,
}: ShootingGameCanvasProps) {
  return (
    <>
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
          onScore={onScore}
          onShot={onShot}
          onHitFeedback={onHitFeedback}
          gameStarted={gameStarted && !gameOver}
          setGameStarted={onGameStartedChange}
          useFallbackControls={useFallbackControls}
          sceneStateRef={sceneSnapshot}
        />
      </Canvas>

      {gameStarted && !gameOver && <Crosshair hit={hitMarker} />}
    </>
  )
}
