import { useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { PerspectiveCamera } from 'three'
import { BASE_FOV, WEAPONS, type WeaponId } from '../../utils/weapons'

/** Single owner of zoom projection. Camera orientation remains owned by GameScene. */
export function WeaponAimCamera({
  weaponId,
  isAiming,
  reducedMotion = false,
}: {
  weaponId: WeaponId
  isAiming: boolean
  reducedMotion?: boolean
}) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera
  useEffect(() => {
    const originalFov = camera.fov
    return () => {
      camera.fov = originalFov
      camera.updateProjectionMatrix()
    }
  }, [camera])
  useFrame((_, delta) => {
    const targetFov = isAiming ? WEAPONS[weaponId].aimFov : BASE_FOV
    const nextFov = reducedMotion
      ? targetFov
      : camera.fov + (targetFov - camera.fov) * (1 - Math.exp(-22 * delta))
    const fov = Math.abs(nextFov - targetFov) < 0.01 ? targetFov : nextFov
    if (camera.fov !== fov) {
      // eslint-disable-next-line react-hooks/immutability -- R3F's camera is an imperative Three.js object, not React state.
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
  }, -1)
  return null
}
