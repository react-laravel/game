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
  respawnTarget,
} from '../../utils/gameUtils'
import { mapConfigs } from '../../utils/mapConfigs'
import { resolveTrainingSettings } from '../../utils/trainingModes'
import { playHitSound, playShotSound } from '../../utils/audioUtils'
import type { ShootingDifficulty, ShootingMapId, TrainingModeId } from '../../types'

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
  return Array.from({ length: settings.targetCount }, (_, id): TargetData => ({
    id,
    position: generateRandomPosition(settings.gameAreaSize),
    scale: Math.random() * 0.18 + 0.55,
    speed: Math.random() * 0.008 + settings.targetSpeed,
    direction: generateRandomDirection(),
  }))
}

interface GameSceneProps {
  difficulty: ShootingDifficulty
  mapId: ShootingMapId
  modeId: TrainingModeId
  onShotResult: (didHit: boolean, reactionMs?: number) => void
  onHitFeedback?: () => void
  gameStarted: boolean
  setGameStarted: (started: boolean) => void
  useFallbackControls?: boolean
  sceneStateRef?: MutableRefObject<ShootingSceneSnapshot>
  onFpsReport?: (fps: number) => void
}

/** Hits, muzzle flashes, and respawns mutate Three.js objects instead of React state. */
export function GameScene({
  difficulty,
  mapId,
  modeId,
  onShotResult,
  onHitFeedback,
  gameStarted,
  setGameStarted,
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
  const muzzleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const snapshotElapsed = useRef(0)
  const fpsElapsed = useRef(0)
  const fpsFrames = useRef(0)
  const lookRotation = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const muzzleFlashRef = useRef(false)
  const impactFXRef = useRef<ImpactFXHandle>(null)
  const hitWorldPosition = useRef(new THREE.Vector3())
  const onShotResultRef = useRef(onShotResult)
  const onHitFeedbackRef = useRef(onHitFeedback)
  const onFpsReportRef = useRef(onFpsReport)

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

  const handleTargetHit = useCallback(
    (id: number) => {
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
      onShotResultRef.current(true, reactionMs)
      onHitFeedbackRef.current?.()
      navigator.vibrate?.(28)

      const previousTimer = respawnTimers.current.get(id)
      if (previousTimer) clearTimeout(previousTimer)

      const timer = setTimeout(() => {
        const current = targetObjects.current.get(id)
        if (current) respawnTarget(current, settings.gameAreaSize)
        hitTargetIds.current.delete(id)
        respawnTimers.current.delete(id)
      }, settings.respawnDelayMs)

      respawnTimers.current.set(id, timer)
    },
    [settings.gameAreaSize, settings.respawnDelayMs]
  )

  const showMuzzleFlash = useCallback(() => {
    if (muzzleTimer.current) clearTimeout(muzzleTimer.current)
    muzzleFlashRef.current = true
    muzzleTimer.current = setTimeout(() => {
      muzzleFlashRef.current = false
    }, 55)
  }, [])

  const handleShoot = useCallback(() => {
    if (!gameStarted) return

    const now = performance.now()
    if (now < nextShotAt.current) return
    nextShotAt.current = now + 145

    showMuzzleFlash()
    playShotSound()

    raycaster.current.setFromCamera(screenCenter.current, camera)
    const objects = raycastObjects.current
    const intersections = objects.length > 0
      ? raycaster.current.intersectObjects(objects, true)
      : []

    let didHit = false
    for (const intersection of intersections) {
      let object: THREE.Object3D | null = intersection.object
      while (object && object.userData?.targetId === undefined) object = object.parent

      const targetId = object?.userData?.targetId
      if (typeof targetId === 'number' && !hitTargetIds.current.has(targetId)) {
        handleTargetHit(targetId)
        didHit = true
        break
      }
    }

    if (!didHit) onShotResultRef.current(false)
  }, [camera, gameStarted, handleTargetHit, showMuzzleFlash])

  const handleFallbackTargetClick = useCallback(
    (id: number) => {
      if (!gameStarted || !useFallbackControls || hitTargetIds.current.has(id)) return
      showMuzzleFlash()
      playShotSound()
      handleTargetHit(id)
    },
    [gameStarted, handleTargetHit, showMuzzleFlash, useFallbackControls]
  )

  useFrame((_, delta) => {
    fpsFrames.current += 1
    fpsElapsed.current += delta
    if (fpsElapsed.current >= 0.5) {
      onFpsReportRef.current?.(fpsFrames.current / fpsElapsed.current)
      fpsFrames.current = 0
      fpsElapsed.current = 0
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
      rotation.y -= event.movementX * 0.002
      rotation.x -= event.movementY * 0.002
      rotation.x = THREE.MathUtils.clamp(
        rotation.x,
        -Math.PI / 2 + 0.05,
        Math.PI / 2 - 0.05
      )
      camera.quaternion.setFromEuler(rotation)
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [camera, gameStarted, gl.domElement, useFallbackControls])

  useEffect(() => {
    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === gl.domElement
      if (gameStarted && !useFallbackControls && !locked && document.pointerLockElement !== null) {
        setGameStarted(false)
      }
    }
    const handleBeforeUnload = () => document.exitPointerLock?.()

    document.addEventListener('pointerlockchange', handlePointerLockChange)
    document.addEventListener('mozpointerlockchange', handlePointerLockChange)
    document.addEventListener('webkitpointerlockchange', handlePointerLockChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      document.removeEventListener('mozpointerlockchange', handlePointerLockChange)
      document.removeEventListener('webkitpointerlockchange', handlePointerLockChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [gameStarted, gl.domElement, setGameStarted, useFallbackControls])

  useEffect(
    () => () => {
      respawnTimers.current.forEach(clearTimeout)
      if (muzzleTimer.current) clearTimeout(muzzleTimer.current)
      document.exitPointerLock?.()
    },
    []
  )

  return (
    <>
      <RangeEnvironment config={mapConfig} />

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
          onReady={registerTarget}
          onClick={handleFallbackTargetClick}
        />
      ))}

      <ImpactFX ref={impactFXRef} />
      <FPSWeapon muzzleFlashRef={muzzleFlashRef} />
    </>
  )
}
