import type { TrainingModeId } from '../types'

const KEY_PREFIX = 'shooting-range-tip-dismissed-'

export function isTutorialTipDismissed(modeId: TrainingModeId): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(`${KEY_PREFIX}${modeId}`) === '1'
  } catch {
    return false
  }
}

export function dismissTutorialTip(modeId: TrainingModeId): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${KEY_PREFIX}${modeId}`, '1')
  } catch {
    // localStorage may be unavailable in private mode — ignore.
  }
}
