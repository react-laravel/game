/** Mouse-look sensitivity multiplier (1.0 = default feel). */

export const DEFAULT_LOOK_SENSITIVITY = 1
export const MIN_LOOK_SENSITIVITY = 0.5
export const MAX_LOOK_SENSITIVITY = 2
export const LOOK_SENSITIVITY_STEP = 0.1
export const BASE_LOOK_SPEED = 0.002

export const LOOK_SENSITIVITY_PRESETS: Array<{ id: string; label: string; hint: string; value: number }> = [
  { id: 'low', label: '慢', hint: '精细瞄准', value: 0.7 },
  { id: 'default', label: '标准', hint: '推荐默认', value: 1 },
  { id: 'high', label: '快', hint: '快速甩枪', value: 1.4 },
]

export function clampLookSensitivity(value: number): number {
  const stepped = Math.round(value / LOOK_SENSITIVITY_STEP) * LOOK_SENSITIVITY_STEP
  return Math.min(MAX_LOOK_SENSITIVITY, Math.max(MIN_LOOK_SENSITIVITY, stepped))
}

export function normalizeLookSensitivity(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return DEFAULT_LOOK_SENSITIVITY
  return clampLookSensitivity(value)
}

export function lookSpeedForSensitivity(sensitivity: number): number {
  return BASE_LOOK_SPEED * clampLookSensitivity(sensitivity)
}

export function lookSensitivityLabel(value: number): string {
  const clamped = clampLookSensitivity(value)
  if (clamped <= 0.65) return '较慢'
  if (clamped >= 1.35) return '较快'
  return '标准'
}
