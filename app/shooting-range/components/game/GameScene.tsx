import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Target } from './Target'
import { FPSWeapon } from './FPSWeapon'
import { ImpactFX, type ImpactFXHandle } from './ImpactFX'
import { RangeEnvironment } from './RangeEnvironment'
import {
  applyTargetHit,
  generateRandomDirection,
  generateRandomPosition,
  markTargetSpawned,
  nextGridPosition,
  resetGridSpawnIndex,
  respawnTarget,
} from '../../utils/gameUtils'
import { mapConfigs } from '../../utils/mapConfigs'
import { resolveTrainingSettings } from '../../utils/trainingModes'
import { playHitSound, playMissSound, playShotSound } from '../../utils/audioUtils'
import {
  MUZZLE_FLASH_DURATION,
  RECOIL_KICK_PITCH,
  decayRecoil,
  randomRecoilYaw,
} from '../../utils/gunFeel'
import { lookSpeedForSensitivity } from '../../utils/lookSensitivity'
import type { HitZone, OutdoorTimeOfDay, ShootingDifficulty, ShootingMapId, TargetShape, TrainingModeId } from '../../types'

interface TargetData {
  id: number
  position: [number, number, number]
  scale: number
  speed: number
  direction: [number, number, number]
}

export interface ShootingSceneSnapshot {
  camera: { yaw: number; pitch: number }
  targets: Array<{ id: number; x: number; y: number; z: number; hit: boolean }>
}

function createTargets(settings: ReturnType<typeof resolveTrainingSettings>) {
  if (settings.spawnPattern === 'grid') resetGridSpawnIndex()
  const speedVariance = settings.movement === 'linear' ? 0.012 : 0
  return Array.from({ length: settings.targetCount }, (_, id): TargetData => ({
    id,
    position:
      settings.spawnPattern === 'grid'
        ? nextGridPosition()
        : generateRandomPosition(settings.gameAreaSize),
    scale: Math.random() * 0.18 + 0.55,
    speed: settings.targetSpeed + Math.random() * speedVariance,
    direction: generateRandomDirection(),
  }))
}

interface GameSceneProps {
  difficulty: ShootingDifficulty
  mapId: ShootingMapId
  modeId: TrainingModeId
  targetShape: TargetShape
  outdoorTimeOfDay?: OutdoorTimeOfDay
  lookSensitivity: number
  reducedMotion?: boolean
  onShotResult: (didHit: boolean, reactionMs?: number, hitZone?: HitZone) => void
  onHitFeedback?: () => void
  gameStarted: boolean
  useFallbackControls?: boolean
  sceneStateRef?: MutableRefObject<ShootingSceneSnapshot>
  onFpsReport?: (fps: number) => void
}

