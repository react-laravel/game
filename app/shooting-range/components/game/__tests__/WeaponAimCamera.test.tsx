import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PerspectiveCamera } from 'three'
import { WeaponAimCamera } from '../WeaponAimCamera'
import { BASE_FOV, WEAPONS } from '../../../utils/weapons'

const mock = vi.hoisted(() => ({
  state: {} as { camera: PerspectiveCamera },
  frame: (_: unknown, _delta: number) => {},
}))
vi.mock('@react-three/fiber', () => ({
  useThree: (select: (state: typeof mock.state) => unknown) => select(mock.state),
  useFrame: (callback: typeof mock.frame) => {
    mock.frame = callback
  },
}))

describe('weapon aim projection', () => {
  beforeEach(() => {
    mock.state = { camera: new PerspectiveCamera(BASE_FOV, 16 / 9, 0.05, 90) }
  })
  const step = () => {
    for (let i = 0; i < 60; i++) mock.frame(mock.state, 1 / 60)
  }

  it('zooms both weapons and updates the actual projection matrix, then returns to normal', () => {
    const initial = mock.state.camera.projectionMatrix.elements[5]
    const { rerender, unmount } = render(<WeaponAimCamera weaponId="pistol" isAiming />)
    step()
    expect(mock.state.camera.fov).toBe(WEAPONS.pistol.aimFov)
    expect(mock.state.camera.projectionMatrix.elements[5]).toBeGreaterThan(initial)
    rerender(<WeaponAimCamera weaponId="sniper" isAiming />)
    step()
    expect(mock.state.camera.fov).toBe(WEAPONS.sniper.aimFov)
    rerender(<WeaponAimCamera weaponId="sniper" isAiming={false} />)
    step()
    expect(mock.state.camera.fov).toBe(BASE_FOV)
    rerender(<WeaponAimCamera weaponId="sniper" isAiming />)
    step()
    unmount()
    expect(mock.state.camera.fov).toBe(BASE_FOV)
  })
})
