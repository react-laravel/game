import { MutableRefObject, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { PointerLockControls as PointerLockControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { Target } from './Target'
import { FPSWeapon } from './FPSWeapon'
import {
  difficultySettings,
  generateRandomDirection,
  generateRandomPosition,
} from '../../utils/gameUtils'
import { playHitSound, playShotSound } from '../../utils/audioUtils'

interface TargetData {
  id: number
  position: [number, number, number]
  hit: boolean
  scale: number
  speed: number
  direction: [number, number, number]
}

export interface ShootingSceneSnapshot {
  targets: Array<{ id: number; x: number; y: number; z: number; hit: boolean }>
}

function createTargets(settings: (typeof difficultySettings)[keyof typeof difficultySettings]) {
  return Array.from({ length: settings.targetCount }, (_, id): TargetData => ({
    id,
    position: generateRandomPosition(settings.gameAreaSize),
    hit: false,
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
  onError?: (message: string) => void
  sceneStateRef?: MutableRefObject<ShootingSceneSnapshot>
}

/** The render loop only mutates Three.js objects; React state changes on discrete game events. */
export function GameScene({
  difficulty,
  onScore,
  onShot,
  onHitFeedback,
  gameStarted,
  setGameStarted,
  useFallbackControls = false,
  onError,
  sceneStateRef,
}: GameSceneProps) {
  const { camera, gl } = useThree()
  const controls = useRef<PointerLockControlsImpl | null>(null)
  const settings = difficultySettings[difficulty]
  const [targets, setTargets] = useState<TargetData[]>(() => createTargets(settings))
  const targetObjects = useRef(new Map<number, THREE.Group>())
  const hitTargetIds = useRef(new Set<number>())
  const respawnTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>())
  const raycaster = useRef(new THREE.Raycaster())
  const screenCenter = useRef(new THREE.Vector2(0, 0))
  const nextShotAt = useRef(0)
  const muzzleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const snapshotElapsed = useRef(0)
  const [muzzleFlash, setMuzzleFlash] = useState(false)

  const registerTarget = useCallback((id: number, target: THREE.Group | null) => {
    if (target) targetObjects.current.set(id, target)
    else targetObjects.current.delete(id)
  }, [])

  const handleTargetHit = useCallback(
    (id: number) => {
      if (hitTargetIds.current.has(id)) return
      hitTargetIds.current.add(id)

      setTargets(previous =>
        previous.map(target => (target.id === id ? { ...target, hit: true } : target))
      )
      playHitSound()
      navigator.vibrate?.(28)
      onScore()
      onHitFeedback?.()

      const previousTimer = respawnTimers.current.get(id)
      if (previousTimer) clearTimeout(previousTimer)

      const timer = setTimeout(() => {
        setTargets(previous =>
          previous.map(target =>
            target.id === id
              ? {
                  ...target,
                  position: generateRandomPosition(settings.gameAreaSize),
                  direction: generateRandomDirection(),
                  hit: false,
                }
              : target
          )
        )
        hitTargetIds.current.delete(id)
        respawnTimers.current.delete(id)
      }, 900)

      respawnTimers.current.set(id, timer)
    },
    [onHitFeedback, onScore, settings.gameAreaSize]
  )

  const showMuzzleFlash = useCallback(() => {
    if (muzzleTimer.current) clearTimeout(muzzleTimer.current)
    setMuzzleFlash(true)
    muzzleTimer.current = setTimeout(() => setMuzzleFlash(false), 55)
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

    sceneStateRef.current.targets = targets.map(target => {
      const position = targetObjects.current.get(target.id)?.position
      return {
        id: target.id,
        x: Number((position?.x ?? target.position[0]).toFixed(2)),
        y: Number((position?.y ?? target.position[1]).toFixed(2)),
        z: Number((position?.z ?? target.position[2]).toFixed(2)),
        hit: target.hit,
      }
    })
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
    if (!gameStarted || useFallbackControls || !controls.current) return
    const timer = setTimeout(() => {
      try {
        controls.current?.lock()
      } catch (error) {
        console.error('锁定指针失败:', error)
        onError?.('无法锁定鼠标指针，请尝试使用备用控制模式')
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [gameStarted, onError, useFallbackControls])

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

      {!useFallbackControls && gameStarted && (
        <Suspense fallback={null}>
          <PointerLockControls ref={controls} />
        </Suspense>
      )}

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
          hit={target.hit}
          scale={target.scale}
          onReady={registerTarget}
          onClick={handleFallbackTargetClick}
        />
      ))}

      <FPSWeapon muzzleFlash={muzzleFlash} />
    </>
  )
}