/** Hits, muzzle flashes, and respawns mutate Three.js objects instead of React state. */
export function GameScene({
  difficulty,
  mapId,
  modeId,
  targetShape,
  outdoorTimeOfDay = 'day',
  lookSensitivity,
  reducedMotion = false,
  onShotResult,
  onHitFeedback,
  gameStarted,
  useFallbackControls = false,
  sceneStateRef,
  onFpsReport,
}: GameSceneProps) {
  const { camera, gl } = useThree()
  const settings = resolveTrainingSettings(difficulty, modeId)
  const mapConfig = mapConfigs[mapId]
  const [targets] = useState<TargetData[]>(() => createTargets(settings))
  const targetObjects = useRef(new Map<number, THREE.Group>())
  const hitTargetIds = useRef(new Set<number>())
  const respawnTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>())
  const raycaster = useRef(new THREE.Raycaster())
  const raycastObjects = useRef<THREE.Object3D[]>([])
  const screenCenter = useRef(new THREE.Vector2(0, 0))
  const nextShotAt = useRef(0)
  const snapshotElapsed = useRef(0)
  const fpsElapsed = useRef(0)
  const fpsFrames = useRef(0)
  const lookRotation = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const viewEuler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const muzzleFlashElapsed = useRef(-1)
  const recoilPitch = useRef(0)
  const recoilYaw = useRef(0)
  const impactFXRef = useRef<ImpactFXHandle>(null)
  const hitWorldPosition = useRef(new THREE.Vector3())
  const onShotResultRef = useRef(onShotResult)
  const onHitFeedbackRef = useRef(onHitFeedback)
  const onFpsReportRef = useRef(onFpsReport)
  const lookSpeedRef = useRef(lookSpeedForSensitivity(lookSensitivity))

  useEffect(() => {
    lookSpeedRef.current = lookSpeedForSensitivity(lookSensitivity)
  }, [lookSensitivity])

  useEffect(() => {
    onShotResultRef.current = onShotResult
    onHitFeedbackRef.current = onHitFeedback
    onFpsReportRef.current = onFpsReport
  }, [onHitFeedback, onFpsReport, onShotResult])

  const registerTarget = useCallback((id: number, target: THREE.Group | null) => {
    if (target) {
      markTargetSpawned(target)
      targetObjects.current.set(id, target)
    } else {
      targetObjects.current.delete(id)
    }
    raycastObjects.current = Array.from(targetObjects.current.values())
  }, [])

  const resolveRaycastHit = useCallback((object: THREE.Object3D | null) => {
    let current: THREE.Object3D | null = object
    let hitZone: HitZone | undefined
    while (current) {
      if (current.userData?.hitZone) {
        hitZone = current.userData.hitZone as HitZone
      }
      if (typeof current.userData?.targetId === 'number') {
        return { targetId: current.userData.targetId as number, hitZone }
      }
      current = current.parent
    }
    return null
  }, [])

  const handleTargetHit = useCallback(
    (id: number, hitZone?: HitZone) => {
      if (hitTargetIds.current.has(id)) return
      hitTargetIds.current.add(id)

      const targetObject = targetObjects.current.get(id)
      let reactionMs: number | undefined
      if (targetObject) {
        applyTargetHit(targetObject)
        targetObject.getWorldPosition(hitWorldPosition.current)
        impactFXRef.current?.trigger(hitWorldPosition.current)
        const spawnedAt = targetObject.userData.spawnedAt
        if (typeof spawnedAt === 'number') {
          reactionMs = performance.now() - spawnedAt
        }
      }

      playHitSound()
      onShotResultRef.current(true, reactionMs, hitZone)
      onHitFeedbackRef.current?.()
      navigator.vibrate?.(28)

      const previousTimer = respawnTimers.current.get(id)
      if (previousTimer) clearTimeout(previousTimer)

      const timer = setTimeout(() => {
        const current = targetObjects.current.get(id)
        if (current) respawnTarget(current, settings.gameAreaSize, settings.spawnPattern)
        hitTargetIds.current.delete(id)
        respawnTimers.current.delete(id)
      }, settings.respawnDelayMs)

      respawnTimers.current.set(id, timer)
    },
    [settings.gameAreaSize, settings.respawnDelayMs, settings.spawnPattern]
  )

  const triggerGunFeel = useCallback(() => {
    muzzleFlashElapsed.current = 0
    recoilPitch.current += RECOIL_KICK_PITCH
    recoilYaw.current += randomRecoilYaw()
  }, [])

  const handleShoot = useCallback(() => {
    if (!gameStarted) return

    const now = performance.now()
    if (now < nextShotAt.current) return
    nextShotAt.current = now + 145

    triggerGunFeel()
    playShotSound()

    raycaster.current.setFromCamera(screenCenter.current, camera)
    const objects = raycastObjects.current
    const intersections = objects.length > 0
      ? raycaster.current.intersectObjects(objects, true)
      : []

    let didHit = false
    for (const intersection of intersections) {
      const resolved = resolveRaycastHit(intersection.object)
      if (resolved && !hitTargetIds.current.has(resolved.targetId)) {
        handleTargetHit(resolved.targetId, resolved.hitZone)
        didHit = true
        break
      }
    }

    if (!didHit) {
      playMissSound()
      onShotResultRef.current(false)
    }
  }, [camera, gameStarted, handleTargetHit, resolveRaycastHit, triggerGunFeel])

  const handleFallbackTargetClick = useCallback(
    (id: number) => {
      if (!gameStarted || !useFallbackControls || hitTargetIds.current.has(id)) return
      triggerGunFeel()
      playShotSound()
      handleTargetHit(id)
    },
    [gameStarted, handleTargetHit, triggerGunFeel, useFallbackControls]
  )

  useFrame((_, delta) => {
    fpsFrames.current += 1
    fpsElapsed.current += delta
    if (fpsElapsed.current >= 0.5) {
      onFpsReportRef.current?.(fpsFrames.current / fpsElapsed.current)
      fpsFrames.current = 0
      fpsElapsed.current = 0
    }

    if (muzzleFlashElapsed.current >= 0) {
      muzzleFlashElapsed.current += delta
      if (muzzleFlashElapsed.current >= MUZZLE_FLASH_DURATION) {
        muzzleFlashElapsed.current = -1
      }
    }

    recoilPitch.current = decayRecoil(recoilPitch.current, delta)
    recoilYaw.current = decayRecoil(recoilYaw.current, delta)

    if (gameStarted && !useFallbackControls) {
      const base = lookRotation.current
      const view = viewEuler.current
      view.set(base.x - recoilPitch.current, base.y + recoilYaw.current, 0)
      camera.quaternion.setFromEuler(view)
    }

    if (!sceneStateRef) return
    snapshotElapsed.current += delta
    if (snapshotElapsed.current < 0.1) return
    snapshotElapsed.current = 0

    sceneStateRef.current.camera = {
      yaw: Number(camera.rotation.y.toFixed(3)),
      pitch: Number(camera.rotation.x.toFixed(3)),
    }
    sceneStateRef.current.targets = Array.from(targetObjects.current, ([id, object]) => ({
      id,
      x: Number(object.position.x.toFixed(2)),
      y: Number(object.position.y.toFixed(2)),
      z: Number(object.position.z.toFixed(2)),
      hit: Boolean(object.userData.hit),
    }))
  })

  useEffect(() => {
    if (useFallbackControls || !gameStarted) return

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) handleShoot()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        handleShoot()
      }
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('keydown', handleKeyDown, { passive: false })
    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [gameStarted, handleShoot, useFallbackControls])

  useEffect(() => {
    if (!gameStarted || useFallbackControls) return

    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement) return

      const rotation = lookRotation.current
      rotation.setFromQuaternion(camera.quaternion, 'YXZ')
      const lookSpeed = lookSpeedRef.current
      rotation.y -= event.movementX * lookSpeed
      rotation.x -= event.movementY * lookSpeed
      rotation.x = THREE.MathUtils.clamp(
        rotation.x,
        -Math.PI / 2 + 0.05,
        Math.PI / 2 - 0.05
      )
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [camera, gameStarted, gl.domElement, useFallbackControls])

  useEffect(() => {
    const handleBeforeUnload = () => document.exitPointerLock?.()
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  useEffect(
    () => () => {
      respawnTimers.current.forEach(clearTimeout)
      document.exitPointerLock?.()
    },
    []
  )

  return (
    <>
      <RangeEnvironment config={mapConfig} outdoorTimeOfDay={outdoorTimeOfDay} />

      {targets.map(target => (
        <Target
          key={target.id}
          id={target.id}
          position={target.position}
          direction={target.direction}
          speed={target.speed}
          gameAreaSize={settings.gameAreaSize}
          scale={target.scale}
          movement={settings.movement}
          jitterChance={settings.jitterChance}
          faceCamera={settings.faceCamera}
          orbitRadius={settings.orbitRadius}
          orbitSpeed={settings.orbitSpeed}
          modeId={modeId}
          targetShape={targetShape}
          onReady={registerTarget}
          onClick={handleFallbackTargetClick}
        />
      ))}

      <ImpactFX ref={impactFXRef} reducedMotion={reducedMotion} />
      <FPSWeapon
        muzzleFlashElapsedRef={muzzleFlashElapsed}
        recoilPitchRef={recoilPitch}
        reducedMotion={reducedMotion}
      />
    </>
  )
}
