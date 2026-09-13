/** Motion / accessibility preferences for shooting-range feedback. */

export type MotionPreference = 'auto' | 'reduce' | 'full'

export const MOTION_PREFS_STORAGE_KEY = 'shooting-range-motion-preference'

export const REDUCED_MOTION_FLASH_SCALE = 0.32
export const REDUCED_MOTION_PARTICLE_SCALE = 0.55

export function systemPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function normalizeMotionPreference(value: unknown): MotionPreference {
  if (value === 'reduce' || value === 'full' || value === 'auto') return value
  return 'auto'
}

export function loadMotionPreference(): MotionPreference {
  if (typeof window === 'undefined') return 'auto'
  try {
    const raw = window.localStorage.getItem(MOTION_PREFS_STORAGE_KEY)
    return normalizeMotionPreference(raw)
  } catch {
    return 'auto'
  }
}

export function saveMotionPreference(value: MotionPreference) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(MOTION_PREFS_STORAGE_KEY, value)
  } catch {
    // ignore quota / private mode
  }
}

export function resolveReducedMotion(preference: MotionPreference): boolean {
  if (preference === 'reduce') return true
  if (preference === 'full') return false
  return systemPrefersReducedMotion()
}

export function motionFlashScale(reducedMotion: boolean): number {
  return reducedMotion ? REDUCED_MOTION_FLASH_SCALE : 1
}

export function motionParticleScale(reducedMotion: boolean): number {
  return reducedMotion ? REDUCED_MOTION_PARTICLE_SCALE : 1
}
