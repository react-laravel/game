import { useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { TrainingModeId } from '../../types'
import type { BotMotionSample } from '../../utils/humanoidMotion'
import { getTargetAppearance } from '../../utils/targetAppearance'

const BODY_COLOR = '#3c444c'
const HEAD_COLOR = '#c4a878'
const LIMB_COLOR = '#343c44'
const ACCENT_COLOR = '#a87848'
const MATTE = { metalness: 0.05, roughness: 0.9 }

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
  strideBob: 0,
  headTiltX: 0,
  headTiltZ: 0,
}

interface HumanoidVisualProps {
  modeId: TrainingModeId
  hit: boolean
  lowLightBoost?: number
  crouchScaleRef: MutableRefObject<number>
  motionRef: MutableRefObject<BotMotionSample>
}

function matteProps(color: string) {
  return { color, metalness: MATTE.metalness, roughness: MATTE.roughness }
}

/** Original low-poly training-bot silhouette — not based on any commercial IP. */
export function HumanoidVisual({ modeId, hit, lowLightBoost = 0, crouchScaleRef, motionRef }: HumanoidVisualProps) {
  const nightBoost = Math.max(0, Math.min(1, lowLightBoost))
  const torsoRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const appearance = useMemo(() => getTargetAppearance(modeId), [modeId])
  const accent = appearance.ringColor

  useFrame((_, delta) => {
    const motion = motionRef.current ?? DEFAULT_MOTION
    const crouch = crouchScaleRef.current
    const spread = motion.legSpread
    const lerpT = Math.min(1, delta * 14)

    if (torsoRef.current) {
      const targetY = THREE.MathUtils.lerp(1.02, 0.72, 1 - crouch)
      torsoRef.current.position.y = THREE.MathUtils.lerp(torsoRef.current.position.y, targetY, lerpT)
      torsoRef.current.rotation.z = THREE.MathUtils.lerp(torsoRef.current.rotation.z, motion.leanX * 0.22, lerpT)
      torsoRef.current.rotation.x = THREE.MathUtils.lerp(torsoRef.current.rotation.x, motion.leanZ * 0.18, lerpT)
    }

    if (headRef.current) {
      headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, motion.headTiltX * 0.28, lerpT)
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, motion.headTiltZ * 0.22, lerpT)
    }

    const legBend = (1 - crouch) * 0.55 + spread * 0.35
    const legX = 0.18 + spread * 0.12
    const gait = motion.armSwing

    if (leftLegRef.current) {
      leftLegRef.current.position.set(-legX, 0.38 - spread * 0.08, 0)
      leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, legBend + gait * 0.32, lerpT)
    }
    if (rightLegRef.current) {
      rightLegRef.current.position.set(legX, 0.38 - spread * 0.08, 0)
      rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, legBend - gait * 0.32, lerpT)
    }

    const armLift = gait * 0.32
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -armLift, lerpT)
      leftArmRef.current.position.x = -0.48
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, armLift, lerpT)
      rightArmRef.current.position.x = 0.48
    }
  })

  const headIdle = nightBoost > 0 ? '#d0b890' : HEAD_COLOR
  const bodyIdle = nightBoost > 0 ? '#4a5258' : BODY_COLOR
  const limbIdle = nightBoost > 0 ? '#424a50' : LIMB_COLOR
  const headHit = hit ? '#d85858' : headIdle
  const bodyHit = hit ? '#c84848' : bodyIdle
  const limbHit = hit ? '#b04040' : limbIdle

  return (
    <group>
      <group ref={leftLegRef} position={[-0.18, 0.38, 0]}>
        <mesh userData={{ hitZone: 'limb' }}>
          <boxGeometry args={[0.22, 0.74, 0.22]} />
          <meshStandardMaterial {...matteProps(limbHit)} />
        </mesh>
        <mesh position={[0, -0.42, 0.04]} userData={{ hitZone: 'limb' }}>
          <boxGeometry args={[0.2, 0.38, 0.24]} />
          <meshStandardMaterial {...matteProps(limbHit)} />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.18, 0.38, 0]}>
        <mesh userData={{ hitZone: 'limb' }}>
          <boxGeometry args={[0.22, 0.74, 0.22]} />
          <meshStandardMaterial {...matteProps(limbHit)} />
        </mesh>
        <mesh position={[0, -0.42, 0.04]} userData={{ hitZone: 'limb' }}>
          <boxGeometry args={[0.2, 0.38, 0.24]} />
          <meshStandardMaterial {...matteProps(limbHit)} />
        </mesh>
      </group>

      <mesh position={[0, 0.78, 0]} userData={{ hitZone: 'body' }}>
        <boxGeometry args={[0.58, 0.22, 0.32]} />
        <meshStandardMaterial {...matteProps(bodyHit)} />
      </mesh>

      <group ref={torsoRef} position={[0, 1.02, 0]}>
        <mesh position={[0, 0.08, 0]} userData={{ hitZone: 'body' }}>
          <boxGeometry args={[0.68, 0.88, 0.36]} />
          <meshStandardMaterial {...matteProps(bodyHit)} />
        </mesh>
        <mesh position={[0, -0.22, 0]} userData={{ hitZone: 'body' }}>
          <boxGeometry args={[0.52, 0.28, 0.32]} />
          <meshStandardMaterial {...matteProps(bodyHit)} />
        </mesh>
        <mesh position={[0, 0.22, 0.1]} userData={{ hitZone: 'body' }}>
          <boxGeometry args={[0.3, 0.3, 0.06]} />
          <meshStandardMaterial
            color={hit ? '#e8d8b8' : ACCENT_COLOR}
            metalness={0.04}
            roughness={0.88}
          />
        </mesh>

        <mesh position={[-0.4, 0.42, 0]} userData={{ hitZone: 'body' }}>
          <boxGeometry args={[0.2, 0.2, 0.26]} />
          <meshStandardMaterial {...matteProps(bodyHit)} />
        </mesh>
        <mesh position={[0.4, 0.42, 0]} userData={{ hitZone: 'body' }}>
          <boxGeometry args={[0.2, 0.2, 0.26]} />
          <meshStandardMaterial {...matteProps(bodyHit)} />
        </mesh>

        <group ref={leftArmRef} position={[-0.48, 0.02, 0]}>
          <mesh userData={{ hitZone: 'limb' }}>
            <boxGeometry args={[0.18, 0.64, 0.18]} />
            <meshStandardMaterial {...matteProps(limbHit)} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.48, 0.02, 0]}>
          <mesh userData={{ hitZone: 'limb' }}>
            <boxGeometry args={[0.18, 0.64, 0.18]} />
            <meshStandardMaterial {...matteProps(limbHit)} />
          </mesh>
        </group>

        <group ref={headRef} position={[0, 0.72, 0]}>
          <mesh userData={{ hitZone: 'head' }}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial {...matteProps(headHit)} />
          </mesh>
          <mesh position={[0, 0.2, 0]} userData={{ hitZone: 'head' }}>
            <boxGeometry args={[0.24, 0.12, 0.24]} />
            <meshStandardMaterial
              color={hit ? '#e8c8c8' : accent}
              metalness={0.04}
              roughness={0.88}
            />
          </mesh>
        </group>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.58, 16]} />
        <meshStandardMaterial color="#0a1018" transparent opacity={0.32} metalness={0} roughness={1} depthWrite={false} />
      </mesh>
    </group>
  )
}
