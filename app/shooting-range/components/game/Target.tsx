import { memo, useEffect, useRef } from 'react'
import { ThreeEvent, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { TargetMovement } from '../../utils/trainingModes'

interface TargetProps {
  position: [number, number, number]
  direction: [number, number, number]
  speed: number
  gameAreaSize: number
  scale: number
  movement: TargetMovement
  jitterChance: number
  faceCamera: boolean
  orbitRadius: number
  orbitSpeed: number
  onClick: (id: number) => void
  onReady?: (id: number, target: THREE.Group | null) => void
  id: number
}

const plateIdleColor = new THREE.Color('#e8f0f7')
const plateHitColor = new THREE.Color('#ff3b3b')
const plateIdleEmissive = new THREE.Color('#07131d')
const plateHitEmissive = new THREE.Color('#7f1010')
const ringIdleColor = new THREE.Color('#1d9bf0')
const ringHitColor = new THREE.Color('#ffb020')
const innerIdleColor = new THREE.Color('#102a3c')
const innerHitColor = new THREE.Color('#fff1c2')
const centerIdleColor = new THREE.Color('#ff9f1c')
const centerHitColor = new THREE.Color('#ffffff')

function applyTargetLook(
  hit: boolean,
  plate: THREE.MeshStandardMaterial | null,
  ring: THREE.MeshBasicMaterial | null,
  inner: THREE.MeshBasicMaterial | null,
  center: THREE.MeshBasicMaterial | null
) {
  if (!plate || !ring || !inner || !center) return
  plate.color.copy(hit ? plateHitColor : plateIdleColor)
  plate.emissive.copy(hit ? plateHitEmissive : plateIdleEmissive)
  plate.emissiveIntensity = hit ? 2.5 : 0.35
  ring.color.copy(hit ? ringHitColor : ringIdleColor)
  inner.color.copy(hit ? innerHitColor : innerIdleColor)
  center.color.copy(hit ? centerHitColor : centerIdleColor)
}

/** A moving range drone. Movement is applied directly to Three.js objects. */
function TargetComponent({
  position,
  direction,
  speed,
  gameAreaSize,
  scale,
  movement,
  jitterChance,
  faceCamera,
  orbitRadius,
  orbitSpeed,
  onClick,
  onReady,
  id,
}: TargetProps) {
  const rootRef = useRef<THREE.Group>(null)
  const visualRef = useRef<THREE.Group>(null)
  const plateMaterialRef = useRef<THREE.MeshStandardMaterial>(null)
  const ringMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const innerMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const centerMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const directionRef = useRef(new THREE.Vector3(...direction).normalize())
  const jitterRef = useRef(new THREE.Vector3())
  const orbitAnchor = useRef(new THREE.Vector3(...position))
  const hitElapsed = useRef(0)
  const previousHit = useRef(false)
  const spawnPulse = useRef(1)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    root.userData.targetId = id
    root.userData.isTarget = true
    root.userData.hit = false
    root.userData.direction = directionRef.current
    root.userData.spawnedAt = performance.now()
    root.userData.orbitAnchor = orbitAnchor.current
    orbitAnchor.current.set(...position)
    spawnPulse.current = 1.35
    onReady?.(id, root)
    return () => onReady?.(id, null)
  }, [id, onReady, position])

  useFrame(({ camera }, delta) => {
    const root = rootRef.current
    const visual = visualRef.current
    if (!root || !visual) return

    const hit = root.userData.hit === true
    if (previousHit.current !== hit) {
      previousHit.current = hit
      hitElapsed.current = 0
      visual.visible = true
      if (!hit) spawnPulse.current = 1.35
      applyTargetLook(
        hit,
        plateMaterialRef.current,
        ringMaterialRef.current,
        innerMaterialRef.current,
        centerMaterialRef.current
      )
    }

    if (!hit) {
      if (movement === 'orbit' && orbitRadius > 0) {
        const time = performance.now() * 0.001 * orbitSpeed + id * 1.7
        root.position.set(
          orbitAnchor.current.x + Math.cos(time) * orbitRadius,
          orbitAnchor.current.y + Math.sin(time * 0.85) * orbitRadius * 0.42,
          orbitAnchor.current.z + Math.sin(time * 1.1) * orbitRadius * 0.55
        )
      } else if (movement === 'linear' && speed > 0) {
        const directionVector = directionRef.current
        root.position.addScaledVector(directionVector, speed * 60 * delta)

        const halfWidth = gameAreaSize * 0.42
        const minY = 0.8
        const maxY = Math.min(9, gameAreaSize * 0.42 + 2)
        const nearZ = -7
        const farZ = -(gameAreaSize + 9)

        if (root.position.x < -halfWidth || root.position.x > halfWidth) directionVector.x *= -1
        if (root.position.y < minY || root.position.y > maxY) directionVector.y *= -1
        if (root.position.z > nearZ || root.position.z < farZ) directionVector.z *= -1

        root.position.x = THREE.MathUtils.clamp(root.position.x, -halfWidth, halfWidth)
        root.position.y = THREE.MathUtils.clamp(root.position.y, minY, maxY)
        root.position.z = THREE.MathUtils.clamp(root.position.z, farZ, nearZ)

        if (jitterChance > 0 && Math.random() < delta * jitterChance) {
          jitterRef.current.set((Math.random() - 0.5) * 0.55, (Math.random() - 0.5) * 0.35, 0)
          directionVector.add(jitterRef.current).normalize()
        }
      }

      spawnPulse.current = THREE.MathUtils.lerp(spawnPulse.current, 1, delta * 6)
      const pulse =
        movement === 'static'
          ? spawnPulse.current
          : 1 + Math.sin(performance.now() * 0.004 + id) * 0.025
      visual.scale.setScalar(pulse)
    } else {
      hitElapsed.current += delta
      const impactScale = Math.max(0.001, 1 + hitElapsed.current * 2 - hitElapsed.current ** 2 * 45)
      visual.scale.setScalar(impactScale)
      visual.visible = hitElapsed.current < 0.15
    }

    if (faceCamera) root.lookAt(camera.position)
  })

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (!rootRef.current?.userData.hit) onClick(id)
  }

  return (
    <group
      ref={rootRef}
      position={position}
      scale={scale}
      onClick={handleClick}
    >
      <group ref={visualRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[1.05, 1.05, 0.16, 32]} />
          <meshStandardMaterial color="#142738" metalness={0.8} roughness={0.28} />
        </mesh>

        <mesh position={[0, 0, 0.095]}>
          <ringGeometry args={[0.88, 0.98, 32]} />
          <meshBasicMaterial color="#0a1520" toneMapped={false} />
        </mesh>

        <mesh position={[0, 0, 0.1]}>
          <circleGeometry args={[0.91, 32]} />
          <meshStandardMaterial
            ref={plateMaterialRef}
            color="#e8f0f7"
            emissive="#07131d"
            emissiveIntensity={0.35}
            roughness={0.5}
          />
        </mesh>

        <mesh position={[0, 0, 0.115]}>
          <ringGeometry args={[0.55, 0.73, 32]} />
          <meshBasicMaterial ref={ringMaterialRef} color="#1d9bf0" toneMapped={false} />
        </mesh>

        <mesh position={[0, 0, 0.125]}>
          <circleGeometry args={[0.33, 32]} />
          <meshBasicMaterial ref={innerMaterialRef} color="#102a3c" toneMapped={false} />
        </mesh>

        <mesh position={[0, 0, 0.135]}>
          <circleGeometry args={[0.13, 24]} />
          <meshBasicMaterial ref={centerMaterialRef} color="#ff9f1c" toneMapped={false} />
        </mesh>

        <mesh position={[-1.18, 0, 0]}>
          <boxGeometry args={[0.24, 0.42, 0.22]} />
          <meshStandardMaterial color="#263d4d" metalness={0.75} roughness={0.3} />
        </mesh>
        <mesh position={[1.18, 0, 0]}>
          <boxGeometry args={[0.24, 0.42, 0.22]} />
          <meshStandardMaterial color="#263d4d" metalness={0.75} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

export const Target = memo(TargetComponent)
