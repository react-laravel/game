import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { ThreeEvent, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { HitZone, TargetShape, TrainingModeId } from '../../types'
import type { TargetMovement } from '../../utils/trainingModes'
import {
  createBotMotionState,
  getBotMotionProfile,
  stepBotMotion,
  type BotMotionSample,
} from '../../utils/humanoidMotion'
import { getTargetAppearance } from '../../utils/targetAppearance'
import { HumanoidVisual } from './HumanoidVisual'

interface TargetProps {
  targetShape: TargetShape
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
  modeId: TrainingModeId
  lowLightBoost?: number
  onClick: (id: number, hitZone?: HitZone) => void
  onReady?: (id: number, target: THREE.Group | null) => void
  id: number
}

const plateIdleColor = new THREE.Color('#e8e0d4')
const plateLitColor = new THREE.Color('#f0eae0')
const plateHitColor = new THREE.Color('#d84848')
const plateHitEmissive = new THREE.Color('#5a1010')
const ringHitColor = new THREE.Color('#c88830')
const innerIdleColor = new THREE.Color('#4a4438')
const innerHitColor = new THREE.Color('#f0e8d0')
const centerIdleColor = new THREE.Color('#887058')
const ringLitColor = new THREE.Color('#b0a898')
const centerHitColor = new THREE.Color('#f0ece0')
const MATTE = { metalness: 0.04, roughness: 0.9 }

function applyTargetLook(
  hit: boolean,
  ringIdleHex: string,
  plate: THREE.MeshStandardMaterial | null,
  ring: THREE.MeshStandardMaterial | null,
  inner: THREE.MeshStandardMaterial | null,
  center: THREE.MeshStandardMaterial | null,
  lowLightBoost = 0
) {
  if (!plate || !ring || !inner || !center) return
  if (hit) {
    plate.color.copy(plateHitColor)
    plate.emissive.copy(plateHitEmissive)
    plate.emissiveIntensity = 0.35
  } else {
    plate.color.copy(plateIdleColor)
    if (lowLightBoost > 0) {
      plate.color.lerp(plateLitColor, lowLightBoost * 0.35)
    }
    plate.emissive.set('#000000')
    plate.emissiveIntensity = 0
  }
  plate.metalness = MATTE.metalness
  plate.roughness = MATTE.roughness
  if (hit) {
    ring.color.copy(ringHitColor)
    ring.emissive.set('#000000')
    ring.emissiveIntensity = 0
  } else {
    ring.color.set(ringIdleHex)
    if (lowLightBoost > 0) {
      ring.color.lerp(ringLitColor, lowLightBoost * 0.45)
      ring.emissive.set(ringIdleHex)
      ring.emissiveIntensity = lowLightBoost * 0.34
    } else {
      ring.emissive.set('#000000')
      ring.emissiveIntensity = 0
    }
  }
  ring.metalness = 0.02
  ring.roughness = 0.94
  inner.color.copy(hit ? innerHitColor : innerIdleColor)
  inner.metalness = 0.02
  inner.roughness = 0.94
  center.color.copy(hit ? centerHitColor : centerIdleColor)
  if (!hit && lowLightBoost > 0) {
    center.color.lerp(centerHitColor, lowLightBoost * 0.28)
    center.emissive.set('#6a5840')
    center.emissiveIntensity = lowLightBoost * 0.24
  } else {
    center.emissive.set('#000000')
    center.emissiveIntensity = 0
  }
  center.metalness = 0.03
  center.roughness = 0.9
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
  modeId,
  targetShape,
  lowLightBoost = 0,
  onClick,
  onReady,
  id,
}: TargetProps) {
  const isHumanoid = targetShape === 'humanoid'
  const nightBoost = Math.max(0, Math.min(1, lowLightBoost))
  const appearance = useMemo(() => getTargetAppearance(modeId), [modeId])
  const botMotionProfile = useMemo(() => getBotMotionProfile(modeId), [modeId])
  const botMotionState = useRef(createBotMotionState(id))
  const botMotionSample = useRef<BotMotionSample>({
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
  })
  const botOffset = useRef(new THREE.Vector3())
  const crouchScaleRef = useRef(1)
  const basePosition = useRef(new THREE.Vector3(...position))
  const rootRef = useRef<THREE.Group>(null)
  const visualRef = useRef<THREE.Group>(null)
  const plateMaterialRef = useRef<THREE.MeshStandardMaterial>(null)
  const ringMaterialRef = useRef<THREE.MeshStandardMaterial>(null)
  const innerMaterialRef = useRef<THREE.MeshStandardMaterial>(null)
  const centerMaterialRef = useRef<THREE.MeshStandardMaterial>(null)
  const outerRingMaterialRef = useRef<THREE.MeshStandardMaterial>(null)
  const frameRingMaterialRef = useRef<THREE.MeshStandardMaterial>(null)
  const spawnFlashRef = useRef<THREE.Mesh>(null)
  const spawnFlashMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const directionRef = useRef(new THREE.Vector3(...direction).normalize())
  const jitterRef = useRef(new THREE.Vector3())
  const orbitAnchor = useRef(new THREE.Vector3(...position))
  const hitElapsed = useRef(0)
  const spawnFlashElapsed = useRef(0.5)
  const previousHit = useRef(false)
  const spawnPulse = useRef(1)
  const burstRingRef = useRef<THREE.Mesh>(null)
  const burstMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const orbitHintRef = useRef<THREE.Group>(null)
  const speedRingRef = useRef<THREE.Mesh>(null)
  const speedRingMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const [humanoidHit, setHumanoidHit] = useState(false)
  const [humanoidHitZone, setHumanoidHitZone] = useState<HitZone | undefined>()
  const motionTrailRef = useRef<THREE.Mesh>(null)
  const staticAnchorRef = useRef<THREE.Group>(null)
  const prevPosition = useRef(new THREE.Vector3(...position))
  const botMotionScale = movement === 'static' && modeId === 'static' ? 0 : 1

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
    basePosition.current.set(...position)
    botMotionState.current = createBotMotionState(id)
    spawnPulse.current = appearance.spawnPop
    spawnFlashElapsed.current = 0
    onReady?.(id, root)
    return () => onReady?.(id, null)
  }, [appearance.spawnPop, id, nightBoost, onReady, position])

  useEffect(() => {
    if (isHumanoid || nightBoost <= 0) return
    applyTargetLook(
      false,
      appearance.ringColor,
      plateMaterialRef.current,
      ringMaterialRef.current,
      innerMaterialRef.current,
      centerMaterialRef.current,
      nightBoost
    )
  }, [appearance.ringColor, isHumanoid, nightBoost])

  useFrame(({ camera }, delta) => {
    const root = rootRef.current
    const visual = visualRef.current
    if (!root || !visual) return

    const hit = root.userData.hit === true
    if (previousHit.current !== hit) {
      previousHit.current = hit
      hitElapsed.current = 0
      visual.visible = true
      if (hit && burstRingRef.current) {
        burstRingRef.current.visible = true
        burstRingRef.current.scale.setScalar(0.85)
      }
      if (!hit) {
        spawnPulse.current = appearance.spawnPop
        spawnFlashElapsed.current = 0
      }
      if (isHumanoid) {
        setHumanoidHit(hit)
        setHumanoidHitZone(
          hit ? (root.userData.lastHitZone as HitZone | undefined) ?? 'body' : undefined
        )
      } else {
        applyTargetLook(
          hit,
          appearance.ringColor,
          plateMaterialRef.current,
          ringMaterialRef.current,
          innerMaterialRef.current,
          centerMaterialRef.current,
          nightBoost
        )
        if (outerRingMaterialRef.current) {
          outerRingMaterialRef.current.color.set('#3a3830')
        }
        if (frameRingMaterialRef.current) {
          frameRingMaterialRef.current.color.set('#4a4438')
        }
      }
    }

    if (!hit) {
      const pos = basePosition.current

      if (movement === 'orbit' && orbitRadius > 0) {
        const time = performance.now() * 0.001 * orbitSpeed + id * 1.7
        pos.set(
          orbitAnchor.current.x + Math.cos(time) * orbitRadius,
          orbitAnchor.current.y + Math.sin(time * 0.85) * orbitRadius * 0.42,
          orbitAnchor.current.z + Math.sin(time * 1.1) * orbitRadius * 0.55
        )
      } else if (movement === 'linear' && speed > 0) {
        const directionVector = directionRef.current
        pos.addScaledVector(directionVector, speed * 60 * delta)

        const halfWidth = gameAreaSize * 0.42
        const minY = isHumanoid ? 0.15 : 0.8
        const maxY = Math.min(9, gameAreaSize * 0.42 + 2)
        const nearZ = -7
        const farZ = -(gameAreaSize + 9)

        if (pos.x < -halfWidth || pos.x > halfWidth) directionVector.x *= -1
        if (pos.y < minY || pos.y > maxY) directionVector.y *= -1
        if (pos.z > nearZ || pos.z < farZ) directionVector.z *= -1

        pos.x = THREE.MathUtils.clamp(pos.x, -halfWidth, halfWidth)
        pos.y = THREE.MathUtils.clamp(pos.y, minY, maxY)
        pos.z = THREE.MathUtils.clamp(pos.z, farZ, nearZ)

        if (jitterChance > 0 && Math.random() < delta * jitterChance) {
          jitterRef.current.set((Math.random() - 0.5) * 0.55, (Math.random() - 0.5) * 0.35, 0)
          directionVector.add(jitterRef.current).normalize()
        }
      } else if (movement === 'static') {
        pos.copy(orbitAnchor.current)
      }

      if (isHumanoid) {
        if (botMotionScale > 0) {
          const timeSec = performance.now() * 0.001
          const sample = stepBotMotion(botMotionState.current, delta, botMotionProfile, timeSec)
          botMotionSample.current = sample
          botOffset.current.set(sample.offsetX, sample.offsetY, sample.offsetZ)
          crouchScaleRef.current = sample.crouchScale
          root.position.set(
            pos.x + sample.offsetX * botMotionScale,
            pos.y + sample.offsetY * botMotionScale,
            pos.z + sample.offsetZ * botMotionScale
          )
        } else {
          botOffset.current.set(0, 0, 0)
          crouchScaleRef.current = 1
          root.position.copy(pos)
        }
      } else {
        root.position.copy(pos)
      }

      if (appearance.showMotionStreak && motionTrailRef.current && movement === 'linear' && speed > 0) {
        const trail = motionTrailRef.current
        const velocity = prevPosition.current.clone().sub(root.position)
        const speedMag = velocity.length()
        trail.visible = speedMag > 0.02
        if (trail.visible) {
          trail.position.copy(root.position).addScaledVector(velocity.normalize(), 0.35)
          trail.scale.set(1.1, 1.1, Math.min(2.4, 0.6 + speedMag * 18))
          trail.lookAt(prevPosition.current)
        }
      } else if (motionTrailRef.current) {
        motionTrailRef.current.visible = false
      }
      prevPosition.current.copy(root.position)

      if (appearance.showStaticAnchor && staticAnchorRef.current && movement === 'static') {
        staticAnchorRef.current.visible = true
        staticAnchorRef.current.position.set(orbitAnchor.current.x, orbitAnchor.current.y, orbitAnchor.current.z)
      } else if (staticAnchorRef.current) {
        staticAnchorRef.current.visible = false
      }

      spawnPulse.current = THREE.MathUtils.lerp(spawnPulse.current, 1, delta * 6)
      const movingPulse =
        appearance.pulseAmplitude > 0
          ? 1 + Math.sin(performance.now() * 0.001 * appearance.pulseSpeed + id) * appearance.pulseAmplitude
          : 1
      const pulse = movement === 'static' ? spawnPulse.current : movingPulse
      visual.scale.setScalar(pulse)

      if (appearance.showSpeedRing && speedRingRef.current && speedRingMaterialRef.current) {
        const urgency = 0.5 + Math.sin(performance.now() * 0.001 * appearance.pulseSpeed * 1.4 + id) * 0.5
        speedRingRef.current.visible = true
        speedRingRef.current.scale.setScalar(1.08 + urgency * 0.14)
        speedRingMaterialRef.current.opacity = 0.18 + urgency * 0.22
      }

      if (spawnFlashElapsed.current < 0.42) {
        spawnFlashElapsed.current += delta
        const flashT = spawnFlashElapsed.current / 0.42
        const spawnFlash = spawnFlashRef.current
        const spawnFlashMaterial = spawnFlashMaterialRef.current
        if (spawnFlash && spawnFlashMaterial) {
          spawnFlash.visible = true
          const flashScale = 0.7 + flashT * 1.1
          spawnFlash.scale.setScalar(flashScale)
          spawnFlashMaterial.opacity = Math.max(0, 0.72 * (1 - flashT ** 1.4))
        }
      } else if (spawnFlashRef.current) {
        spawnFlashRef.current.visible = false
      }
    } else {
      hitElapsed.current += delta
      const impactScale = Math.max(0.001, 1 + hitElapsed.current * 2.4 - hitElapsed.current ** 2 * 52)
      visual.scale.setScalar(impactScale)
      visual.visible = hitElapsed.current < 0.16

      const burstRing = burstRingRef.current
      const burstMaterial = burstMaterialRef.current
      if (burstRing && burstMaterial) {
        const burstT = hitElapsed.current / 0.22
        if (burstT < 1) {
          burstRing.visible = true
          const ringScale = 0.85 + burstT * 1.35
          burstRing.scale.setScalar(ringScale)
          burstMaterial.opacity = Math.max(0, 0.82 * (1 - burstT ** 1.35))
        } else {
          burstRing.visible = false
        }
      }
    }

    if (faceCamera || isHumanoid) root.lookAt(camera.position)

    if (orbitHintRef.current && appearance.showOrbitHint) {
      orbitHintRef.current.position.copy(orbitAnchor.current)
    }
  })

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (rootRef.current?.userData.hit) return

    let hitZone: HitZone | undefined
    let current: THREE.Object3D | null = event.object
    while (current) {
      if (current.userData?.hitZone) {
        hitZone = current.userData.hitZone as HitZone
      }
      current = current.parent
    }
    onClick(id, hitZone)
  }

  return (
    <group>
      {appearance.showStaticAnchor && (
        <group ref={staticAnchorRef} visible={false}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.68, 0.74, 24]} />
            <meshBasicMaterial
              color={appearance.ringColor}
              transparent
              opacity={0.28}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
            <ringGeometry args={[0.84, 0.9, 24]} />
            <meshBasicMaterial
              color={appearance.spawnFlashColor}
              transparent
              opacity={0.14}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {appearance.showOrbitHint && orbitRadius > 0 && (
        <group ref={orbitHintRef} position={position}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.02]}>
            <ringGeometry args={[orbitRadius * 0.92, orbitRadius * 1.02, 48]} />
            <meshBasicMaterial
              color={appearance.ringColor}
              transparent
              opacity={0.22}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      <group
        ref={rootRef}
        position={position}
        scale={isHumanoid ? scale * 0.78 : scale}
        onClick={handleClick}
      >
      <group ref={visualRef}>
        {appearance.showMotionStreak && (
          <mesh ref={motionTrailRef} visible={false}>
            <boxGeometry args={[0.08, 0.08, 0.55]} />
            <meshBasicMaterial
              color={appearance.ringColor}
              transparent
              opacity={0.28}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
        )}

        {isHumanoid ? (
          <HumanoidVisual
            modeId={modeId}
            hit={humanoidHit}
            hitZone={humanoidHitZone}
            lowLightBoost={nightBoost}
            crouchScaleRef={crouchScaleRef}
            motionRef={botMotionSample}
          />
        ) : (
          <>
        <mesh ref={spawnFlashRef} position={[0, 0, 0.12]} visible={false}>
          <ringGeometry args={[1.02, 1.18, 32]} />
          <meshBasicMaterial
            ref={spawnFlashMaterialRef}
            color={appearance.spawnFlashColor}
            transparent
            opacity={0}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>

        <mesh ref={burstRingRef} position={[0, 0, 0.14]} visible={false}>
          <ringGeometry args={[0.92, 1.08, 32]} />
          <meshBasicMaterial
            ref={burstMaterialRef}
            color="#ffd080"
            transparent
            opacity={0}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[1.05, 1.05, 0.16, 32]} />
          <meshStandardMaterial color="#2a3238" metalness={0.12} roughness={0.82} />
        </mesh>

        <mesh position={[0, 0, 0.092]}>
          <ringGeometry args={[0.96, 1.02, 32]} />
          <meshStandardMaterial ref={outerRingMaterialRef} color="#3a3830" metalness={0.05} roughness={0.92} />
        </mesh>

        <mesh position={[0, 0, 0.095]}>
          <ringGeometry args={[0.88, 0.98, 32]} />
          <meshStandardMaterial ref={frameRingMaterialRef} color="#4a4438" metalness={0.05} roughness={0.92} />
        </mesh>

        <mesh position={[0, 0, 0.1]}>
          <circleGeometry args={[0.91, 32]} />
          <meshStandardMaterial
            ref={plateMaterialRef}
            color="#e8e0d4"
            metalness={0.04}
            roughness={0.9}
          />
        </mesh>

        <mesh position={[0, 0, 0.115]}>
          <ringGeometry args={[0.55, 0.73, 32]} />
          <meshStandardMaterial
            ref={ringMaterialRef}
            color={appearance.ringColor}
            metalness={0.02}
            roughness={0.92}
          />
        </mesh>

        <mesh position={[0, 0, 0.125]}>
          <circleGeometry args={[0.33, 32]} />
          <meshStandardMaterial ref={innerMaterialRef} color="#4a4438" metalness={0.02} roughness={0.94} />
        </mesh>

        <mesh position={[0, 0, 0.135]}>
          <circleGeometry args={[0.13, 24]} />
          <meshStandardMaterial ref={centerMaterialRef} color="#b89048" metalness={0.03} roughness={0.88} />
        </mesh>

        <mesh position={[-1.18, 0, 0]}>
          <boxGeometry args={[0.24, 0.42, 0.22]} />
          <meshStandardMaterial color="#3a4248" metalness={0.18} roughness={0.78} />
        </mesh>
        <mesh position={[1.18, 0, 0]}>
          <boxGeometry args={[0.24, 0.42, 0.22]} />
          <meshStandardMaterial color="#3a4248" metalness={0.18} roughness={0.78} />
        </mesh>

        {appearance.showSpawnBrackets && (
          <>
            {[
              [-1.35, 1.05, 0.12],
              [1.35, 1.05, 0.12],
              [-1.35, -1.05, 0.12],
              [1.35, -1.05, 0.12],
            ].map(([bx, by, bz], index) => (
              <group key={index} position={[bx, by, bz]}>
                <mesh position={[bx > 0 ? -0.18 : 0.18, 0, 0]}>
                  <boxGeometry args={[0.36, 0.06, 0.04]} />
                  <meshStandardMaterial color={appearance.ringColor} metalness={0.02} roughness={0.9} />
                </mesh>
                <mesh position={[0, by > 0 ? -0.18 : 0.18, 0]}>
                  <boxGeometry args={[0.06, 0.36, 0.04]} />
                  <meshStandardMaterial color={appearance.ringColor} metalness={0.02} roughness={0.9} />
                </mesh>
              </group>
            ))}
          </>
        )}

        {appearance.showAimCross && (
          <>
            {[
              [0, 0.62, 0.11],
              [0, -0.62, 0.11],
              [0.62, 0, 0.11],
              [-0.62, 0, 0.11],
            ].map(([cx, cy, cz], index) => (
              <mesh key={`aim-cross-${index}`} position={[cx, cy, cz]}>
                <boxGeometry args={[index < 2 ? 0.05 : 0.42, index < 2 ? 0.42 : 0.05, 0.02]} />
                <meshStandardMaterial
                  color={appearance.ringColor}
                  transparent
                  opacity={0.5}
                  metalness={0.02}
                  roughness={0.9}
                  depthWrite={false}
                />
              </mesh>
            ))}
          </>
        )}

        {appearance.showSpeedRing && (
          <mesh ref={speedRingRef} position={[0, 0, 0.08]} visible={false}>
            <ringGeometry args={[1.12, 1.28, 36]} />
            <meshBasicMaterial
              ref={speedRingMaterialRef}
              color={appearance.ringColor}
              transparent
              opacity={0}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
        )}
          </>
        )}
      </group>
      </group>
    </group>
  )
}

export const Target = memo(TargetComponent)
