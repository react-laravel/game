/** Tunable gun-feel constants — frame-based flash, recoil, and hit-marker timing. */

export const SHOT_COOLDOWN_MS = 132
export const MUZZLE_FLASH_DURATION = 0.064
export const HIT_MARKER_DURATION_MS = 120
export const HEADSHOT_MARKER_DURATION_MS = 165
export const MISS_MARKER_DURATION_MS = 82
export const BODY_HIT_FLASH_DURATION = 0.24
/** Slightly longer headshot flash for QA readability without changing gameplay cadence. */
export const HEADSHOT_FLASH_DURATION = 0.34
export const RECOIL_KICK_PITCH = 0.019
export const RECOIL_KICK_YAW = 0.0036
export const RECOIL_RECOVERY_SPEED = 15.5

export function hitFlashDurationForZone(hitZone?: 'head' | 'body' | 'limb'): number {
  return hitZone === 'head' ? HEADSHOT_FLASH_DURATION : BODY_HIT_FLASH_DURATION
}

/** Snappy peak-then-decay curve for muzzle flash intensity (0–1). */
export function muzzleFlashIntensity(elapsed: number, motionScale = 1): number {
  if (elapsed < 0 || elapsed >= MUZZLE_FLASH_DURATION) return 0
  const t = elapsed / MUZZLE_FLASH_DURATION
  let intensity = 0
  if (t < 0.12) intensity = 0.55 + (t / 0.12) * 0.45
  else {
    const decay = (t - 0.12) / 0.88
    intensity = Math.max(0, (1 - decay) ** 2.1)
  }
  const scale = Math.max(0, Math.min(1, motionScale))
  return intensity * scale
}

/** Exponential recoil recovery — returns 0 when settled. */
export function decayRecoil(current: number, delta: number, speed = RECOIL_RECOVERY_SPEED): number {
  if (current === 0) return 0
  const next = current * Math.exp(-speed * delta)
  return Math.abs(next) < 0.00015 ? 0 : next
}

/** Random yaw kick within ±RECOIL_KICK_YAW. */
export function randomRecoilYaw(): number {
  return (Math.random() - 0.5) * RECOIL_KICK_YAW * 2
}
