import type { MutableRefObject } from 'react'
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { muzzleFlashIntensity } from '../../utils/gunFeel'
import { GunModel } from './GunModel'

interface FPSWeaponProps {
  /** Elapsed seconds since flash start, or -1 when inactive. */
  muzzleFlashElapsedRef: MutableRefObject<number>
  /** Current pitch recoil offset applied to the view (radians). */
  recoilPitchRef: MutableRefObject<number>
}

const IDLE_LIGHT_COLOR = new THREE.Color('#c7efff')
const FLASH_LIGHT_COLOR = new THREE.Color('#ffd080')

/** First-person weapon with allocation-free camera following and readable recoil kick. */
export function FPSWeapon({ muzzleFlashElapsedRef, recoilPitchRef }: FPSWeaponProps) {
  const { camera } = useThree()
  const gunRef = useRef<THREE.Group>(null)
  const flashRef = useRef<THREE.Group>(null)
  const flashCoreRef = useRef<THREE.Mesh>(null)
  const flashHaloRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const lastIntensity = useRef(0)
  const localOffset = useRef(new THREE.Vector3(0.34, -0.29, -0.82))
  const worldOffset = useRef(new THREE.Vector3())
  const swayQuaternion = useRef(new THREE.Quaternion())
  const swayEuler = useRef(new THREE.Euler())

  useFrame(({ clock }) => {
    const gun = gunRef.current
    if (!gun) return

    const flashElapsed = muzzleFlashElapsedRef.current
    const intensity = flashElapsed >= 0 ? muzzleFlashIntensity(flashElapsed) : 0
    const recoilKick = recoilPitchRef.current
    const time = clock.getElapsedTime()

    worldOffset.current.copy(localOffset.current)
    worldOffset.current.z += intensity * 0.055 + recoilKick * 2.8
    worldOffset.current.y += recoilKick * 0.35
    worldOffset.current.applyQuaternion(camera.quaternion)

    gun.position.copy(camera.position).add(worldOffset.current)
    gun.quaternion.copy(camera.quaternion)

    swayEuler.current.set(
      Math.sin(time * 1.7) * 0.003 + recoilKick * 0.4,
      Math.sin(time * 1.25) * 0.004,
      Math.sin(time * 1.1) * 0.002 - recoilKick * 0.25
    )
    swayQuaternion.current.setFromEuler(swayEuler.current)
    gun.quaternion.multiply(swayQuaternion.current)

    if (flashRef.current) {
      flashRef.current.visible = intensity > 0.02
      const scale = 0.75 + intensity * 0.55
      flashRef.current.scale.set(scale, scale, 0.85 + intensity * 0.9)
    }

    if (flashCoreRef.current) {
      const material = flashCoreRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.35 + intensity * 0.6
    }
    if (flashHaloRef.current) {
      const material = flashHaloRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.2 + intensity * 0.45
    }

    if (lightRef.current && lastIntensity.current !== intensity) {
      lastIntensity.current = intensity
      const lit = intensity > 0.02
      lightRef.current.intensity = lit ? 2.4 + intensity * 5.2 : 2.4
      lightRef.current.distance = lit ? 2.6 + intensity * 1.4 : 2.6
      lightRef.current.color.copy(lit ? FLASH_LIGHT_COLOR : IDLE_LIGHT_COLOR)
    }
  })

  return (
    <group ref={gunRef} scale={0.68}>
      <pointLight
        ref={lightRef}
        position={[0.45, 0.5, 0.45]}
        intensity={2.4}
        distance={2.6}
        color="#c7efff"
      />
      <GunModel />
      <group ref={flashRef} visible={false} position={[0, 0.005, -0.98]}>
        <mesh ref={flashCoreRef} rotation={[0, 0, Math.PI / 4]}>
          <octahedronGeometry args={[0.06, 0]} />
          <meshBasicMaterial color="#fff8d0" transparent opacity={0.95} toneMapped={false} />
        </mesh>
        <mesh ref={flashHaloRef} scale={[0.5, 0.5, 1.6]}>
          <octahedronGeometry args={[0.11, 0]} />
          <meshBasicMaterial color="#ff8c1a" transparent opacity={0.55} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}
