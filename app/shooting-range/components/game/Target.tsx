import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { ThreeEvent, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { TargetShape, TrainingModeId } from '../../types'
import type { TargetMovement } from '../../utils/trainingModes'
import {
  createBotMotionState,
  getBotMotionProfile,
  stepBotMotion,
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
  onClick: (id: number) => void
  onReady?: (id: number, target: THREE.Group | null) => void
  id: number
}

const plateIdleColor = new THREE.Color('#e8f0f7')
const plateHitColor = new THREE.Color('#ff3b3b')
const plateIdleEmissive = new THREE.Color('#07131d')
const plateHitEmissive = new THREE.Color('#7f1010')
const ringHitColor = new THREE.Color('#ffb020')
const innerIdleColor = new THREE.Color('#0a1a28')
const innerHitColor = new THREE.Color('#fff1c2')
const centerIdleColor = new THREE.Color('#ffb830')
const centerHitColor = new THREE.Color('#ffffff')

function applyTargetLook(
  hit: boolean,
  ringIdleHex: string,
  plate: THREE.MeshStandardMaterial | null,
  ring: THREE.MeshBasicMaterial | null,
  inner: THREE.MeshBasicMaterial | null,
  center: THREE.MeshBasicMaterial | null
) {
  if (!plate || !ring || !inner || !center) return
  plate.color.copy(hit ? plateHitColor : plateIdleColor)
  plate.emissive.copy(hit ? plateHitEmissive : plateIdleEmissive)
  plate.emissiveIntensity = hit ? 2.5 : 0.35
  ring.color.set(hit ? ringHitColor : ringIdleHex)
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
  modeId,
  targetShape,
  onClick,
  onReady,
  id,
}: TargetProps) {
  const isHumanoid = targetShape === 'humanoid'
  const appearance = useMemo(() => getTargetAppearance(modeId), [modeId])
  const botMotionProfile = useMemo(() => getBotMotionProfile(modeId), [modeId])
  const botMotionState = useRef(createBotMotionState(id))
  const botOffset = useRef(new THREE.Vector3())
  const crouchScaleRef = useRef(1)
  const basePosition = useRef(new THREE.Vector3(...position))
  const rootRef = useRef<THREE.Group>(null)
  const visualRef = useRef<THREE.Group>(null)
  const plateMaterialRef = useRef<THREE.MeshStandardMaterial>(null)
  const ringMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const innerMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const centerMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
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
  }, [appearance.spawnPop, id, onReady, position])

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
      } else {
        applyTargetLook(
          hit,
          appearance.ringColor,
          plateMaterialRef.current,
          ringMaterialRef.current,
          innerMaterialRef.current,
          centerMaterialRef.current
        )
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
        const timeSec = performance.now() * 0.001
        const sample = stepBotMotion(botMotionState.current, delta, botMotionProfile, timeSec)
        botOffset.current.set(sample.offsetX, sample.offsetY, sample.offsetZ)
        crouchScaleRef.current = sample.crouchScale
        root.position.set(
          pos.x + sample.offsetX,
          pos.y + sample.offsetY,
          pos.z + sample.offsetZ
        )
      } else {
        root.position.copy(pos)
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
    if (!rootRef.current?.userData.hit) onClick(id)
  }

  return (
    <group>
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
        {isHumanoid ? (
          <HumanoidVisual modeId={modeId} hit={humanoidHit} crouchScaleRef={crouchScaleRef} />
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
          <meshStandardMaterial color="#142738" metalness={0.8} roughness={0.28} />
        </mesh>

        <mesh position={[0, 0, 0.092]}>
          <ringGeometry args={[0.96, 1.02, 32]} />
          <meshBasicMaterial color="#050a10" toneMapped={false} />
        </mesh>

        <mesh position={[0, 0, 0.095]}>
          <ringGeometry args={[0.88, 0.98, 32]} />
          <meshBasicMaterial color="#0a1520" toneMapped={false} />
        </mesh>

        <mesh position={[0, 0, 0.1]}>
          <circleGeometry args={[0.91, 32]} />
          <meshStandardMaterial
            ref={plateMaterialRef}
            color="#f0f6fc"
            emissive="#0a1824"
            emissiveIntensity={0.42}
            roughness={0.48}
          />
        </mesh>

        <mesh position={[0, 0, 0.115]}>
          <ringGeometry args={[0.55, 0.73, 32]} />
          <meshBasicMaterial ref={ringMaterialRef} color={appearance.ringColor} toneMapped={false} />
        </mesh>

        <mesh position={[0, 0, 0.125]}>
          <circleGeometry args={[0.33, 32]} />
          <meshBasicMaterial ref={innerMaterialRef} color="#0a1a28" toneMapped={false} />
        </mesh>

        <mesh position={[0, 0, 0.135]}>
          <circleGeometry args={[0.13, 24]} />
          <meshBasicMaterial ref={centerMaterialRef} color="#ffb830" toneMapped={false} />
        </mesh>

        <mesh position={[-1.18, 0, 0]}>
          <boxGeometry args={[0.24, 0.42, 0.22]} />
          <meshStandardMaterial color="#263d4d" metalness={0.75} roughness={0.3} />
        </mesh>
        <mesh position={[1.18, 0, 0]}>
          <boxGeometry args={[0.24, 0.42, 0.22]} />
          <meshStandardMaterial color="#263d4d" metalness={0.75} roughness={0.3} />
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
                  <meshBasicMaterial color={appearance.ringColor} toneMapped={false} />
                </mesh>
                <mesh position={[0, by > 0 ? -0.18 : 0.18, 0]}>
                  <boxGeometry args={[0.06, 0.36, 0.04]} />
                  <meshBasicMaterial color={appearance.ringColor} toneMapped={false} />
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
                <meshBasicMaterial
                  color={appearance.ringColor}
                  transparent
                  opacity={0.55}
                  toneMapped={false}
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
