import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  IMPACT_DURATION,
  IMPACT_SLOT_COUNT,
  createPackedBurst,
  nextImpactSlot,
  resetBurst,
  stepBurst,
} from '../../utils/impactFx'
import { motionParticleScale } from '../../utils/motionPrefs'

export type ImpactFXHandle = {
  trigger: (position: THREE.Vector3) => void
}

interface ImpactFXProps {
  reducedMotion?: boolean
}

/** Prewarmed particle bursts. Triggering never mounts lights or geometries. */
export const ImpactFX = forwardRef<ImpactFXHandle, ImpactFXProps>(function ImpactFX(
  { reducedMotion = false },
  ref
) {
  const particleScale = motionParticleScale(reducedMotion)
  const pointsRefs = useRef<Array<THREE.Points | null>>(Array(IMPACT_SLOT_COUNT).fill(null))
  const materialRefs = useRef<Array<THREE.PointsMaterial | null>>(
    Array(IMPACT_SLOT_COUNT).fill(null)
  )
  const elapsed = useRef(new Float32Array(IMPACT_SLOT_COUNT))
  const active = useRef(Array<boolean>(IMPACT_SLOT_COUNT).fill(false))
  const nextSlot = useRef(0)
  const bursts = useMemo(
    () => Array.from({ length: IMPACT_SLOT_COUNT }, () => createPackedBurst()),
    []
  )

  useImperativeHandle(ref, () => ({
    trigger(position: THREE.Vector3) {
      const index = nextSlot.current
      nextSlot.current = nextImpactSlot(index)

      const points = pointsRefs.current[index]
      const material = materialRefs.current[index]
      const burst = bursts[index]
      if (!points || !material) return

      resetBurst(burst)
      const positionAttribute = points.geometry.getAttribute('position')
      positionAttribute.needsUpdate = true
      points.position.copy(position)
      points.visible = true
      material.opacity = particleScale
      material.size = 0.11 * particleScale
      elapsed.current[index] = 0
      active.current[index] = true
    },
  }))

  useFrame((_, delta) => {
    for (let index = 0; index < IMPACT_SLOT_COUNT; index += 1) {
      if (!active.current[index]) continue

      const points = pointsRefs.current[index]
      const material = materialRefs.current[index]
      if (!points || !material) continue

      elapsed.current[index] += delta
      const burst = bursts[index]
      stepBurst(burst.positions, burst.velocities, delta)
      const positionAttribute = points.geometry.getAttribute('position')
      positionAttribute.needsUpdate = true
      material.opacity = Math.max(0, particleScale * (1 - elapsed.current[index] / IMPACT_DURATION))

      if (elapsed.current[index] >= IMPACT_DURATION) {
        active.current[index] = false
        points.visible = false
      }
    }
  })

  return (
    <>
      {bursts.map((burst, index) => (
        <points
          key={index}
          ref={node => {
            pointsRefs.current[index] = node as THREE.Points | null
          }}
          visible={false}
          frustumCulled={false}
        >
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[burst.positions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            ref={node => {
              materialRefs.current[index] = node
            }}
            color="#fff8e8"
            size={0.11}
            sizeAttenuation
            transparent
            opacity={1}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      ))}
    </>
  )
})
