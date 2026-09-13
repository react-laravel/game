/** Master SFX volume for shooting-range Web Audio cues. */

export const DEFAULT_SFX_VOLUME = 0.85
export const MIN_SFX_VOLUME = 0
export const MAX_SFX_VOLUME = 1
export const SFX_VOLUME_STEP = 0.05

export const SFX_VOLUME_PRESETS: Array<{ id: string; label: string; hint: string; value: number }> = [
  { id: 'low', label: '轻柔', hint: '夜间练习', value: 0.45 },
  { id: 'default', label: '标准', hint: '推荐默认', value: 0.85 },
  { id: 'high', label: '响亮', hint: '清晰反馈', value: 1 },
]

export function clampSfxVolume(value: number): number {
  const stepped = Math.round(value / SFX_VOLUME_STEP) * SFX_VOLUME_STEP
  const clamped = Math.min(MAX_SFX_VOLUME, Math.max(MIN_SFX_VOLUME, stepped))
  return Math.round(clamped * 100) / 100
}

export function normalizeSfxVolume(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return DEFAULT_SFX_VOLUME
  return clampSfxVolume(value)
}

export function normalizeSfxMuted(value: unknown): boolean {
  return value === true
}

export function sfxVolumeLabel(value: number): string {
  const clamped = clampSfxVolume(value)
  if (clamped <= 0.35) return '轻柔'
  if (clamped >= 0.95) return '响亮'
  return '标准'
}

export function sfxVolumePercent(value: number): number {
  return Math.round(clampSfxVolume(value) * 100)
}
