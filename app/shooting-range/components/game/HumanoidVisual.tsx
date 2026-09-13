import { useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { HitZone, TrainingModeId } from '../../types'
import type { BotMotionSample } from '../../utils/humanoidMotion'
import { impactColorForZone } from '../../utils/impactFx'
import { hitFlashDurationForZone } from '../../utils/gunFeel'
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

function zoneHitColor(zone: HitZone | undefined, part: 'head' | 'body' | 'limb', idle: string): string {
  if (!zone) return idle
  if (zone === 'head' && part === 'head') return '#e85858'
  if (zone === 'body' && part === 'body') return '#d05050'
  if (zone === 'limb' && part === 'limb') return '#c84848'
  if (zone === 'head') return '#8a4848'
  if (zone === 'body') return '#7a4040'
  return '#6a3838'
}

interface HumanoidVisualProps {
  modeId: TrainingModeId
  hitRef: MutableRefObject<boolean>
  hitZoneRef: MutableRefObject<HitZone | undefined>
  lowLightBoost?: number
  crouchScaleRef: MutableRefObject<number>
  motionRef: MutableRefObject<BotMotionSample>
}

function matteProps(color: string) {
  return { color, metalness: MATTE.metalness, roughness: MATTE.roughness }
}

function flashLayoutForZone(hitZone?: HitZone) {
  return {
    y: hitZone === 'head' ? 1.74 : hitZone === 'limb' ? 0.62 : 1.08,
    size: hitZone === 'head' ? 0.52 : hitZone === 'limb' ? 0.38 : 0.46,
    isHead: hitZone === 'head',
    color: impactColorForZone(hitZone),
  }
}

/** Original low-poly training-bot silhouette — not based on any commercial IP. */
export function HumanoidVisual({
  modeId,
  hitRef,
  hitZoneRef,
  lowLightBoost = 0,
  crouchScaleRef,
  motionRef,
}: HumanoidVisualProps) {
  const nightBoost = Math.max(0, Math.min(1, lowLightBoost))
  const torsoRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const appearance = useMemo(() => getTargetAppearance(modeId), [modeId])
  const accent = appearance.ringColor
  const hitFlashRef = useRef<THREE.Group>(null)
  const headFlashRef = useRef<THREE.Group>(null)
  const bodyFlashRef = useRef<THREE.Group>(null)
  const headAccentRingRef = useRef<THREE.Mesh>(null)
  const hitFlashElapsed = useRef(0)
  const previousHit = useRef(false)
  const previousZone = useRef<HitZone | undefined>(undefined)
  const headMaterialRef = useRef<THREE.MeshStandardMaterial>(null)
  const chestAccentMaterialRef = useRef<THREE.MeshStandardMaterial>(null)
  const crownMaterialRef = useRef<THREE.MeshStandardMaterial>(null)
  const bodyMaterialRefs = useRef<THREE.MeshStandardMaterial[]>([])
  const limbMaterialRefs = useRef<THREE.MeshStandardMaterial[]>([])

  const headIdle = nightBoost > 0 ? '#d0b890' : HEAD_COLOR
  const bodyIdle = nightBoost > 0 ? '#4a5258' : BODY_COLOR
  const limbIdle = nightBoost > 0 ? '#424a50' : LIMB_COLOR

  const applyLook = (hit: boolean, hitZone?: HitZone) => {
    const headColor = hit ? zoneHitColor(hitZone, 'head', headIdle) : headIdle
    const bodyColor = hit ? zoneHitColor(hitZone, 'body', bodyIdle) : bodyIdle
    const limbColor = hit ? zoneHitColor(hitZone, 'limb', limbIdle) : limbIdle

    headMaterialRef.current?.color.set(headColor)
    headMaterialRef.current?.emissive.set(hit && hitZone === 'head' ? '#5a1018' : '#000000')
    headMaterialRef.current?.emissiveIntensity = hit && hitZone === 'head' ? 0.42 : 0

    chestAccentMaterialRef.current?.color.set(hit && hitZone === 'body' ? '#e8d8b8' : ACCENT_COLOR)
    crownMaterialRef.current?.color.set(hit && hitZone === 'head' ? '#f0c0c0' : accent)

    bodyMaterialRefs.current.forEach(material => material.color.set(bodyColor))
    limbMaterialRefs.current.forEach(material => material.color.set(limbColor))

    if (headAccentRingRef.current) {
      headAccentRingRef.current.visible = !hit
    }

    const flash = hitFlashRef.current
    const layout = flashLayoutForZone(hitZone)
    if (flash) {
      flash.position.y = layout.y
      flash.visible = hit
    }
    if (headFlashRef.current) headFlashRef.current.visible = hit && layout.isHead
    if (bodyFlashRef.current) bodyFlashRef.current.visible = hit && !layout.isHead
  }

  useFrame((_, delta) => {
    const hit = hitRef.current
    const hitZone = hitZoneRef.current

    if (previousHit.current !== hit || previousZone.current !== hitZone) {
      previousHit.current = hit
      previousZone.current = hitZone
      hitFlashElapsed.current = 0
      applyLook(hit, hitZone)
      if (hitFlashRef.current) {
        hitFlashRef.current.visible = hit
      }
    }

    if (hit && hitFlashRef.current) {
      hitFlashElapsed.current += delta
      const flashDuration = hitFlashDurationForZone(hitZone)
      const flashT = hitFlashElapsed.current / flashDuration
      const flashScale = 0.85 + flashT * 1.15
      hitFlashRef.current.scale.setScalar(flashScale)
      hitFlashRef.current.visible = flashT < 1
    }

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

  const initialFlash = flashLayoutForZone(undefined)

  return (
    <group>
      <group ref={hitFlashRef} position={[0, initialFlash.y, 0.18]} visible={false}>
        <group ref={headFlashRef} visible={false}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[initialFlash.size * 1.45, 0.09, 0.09]} />
            <meshBasicMaterial color={initialFlash.color} toneMapped={false} />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[initialFlash.size * 1.45, 0.09, 0.09]} />
            <meshBasicMaterial color={initialFlash.color} toneMapped={false} />
          </mesh>
        </group>
        <group ref={bodyFlashRef} visible={false}>
          <mesh>
            <ringGeometry args={[initialFlash.size * 0.55, initialFlash.size * 0.82, 16]} />
            <meshBasicMaterial
              color={initialFlash.color}
              transparent
              opacity={0.88}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>

      <group ref={leftLegRef} position={[-0.18, 0.38, 0]}>
        <mesh userData={{ hitZone: 'limb' }}>
          <boxGeometry args={[0.22, 0.74, 0.22]} />
          <meshStandardMaterial
            ref={node => {
              if (node) limbMaterialRefs.current[0] = node
            }}
            {...matteProps(limbIdle)}
          />
        </mesh>
        <mesh position={[0, -0.42, 0.04]} userData={{ hitZone: 'limb' }}>
          <boxGeometry args={[0.2, 0.38, 0.24]} />
          <meshStandardMaterial
            ref={node => {
              if (node) limbMaterialRefs.current[1] = node
            }}
            {...matteProps(limbIdle)}
          />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.18, 0.38, 0]}>
        <mesh userData={{ hitZone: 'limb' }}>
          <boxGeometry args={[0.22, 0.74, 0.22]} />
          <meshStandardMaterial
            ref={node => {
              if (node) limbMaterialRefs.current[2] = node
            }}
            {...matteProps(limbIdle)}
          />
        </mesh>
        <mesh position={[0, -0.42, 0.04]} userData={{ hitZone: 'limb' }}>
          <boxGeometry args={[0.2, 0.38, 0.24]} />
          <meshStandardMaterial
            ref={node => {
              if (node) limbMaterialRefs.current[3] = node
            }}
            {...matteProps(limbIdle)}
          />
        </mesh>
      </group>

      <mesh position={[0, 0.78, 0]} userData={{ hitZone: 'body' }}>
        <boxGeometry args={[0.58, 0.22, 0.32]} />
        <meshStandardMaterial
          ref={node => {
            if (node) bodyMaterialRefs.current[0] = node
          }}
          {...matteProps(bodyIdle)}
        />
      </mesh>

      <group ref={torsoRef} position={[0, 1.02, 0]}>
        <mesh position={[0, 0.08, 0]} userData={{ hitZone: 'body' }}>
          <boxGeometry args={[0.68, 0.88, 0.36]} />
          <meshStandardMaterial
            ref={node => {
              if (node) bodyMaterialRefs.current[1] = node
            }}
            {...matteProps(bodyIdle)}
          />
        </mesh>
        <mesh position={[0, -0.22, 0]} userData={{ hitZone: 'body' }}>
          <boxGeometry args={[0.52, 0.28, 0.32]} />
          <meshStandardMaterial
            ref={node => {
              if (node) bodyMaterialRefs.current[2] = node
            }}
            {...matteProps(bodyIdle)}
          />
        </mesh>
        <mesh position={[0, 0.22, 0.1]} userData={{ hitZone: 'body' }}>
          <boxGeometry args={[0.3, 0.3, 0.06]} />
          <meshStandardMaterial ref={chestAccentMaterialRef} color={ACCENT_COLOR} metalness={0.04} roughness={0.88} />
        </mesh>

        <mesh position={[-0.4, 0.42, 0]} userData={{ hitZone: 'body' }}>
          <boxGeometry args={[0.2, 0.2, 0.26]} />
          <meshStandardMaterial
            ref={node => {
              if (node) bodyMaterialRefs.current[3] = node
            }}
            {...matteProps(bodyIdle)}
          />
        </mesh>
        <mesh position={[0.4, 0.42, 0]} userData={{ hitZone: 'body' }}>
          <boxGeometry args={[0.2, 0.2, 0.26]} />
          <meshStandardMaterial
            ref={node => {
              if (node) bodyMaterialRefs.current[4] = node
            }}
            {...matteProps(bodyIdle)}
          />
        </mesh>

        <group ref={leftArmRef} position={[-0.48, 0.02, 0]}>
          <mesh userData={{ hitZone: 'limb' }}>
            <boxGeometry args={[0.18, 0.64, 0.18]} />
            <meshStandardMaterial
              ref={node => {
                if (node) limbMaterialRefs.current[4] = node
              }}
              {...matteProps(limbIdle)}
            />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.48, 0.02, 0]}>
          <mesh userData={{ hitZone: 'limb' }}>
            <boxGeometry args={[0.18, 0.64, 0.18]} />
            <meshStandardMaterial
              ref={node => {
                if (node) limbMaterialRefs.current[5] = node
              }}
              {...matteProps(limbIdle)}
            />
          </mesh>
        </group>

        <group ref={headRef} position={[0, 0.72, 0]}>
          <mesh userData={{ hitZone: 'head' }}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial ref={headMaterialRef} {...matteProps(headIdle)} />
          </mesh>
          <mesh ref={headAccentRingRef} position={[0, 0, 0.22]} rotation={[0, 0, 0]}>
            <ringGeometry args={[0.22, 0.28, 4]} />
            <meshBasicMaterial
              color={nightBoost > 0 ? '#e8c898' : accent}
              transparent
              opacity={0.55}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 0.2, 0]} userData={{ hitZone: 'head' }}>
            <boxGeometry args={[0.24, 0.12, 0.24]} />
            <meshStandardMaterial ref={crownMaterialRef} color={accent} metalness={0.04} roughness={0.88} />
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
