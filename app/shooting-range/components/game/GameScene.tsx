import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Target } from './Target'
import { FPSWeapon } from './FPSWeapon'
import { ImpactFX, type ImpactFXHandle } from './ImpactFX'
import {
  applyTargetHit,
  difficultySettings,
  generateRandomDirection,
  generateRandomPosition,
  respawnTarget,
} from '../../utils/gameUtils'
import { playHitSound, playShotSound } from '../../utils/audioUtils'

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

function createTargets(settings: (typeof difficultySettings)[keyof typeof difficultySettings]) {
  return Array.from({ length: settings.targetCount }, (_, id): TargetData => ({
    id,
    position: generateRandomPosition(settings.gameAreaSize),
    scale: Math.random() * 0.18 + 0.55,
    speed: Math.random() * 0.008 + settings.targetSpeed,
    direction: generateRandomDirection(),
  }))
}

interface GameSceneProps {
  difficulty: 'easy' | 'medium' | 'hard'
  onScore: () => void
  onShot?: () => void
  onHitFeedback?: () => void
  gameStarted: boolean
  setGameStarted: (started: boolean) => void
  useFallbackControls?: boolean
  sceneStateRef?: MutableRefObject<ShootingSceneSnapshot>
}

/** Hits, muzzle flashes, and respawns mutate Three.js objects instead of React state. */
export function GameScene({
  difficulty,
  onScore,
  onShot,
  onHitFeedback,
  gameStarted,
  setGameStarted,
  useFallbackControls = false,
  sceneStateRef,
}: GameSceneProps) {
  const { camera, gl } = useThree()
  const settings = difficultySettings[difficulty]
  const [targets] = useState<TargetData[]>(() => createTargets(settings))
  const targetObjects = useRef(new Map<number, THREE.Group>())
  const hitTargetIds = useRef(new Set<number>())
  const respawnTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>())
  const raycaster = useRef(new THREE.Raycaster())
  const screenCenter = useRef(new THREE.Vector2(0, 0))
  const nextShotAt = useRef(0)
  const muzzleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const snapshotElapsed = useRef(0)
  const lookRotation = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const muzzleFlashRef = useRef(false)
  const impactFXRef = useRef<ImpactFXHandle>(null)
  const hitWorldPosition = useRef(new THREE.Vector3())

  const registerTarget = useCallback((id: number, target: THREE.Group | null) => {
    if (target) targetObjects.current.set(id, target)
    else targetObjects.current.delete(id)
  }, [])

  const handleTargetHit = useCallback(
    (id: number) => {
      if (hitTargetIds.current.has(id)) return
      hitTargetIds.current.add(id)

      const targetObject = targetObjects.current.get(id)
      if (targetObject) {
        applyTargetHit(targetObject)
        targetObject.getWorldPosition(hitWorldPosition.current)
        impactFXRef.current?.trigger(hitWorldPosition.current)
      }

      playHitSound()
      onScore()
      onHitFeedback?.()
      requestAnimationFrame(() => navigator.vibrate?.(28))

      const previousTimer = respawnTimers.current.get(id)
      if (previousTimer) clearTimeout(previousTimer)

      const timer = setTimeout(() => {
        const current = targetObjects.current.get(id)
        if (current) respawnTarget(current, settings.gameAreaSize)
        hitTargetIds.current.delete(id)
        respawnTimers.current.delete(id)
      }, 900)

      respawnTimers.current.set(id, timer)
    },
    [onHitFeedback, onScore, settings.gameAreaSize]
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
    onShot?.()

    raycaster.current.setFromCamera(screenCenter.current, camera)
    const objects = Array.from(targetObjects.current.values())
    const intersections = raycaster.current.intersectObjects(objects, true)

    for (const intersection of intersections) {
      let object: THREE.Object3D | null = intersection.object
      while (object && object.userData?.targetId === undefined) object = object.parent

      const targetId = object?.userData?.targetId
      if (typeof targetId === 'number' && !hitTargetIds.current.has(targetId)) {
        handleTargetHit(targetId)
        break
      }
    }
  }, [camera, gameStarted, handleTargetHit, onShot, showMuzzleFlash])

  const handleFallbackTargetClick = useCallback(
    (id: number) => {
      if (!gameStarted || !useFallbackControls || hitTargetIds.current.has(id)) return
      showMuzzleFlash()
      playShotSound()
      onShot?.()
      handleTargetHit(id)
    },
    [gameStarted, handleTargetHit, onShot, showMuzzleFlash, useFallbackControls]
  )

  useFrame((_, delta) => {
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
      <color attach="background" args={['#07141e']} />
      <fog attach="fog" args={['#07141e', 20, 58]} />

      <hemisphereLight args={['#b9e7ff', '#10202a', 1.15]} />
      <directionalLight
        position={[6, 12, 2]}
        intensity={2.2}
        color="#d9f3ff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={65}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={15}
        shadow-camera-bottom={-5}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -20]} receiveShadow>
        <planeGeometry args={[44, 80]} />
        <meshStandardMaterial color="#16232c" metalness={0.15} roughness={0.82} />
      </mesh>
      <gridHelper position={[0, -1.97, -20]} args={[80, 40, '#2b7688', '#24404b']} />

      <mesh position={[-18, 6, -24]}>
        <boxGeometry args={[0.4, 16, 56]} />
        <meshStandardMaterial color="#10232d" metalness={0.25} roughness={0.75} />
      </mesh>
      <mesh position={[18, 6, -24]}>
        <boxGeometry args={[0.4, 16, 56]} />
        <meshStandardMaterial color="#10232d" metalness={0.25} roughness={0.75} />
      </mesh>
      <mesh position={[0, 6, -48]}>
        <boxGeometry args={[36, 16, 0.5]} />
        <meshStandardMaterial color="#0b1b24" metalness={0.35} roughness={0.66} />
      </mesh>

      {[-11, -22, -33, -44].map(z => (
        <group key={z} position={[0, 10, z]}>
          <mesh>
            <boxGeometry args={[18, 0.12, 0.14]} />
            <meshBasicMaterial color="#7ce8ff" toneMapped={false} />
          </mesh>
          <pointLight intensity={1.25} distance={11} color="#7ce8ff" />
        </group>
      ))}

      {[-6, 6].map(x => (
        <mesh key={x} position={[x, -1.2, -21]}>
          <boxGeometry args={[0.12, 1.6, 48]} />
          <meshStandardMaterial color="#233744" metalness={0.55} roughness={0.42} />
        </mesh>
      ))}

      {targets.map(target => (
        <Target
          key={target.id}
          id={target.id}
          position={target.position}
          direction={target.direction}
          speed={target.speed}
          gameAreaSize={settings.gameAreaSize}
          scale={target.scale}
          onReady={registerTarget}
          onClick={handleFallbackTargetClick}
        />
      ))}

      <ImpactFX ref={impactFXRef} />
      <FPSWeapon muzzleFlashRef={muzzleFlashRef} />
    </>
  )
}
