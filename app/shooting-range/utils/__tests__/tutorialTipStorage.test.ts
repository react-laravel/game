import { beforeEach, describe, expect, it } from 'vitest'
import {
  dismissTutorialTip,
  isTutorialTipDismissed,
} from '../tutorialTipStorage'

describe('tutorialTipStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts undismissed for each mode', () => {
    expect(isTutorialTipDismissed('moving')).toBe(false)
    expect(isTutorialTipDismissed('static')).toBe(false)
  })

  it('persists dismiss per training mode', () => {
    dismissTutorialTip('moving')
    expect(isTutorialTipDismissed('moving')).toBe(true)
    expect(isTutorialTipDismissed('static')).toBe(false)
  })
})
