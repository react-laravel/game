/** Tunable gun-feel constants — frame-based flash, recoil, and hit-marker timing. */

export const MUZZLE_FLASH_DURATION = 0.072
export const HIT_MARKER_DURATION_MS = 120
export const RECOIL_KICK_PITCH = 0.017
export const RECOIL_KICK_YAW = 0.0032
export const RECOIL_RECOVERY_SPEED = 13.5

/** Snappy peak-then-decay curve for muzzle flash intensity (0–1). */
export function muzzleFlashIntensity(elapsed: number): number {
  if (elapsed < 0 || elapsed >= MUZZLE_FLASH_DURATION) return 0
  const t = elapsed / MUZZLE_FLASH_DURATION
  if (t < 0.12) return 0.55 + (t / 0.12) * 0.45
  const decay = (t - 0.12) / 0.88
  return Math.max(0, (1 - decay) ** 2.1)
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
