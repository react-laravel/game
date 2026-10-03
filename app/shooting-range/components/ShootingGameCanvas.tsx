import { Canvas } from '@react-three/fiber'
import { memo } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import { GameScene, type ShootingSceneSnapshot } from './game/GameScene'
import type { HitZone, OutdoorTimeOfDay, ShootingDifficulty, ShootingMapId, TargetShape, TrainingModeId } from '../types'
import { mapConfigs } from '../utils/mapConfigs'
import { getOutdoorTimePreset } from '../utils/outdoorTimeOfDay'
import { RangeDiagnostics } from './game/RangeDiagnostics'
import { WeaponAimCamera } from './game/WeaponAimCamera'
import { BASE_FOV, type WeaponId } from '../utils/weapons'

interface ShootingGameCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>
  sceneSnapshot: MutableRefObject<ShootingSceneSnapshot>
  difficulty: ShootingDifficulty
  mapId: ShootingMapId
  modeId: TrainingModeId
  targetShape: TargetShape
  outdoorTimeOfDay?: OutdoorTimeOfDay
  lookSensitivity: number
  reducedMotion?: boolean
  recoilEnabled?: boolean
  weaponId: WeaponId
  isAiming: boolean
  gameStarted: boolean
  gameOver: boolean
  useFallbackControls: boolean
  onShotResult: (didHit: boolean, reactionMs?: number, hitZone?: HitZone) => void
  onHitFeedback: (hitZone?: import('../types').HitZone) => void
  onFpsReport: (fps: number) => void
}

function ShootingGameCanvasComponent({
  canvasRef,
  sceneSnapshot,
  difficulty,
  mapId,
  modeId,
  targetShape,
  outdoorTimeOfDay = 'day',
  lookSensitivity,
  reducedMotion = false,
  recoilEnabled = false,
  weaponId,
  isAiming,
  gameStarted,
  gameOver,
  useFallbackControls,
  onShotResult,
  onHitFeedback,
  onFpsReport,
}: ShootingGameCanvasProps) {
  const mapBackground =
    mapId === 'outdoor'
      ? getOutdoorTimePreset(outdoorTimeOfDay).background
      : mapConfigs[mapId].background
  const toneMappingExposure =
    mapId === 'indoor'
      ? 1.05
      : mapId === 'outdoor'
        ? getOutdoorTimePreset(outdoorTimeOfDay).toneMappingExposure
        : 1.05

  return (
    <Canvas
      shadows={false}
      ref={canvasRef}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: BASE_FOV, position: [0, 1.6, 0], rotation: [0, 0, 0], near: 0.05, far: mapId === 'outdoor' ? 220 : 90 }}
      onCreated={({ gl, camera }) => {
        gl.setClearColor(mapBackground)
        gl.toneMappingExposure = toneMappingExposure
        camera.rotation.set(0, 0, 0)
      }}
      style={{ touchAction: 'none' }}
      className="outline-none"
    >
      <RangeDiagnostics />
      <WeaponAimCamera weaponId={weaponId} isAiming={isAiming} reducedMotion={reducedMotion} />
      <GameScene
        key={`${difficulty}-${mapId}-${modeId}-${targetShape}-${outdoorTimeOfDay}`}
        difficulty={difficulty}
        mapId={mapId}
        modeId={modeId}
        targetShape={targetShape}
        outdoorTimeOfDay={outdoorTimeOfDay}
        lookSensitivity={lookSensitivity}
        reducedMotion={reducedMotion}
        recoilEnabled={recoilEnabled}
        weaponId={weaponId}
        isAiming={isAiming}
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
