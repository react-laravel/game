import { useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { TrainingModeId } from '../../types'
import type { BotMotionSample } from '../../utils/humanoidMotion'
import { getTargetAppearance } from '../../utils/targetAppearance'

const BODY_COLOR = '#5a6a78'
const HEAD_COLOR = '#7ce8ff'
const LIMB_COLOR = '#4a5a68'
const ACCENT_COLOR = '#ffb347'

const DEFAULT_MOTION: BotMotionSample = {
  offsetX: 0,
  offsetY: 0,
  offsetZ: 0,
  crouchScale: 1,
  phaseT: 0,
  phase: 'strafe',
  leanX: 0,
  leanZ: 0,
  legSpread: 0,
  armSwing: 0,
}

interface HumanoidVisualProps {
  modeId: TrainingModeId
  hit: boolean
  crouchScaleRef: MutableRefObject<number>
  motionRef: MutableRefObject<BotMotionSample>
}

/** Original low-poly training-bot silhouette — not based on any commercial IP. */
export function HumanoidVisual({ modeId, hit, crouchScaleRef, motionRef }: HumanoidVisualProps) {
  const torsoRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const appearance = useMemo(() => getTargetAppearance(modeId), [modeId])
  const accent = appearance.ringColor

  useFrame(() => {
    const motion = motionRef.current ?? DEFAULT_MOTION
    const crouch = crouchScaleRef.current
    const spread = motion.legSpread

    if (torsoRef.current) {
      torsoRef.current.position.y = THREE.MathUtils.lerp(1.02, 0.72, 1 - crouch)
      torsoRef.current.rotation.z = motion.leanX * 0.22
      torsoRef.current.rotation.x = motion.leanZ * 0.18
    }

    const legBend = (1 - crouch) * 0.55 + spread * 0.35
    const legX = 0.18 + spread * 0.12

    if (leftLegRef.current) {
      leftLegRef.current.position.set(-legX, 0.38 - spread * 0.08, 0)
      leftLegRef.current.rotation.x = legBend
    }
    if (rightLegRef.current) {
      rightLegRef.current.position.set(legX, 0.38 - spread * 0.08, 0)
      rightLegRef.current.rotation.x = legBend
    }

    const armLift = motion.armSwing * 0.28
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = -armLift
      leftArmRef.current.position.x = -0.48
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = armLift
      rightArmRef.current.position.x = 0.48
    }
  })

  const headHit = hit ? '#ff7070' : HEAD_COLOR
  const bodyHit = hit ? '#ff5050' : BODY_COLOR
  const limbHit = hit ? '#e84848' : LIMB_COLOR

  return (
    <group>
      {/* Legs — wider hip stance, bend on crouch/jump */}
      <group ref={leftLegRef} position={[-0.18, 0.38, 0]}>
        <mesh userData={{ hitZone: 'limb' }}>
          <boxGeometry args={[0.22, 0.74, 0.22]} />
          <meshBasicMaterial color={limbHit} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.42, 0.04]} userData={{ hitZone: 'limb' }}>
          <boxGeometry args={[0.2, 0.38, 0.24]} />
          <meshBasicMaterial color={limbHit} toneMapped={false} />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.18, 0.38, 0]}>
        <mesh userData={{ hitZone: 'limb' }}>
          <boxGeometry args={[0.22, 0.74, 0.22]} />
          <meshBasicMaterial color={limbHit} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.42, 0.04]} userData={{ hitZone: 'limb' }}>
          <boxGeometry args={[0.2, 0.38, 0.24]} />
          <meshBasicMaterial color={limbHit} toneMapped={false} />
        </mesh>
      </group>

      {/* Hip block — wider than legs, narrower than shoulders */}
      <mesh position={[0, 0.78, 0]} userData={{ hitZone: 'body' }}>
        <boxGeometry args={[0.58, 0.22, 0.32]} />
        <meshBasicMaterial color={bodyHit} toneMapped={false} />
      </mesh>

      <group ref={torsoRef} position={[0, 1.02, 0]}>
        {/* Torso — tapered: wider chest, narrower waist */}
        <mesh position={[0, 0.08, 0]} userData={{ hitZone: 'body' }}>
          <boxGeometry args={[0.68, 0.88, 0.36]} />
          <meshBasicMaterial color={bodyHit} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.22, 0]} userData={{ hitZone: 'body' }}>
          <boxGeometry args={[0.52, 0.28, 0.32]} />
          <meshBasicMaterial color={bodyHit} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.22, 0.1]} userData={{ hitZone: 'body' }}>
          <boxGeometry args={[0.3, 0.3, 0.06]} />
          <meshBasicMaterial color={hit ? '#fff0c8' : ACCENT_COLOR} transparent opacity={0.85} toneMapped={false} />
        </mesh>

        {/* Shoulder pads — broad read at range */}
        <mesh position={[-0.4, 0.42, 0]} userData={{ hitZone: 'body' }}>
          <boxGeometry args={[0.2, 0.2, 0.26]} />
          <meshBasicMaterial color={bodyHit} toneMapped={false} />
        </mesh>
        <mesh position={[0.4, 0.42, 0]} userData={{ hitZone: 'body' }}>
          <boxGeometry args={[0.2, 0.2, 0.26]} />
          <meshBasicMaterial color={bodyHit} toneMapped={false} />
        </mesh>

        {/* Arms */}
        <group ref={leftArmRef} position={[-0.48, 0.02, 0]}>
          <mesh userData={{ hitZone: 'limb' }}>
            <boxGeometry args={[0.18, 0.64, 0.18]} />
            <meshBasicMaterial color={limbHit} toneMapped={false} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.48, 0.02, 0]}>
          <mesh userData={{ hitZone: 'limb' }}>
            <boxGeometry args={[0.18, 0.64, 0.18]} />
            <meshBasicMaterial color={limbHit} toneMapped={false} />
          </mesh>
        </group>

        {/* Head */}
        <mesh position={[0, 0.72, 0]} userData={{ hitZone: 'head' }}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshBasicMaterial color={headHit} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.92, 0]} userData={{ hitZone: 'head' }}>
          <boxGeometry args={[0.24, 0.12, 0.24]} />
          <meshBasicMaterial color={hit ? '#ffd0d0' : accent} toneMapped={false} />
        </mesh>
      </group>

      {/* Base shadow disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.58, 16]} />
        <meshBasicMaterial color="#0a1018" transparent opacity={0.35} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  )
}
