import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ExplosionProps {
  position: [number, number, number]
  color: string
}

const PARTICLE_COUNT = 18

function createBurst() {
  const positions = new Float32Array(PARTICLE_COUNT * 3)
  const velocities = Array.from({ length: PARTICLE_COUNT }, () =>
    new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.25) * 2,
      (Math.random() - 0.5) * 2
    )
      .normalize()
      .multiplyScalar(Math.random() * 4 + 3)
  )

  return { positions, velocities }
}

/** One geometry and one material per impact, animated without React state. */
export function Explosion({ position, color }: ExplosionProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.PointsMaterial>(null)
  const elapsed = useRef(0)
  const burst = useMemo(() => createBurst(), [])

  useFrame((_, delta) => {
    if (!pointsRef.current || !materialRef.current || elapsed.current > 0.55) return

    elapsed.current += delta
    const positionAttribute = pointsRef.current.geometry.getAttribute('position')
    const values = positionAttribute.array as Float32Array

    burst.velocities.forEach((velocity, index) => {
      const offset = index * 3
      values[offset] += velocity.x * delta
      values[offset + 1] += velocity.y * delta
      values[offset + 2] += velocity.z * delta
      velocity.y -= 4.5 * delta
    })

    positionAttribute.needsUpdate = true
    materialRef.current.opacity = Math.max(0, 1 - elapsed.current / 0.55)
    pointsRef.current.visible = elapsed.current < 0.55
  })

  return (
    <points ref={pointsRef} position={position} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[burst.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        color={color}
        size={0.16}
        sizeAttenuation
        transparent
        opacity={1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
