import { useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { TrainingModeId } from '../../types'
import { getTargetAppearance } from '../../utils/targetAppearance'

const BODY_COLOR = '#5a6a78'
const HEAD_COLOR = '#7ce8ff'
const LIMB_COLOR = '#4a5a68'
const ACCENT_COLOR = '#ffb347'

interface HumanoidVisualProps {
  modeId: TrainingModeId
  hit: boolean
  crouchScaleRef: MutableRefObject<number>
}

/** Original low-poly training-bot silhouette — not based on any commercial IP. */
export function HumanoidVisual({ modeId, hit, crouchScaleRef }: HumanoidVisualProps) {
  const bodyRef = useRef<THREE.Group>(null)
  const appearance = useMemo(() => getTargetAppearance(modeId), [modeId])
  const accent = appearance.ringColor

  useFrame(() => {
    if (bodyRef.current) {
      bodyRef.current.scale.y = crouchScaleRef.current
    }
  })

  const headHit = hit ? '#ff7070' : HEAD_COLOR
  const bodyHit = hit ? '#ff5050' : BODY_COLOR
  const limbHit = hit ? '#e84848' : LIMB_COLOR

  return (
    <group ref={bodyRef}>
      {/* Head */}
      <mesh position={[0, 1.62, 0]} userData={{ hitZone: 'head' }}>
        <boxGeometry args={[0.38, 0.38, 0.38]} />
        <meshBasicMaterial color={headHit} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.82, 0]} userData={{ hitZone: 'head' }}>
        <boxGeometry args={[0.22, 0.12, 0.22]} />
        <meshBasicMaterial color={hit ? '#ffd0d0' : accent} toneMapped={false} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 1.05, 0]} userData={{ hitZone: 'body' }}>
        <boxGeometry args={[0.62, 0.82, 0.34]} />
        <meshBasicMaterial color={bodyHit} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.18, 0.1]} userData={{ hitZone: 'body' }}>
        <boxGeometry args={[0.28, 0.28, 0.06]} />
        <meshBasicMaterial color={hit ? '#fff0c8' : ACCENT_COLOR} transparent opacity={0.85} toneMapped={false} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.42, 1.02, 0]} userData={{ hitZone: 'limb' }}>
        <boxGeometry args={[0.16, 0.62, 0.16]} />
        <meshBasicMaterial color={limbHit} toneMapped={false} />
      </mesh>
      <mesh position={[0.42, 1.02, 0]} userData={{ hitZone: 'limb' }}>
        <boxGeometry args={[0.16, 0.62, 0.16]} />
        <meshBasicMaterial color={limbHit} toneMapped={false} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.18, 0.38, 0]} userData={{ hitZone: 'limb' }}>
        <boxGeometry args={[0.2, 0.72, 0.2]} />
        <meshBasicMaterial color={limbHit} toneMapped={false} />
      </mesh>
      <mesh position={[0.18, 0.38, 0]} userData={{ hitZone: 'limb' }}>
        <boxGeometry args={[0.2, 0.72, 0.2]} />
        <meshBasicMaterial color={limbHit} toneMapped={false} />
      </mesh>

      {/* Base shadow disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.55, 16]} />
        <meshBasicMaterial color="#0a1018" transparent opacity={0.35} toneMapped={false} depthWrite={false} />
      </mesh>

      {/* Shoulder pads */}
      <mesh position={[-0.34, 1.38, 0]} userData={{ hitZone: 'body' }}>
        <boxGeometry args={[0.14, 0.18, 0.22]} />
        <meshBasicMaterial color={bodyHit} toneMapped={false} />
      </mesh>
      <mesh position={[0.34, 1.38, 0]} userData={{ hitZone: 'body' }}>
        <boxGeometry args={[0.14, 0.18, 0.22]} />
        <meshBasicMaterial color={bodyHit} toneMapped={false} />
      </mesh>
    </group>
  )
}
