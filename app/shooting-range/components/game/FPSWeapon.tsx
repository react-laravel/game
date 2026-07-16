import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { GunModel } from './GunModel'

interface FPSWeaponProps {
  muzzleFlash: boolean
}

/** First-person weapon with allocation-free camera following and restrained sway. */
export function FPSWeapon({ muzzleFlash }: FPSWeaponProps) {
  const { camera } = useThree()
  const gunRef = useRef<THREE.Group>(null)
  const localOffset = useRef(new THREE.Vector3(0.34, -0.29, -0.82))
  const worldOffset = useRef(new THREE.Vector3())
  const swayQuaternion = useRef(new THREE.Quaternion())
  const swayEuler = useRef(new THREE.Euler())

  useFrame(({ clock }) => {
    const gun = gunRef.current
    if (!gun) return

    const time = clock.getElapsedTime()
    worldOffset.current.copy(localOffset.current)
    if (muzzleFlash) worldOffset.current.z += 0.035
    worldOffset.current.applyQuaternion(camera.quaternion)

    gun.position.copy(camera.position).add(worldOffset.current)
    gun.quaternion.copy(camera.quaternion)

    swayEuler.current.set(
      Math.sin(time * 1.7) * 0.003,
      Math.sin(time * 1.25) * 0.004,
      Math.sin(time * 1.1) * 0.002
    )
    swayQuaternion.current.setFromEuler(swayEuler.current)
    gun.quaternion.multiply(swayQuaternion.current)
  })

  return (
    <group ref={gunRef} scale={0.68}>
      <pointLight position={[0.45, 0.5, 0.45]} intensity={2.4} distance={2.6} color="#c7efff" />
      <GunModel />
      {muzzleFlash && (
        <group position={[0, 0.005, -0.98]}>
          <pointLight intensity={3.5} color="#ffb020" distance={3} decay={2} />
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <octahedronGeometry args={[0.07, 0]} />
            <meshBasicMaterial color="#fff2a8" transparent opacity={0.95} toneMapped={false} />
          </mesh>
          <mesh scale={[0.55, 0.55, 1.8]}>
            <octahedronGeometry args={[0.12, 0]} />
            <meshBasicMaterial color="#ff7a00" transparent opacity={0.65} toneMapped={false} />
          </mesh>
        </group>
      )}
    </group>
  )
}
