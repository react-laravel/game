import { SHOT_COOLDOWN_MS } from './gunFeel'

export type WeaponId = 'pistol' | 'sniper'

export const BASE_FOV = 62
export const WEAPONS = {
  pistol: { name: '手枪', key: '1', aimFov: 44, cooldownMs: SHOT_COOLDOWN_MS, muzzleZ: -0.42 },
  sniper: { name: '狙击枪', key: '2', aimFov: 16, cooldownMs: 700, muzzleZ: -1.46 },
} as const

export function weaponForKey(code: string): WeaponId | null {
  if (code === 'Digit1' || code === 'Numpad1') return 'pistol'
  if (code === 'Digit2' || code === 'Numpad2') return 'sniper'
  return null
}

export function nextWeapon(weapon: WeaponId): WeaponId {
  return weapon === 'pistol' ? 'sniper' : 'pistol'
}

/** Match pointer speed to the actual projected zoom, including the transition frames. */
export function zoomSensitivityScale(fov: number): number {
  return Math.tan((fov * Math.PI) / 360) / Math.tan((BASE_FOV * Math.PI) / 360)
}

export function isWeaponUiTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        'button, input, textarea, select, a, [role="slider"], [role="tab"], [contenteditable="true"]'
      )
    )
  )
}
