import { Canvas } from '@react-three/fiber'
import { memo } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import { GameScene, type ShootingSceneSnapshot } from './game/GameScene'
import type { HitZone, ShootingDifficulty, ShootingMapId, TargetShape, TrainingModeId } from '../types'
import { mapConfigs } from '../utils/mapConfigs'

interface ShootingGameCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>
  sceneSnapshot: MutableRefObject<ShootingSceneSnapshot>
  difficulty: ShootingDifficulty
  mapId: ShootingMapId
  modeId: TrainingModeId
  targetShape: TargetShape
  lookSensitivity: number
  reducedMotion?: boolean
  gameStarted: boolean
  gameOver: boolean
  useFallbackControls: boolean
  onShotResult: (didHit: boolean, reactionMs?: number, hitZone?: HitZone) => void
  onHitFeedback: () => void
  onFpsReport: (fps: number) => void
}

function ShootingGameCanvasComponent({
  canvasRef,
  sceneSnapshot,
  difficulty,
  mapId,
  modeId,
  targetShape,
  lookSensitivity,
  reducedMotion = false,
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
      camera={{ fov: 62, position: [0, 1.6, 0], rotation: [0, 0, 0], near: 0.05, far: mapId === 'outdoor' ? 130 : 90 }}
      onCreated={({ gl, camera }) => {
        gl.setClearColor(mapBackground)
        gl.toneMappingExposure = mapId === 'indoor' ? 1.52 : mapId === 'outdoor' ? 1.02 : 1.18
        camera.rotation.set(0, 0, 0)
      }}
      style={{ touchAction: 'none' }}
      className="outline-none"
    >
      <GameScene
        key={`${difficulty}-${mapId}-${modeId}-${targetShape}`}
        difficulty={difficulty}
        mapId={mapId}
        modeId={modeId}
        targetShape={targetShape}
        lookSensitivity={lookSensitivity}
        reducedMotion={reducedMotion}
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
