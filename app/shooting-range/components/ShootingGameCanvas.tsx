import { Canvas } from '@react-three/fiber'
import { memo } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import { GameScene, type ShootingSceneSnapshot } from './game/GameScene'
import type { ShootingDifficulty, ShootingMapId, TrainingModeId } from '../types'
import { mapConfigs } from '../utils/mapConfigs'

interface ShootingGameCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>
  sceneSnapshot: MutableRefObject<ShootingSceneSnapshot>
  difficulty: ShootingDifficulty
  mapId: ShootingMapId
  modeId: TrainingModeId
  gameStarted: boolean
  gameOver: boolean
  useFallbackControls: boolean
  onShotResult: (didHit: boolean, reactionMs?: number) => void
  onHitFeedback: () => void
  onFpsReport: (fps: number) => void
}

function ShootingGameCanvasComponent({
  canvasRef,
  sceneSnapshot,
  difficulty,
  mapId,
  modeId,
  gameStarted,
  gameOver,
  useFallbackControls,
  onShotResult,
  onHitFeedback,
  onFpsReport,
}: ShootingGameCanvasProps) {
  const mapBackground = mapConfigs[mapId].background

  return (
    <Canvas
      shadows
      ref={canvasRef}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 62, position: [0, 1.6, 0], rotation: [0, 0, 0], near: 0.05, far: 90 }}
      onCreated={({ gl, camera }) => {
        gl.setClearColor(mapBackground)
        gl.toneMappingExposure = mapId === 'indoor' ? 1.24 : mapId === 'outdoor' ? 1.14 : 1.12
        camera.rotation.set(0, 0, 0)
      }}
      style={{ touchAction: 'none' }}
      className="outline-none"
    >
      <GameScene
        key={`${difficulty}-${mapId}-${modeId}`}
        difficulty={difficulty}
        mapId={mapId}
        modeId={modeId}
        onShotResult={onShotResult}
        onHitFeedback={onHitFeedback}
        gameStarted={gameStarted && !gameOver}
        useFallbackControls={useFallbackControls}
        sceneStateRef={sceneSnapshot}
        onFpsReport={onFpsReport}
      />
    </Canvas>
  )
}

export const ShootingGameCanvas = memo(ShootingGameCanvasComponent)
