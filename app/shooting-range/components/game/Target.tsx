import { memo, useEffect, useRef } from 'react'
import { ThreeEvent, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Explosion } from './Explosion'

interface TargetProps {
  position: [number, number, number]
  direction: [number, number, number]
  speed: number
  gameAreaSize: number
  hit: boolean
  scale: number
  onClick: (id: number) => void
  onReady?: (id: number, target: THREE.Group | null) => void
  id: number
}

/** A moving range drone. Movement is applied directly to Three.js objects. */
function TargetComponent({
  position,
  direction,
  speed,
  gameAreaSize,
  hit,
  scale,
  onClick,
  onReady,
  id,
}: TargetProps) {
  const rootRef = useRef<THREE.Group>(null)
  const visualRef = useRef<THREE.Group>(null)
  const directionRef = useRef(new THREE.Vector3(...direction).normalize())
  const hitElapsed = useRef(0)
  const previousHit = useRef(hit)

  useEffect(() => {
    if (!rootRef.current) return
    rootRef.current.userData.targetId = id
    rootRef.current.userData.isTarget = true
    onReady?.(id, rootRef.current)
    return () => onReady?.(id, null)
  }, [id, onReady])

  useFrame(({ camera }, delta) => {
    const root = rootRef.current
    const visual = visualRef.current
    if (!root || !visual) return

    if (previousHit.current !== hit) {
      previousHit.current = hit
      hitElapsed.current = 0
      visual.visible = true
    }

    if (!hit) {
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

      if (Math.random() < delta * 0.3) {
        directionVector
          .add(new THREE.Vector3((Math.random() - 0.5) * 0.35, (Math.random() - 0.5) * 0.2, 0))
          .normalize()
      }

      const pulse = 1 + Math.sin(performance.now() * 0.004 + id) * 0.025
      visual.scale.setScalar(pulse)
    } else {
      hitElapsed.current += delta
      const impactScale = Math.max(0.001, 1 + hitElapsed.current * 2 - hitElapsed.current ** 2 * 45)
      visual.scale.setScalar(impactScale)
      visual.visible = hitElapsed.current < 0.15
    }

    root.lookAt(camera.position)
  })

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (!hit) onClick(id)
  }

  return (
    <group
      ref={rootRef}
      position={position}
      scale={scale}
      onClick={handleClick}
      userData={{ targetId: id, isTarget: true, hit }}
    >
      <group ref={visualRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[1.05, 1.05, 0.16, 32]} />
          <meshStandardMaterial color="#142738" metalness={0.8} roughness={0.28} />
        </mesh>

        <mesh position={[0, 0, 0.1]}>
          <circleGeometry args={[0.91, 32]} />
          <meshStandardMaterial
            color={hit ? '#ff3b3b' : '#e8f0f7'}
            emissive={hit ? '#7f1010' : '#07131d'}
            emissiveIntensity={hit ? 2.5 : 0.35}
            roughness={0.5}
          />
        </mesh>

        <mesh position={[0, 0, 0.115]}>
          <ringGeometry args={[0.55, 0.73, 32]} />
          <meshBasicMaterial color={hit ? '#ffb020' : '#1d9bf0'} toneMapped={false} />
        </mesh>

        <mesh position={[0, 0, 0.125]}>
          <circleGeometry args={[0.33, 32]} />
          <meshBasicMaterial color={hit ? '#fff1c2' : '#102a3c'} toneMapped={false} />
        </mesh>

        <mesh position={[0, 0, 0.135]}>
          <circleGeometry args={[0.13, 24]} />
          <meshBasicMaterial color={hit ? '#ffffff' : '#ff9f1c'} toneMapped={false} />
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

      {hit && (
        <>
          <Explosion position={[0, 0, 0.3]} color="#ffb020" />
          <pointLight position={[0, 0, 0.5]} intensity={2.5} distance={4} color="#ff8a00" />
        </>
      )}
    </group>
  )
}

export const Target = memo(TargetComponent)
