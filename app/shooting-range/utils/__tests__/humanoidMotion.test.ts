import { describe, expect, it } from 'vitest'
import {
  createBotMotionState,
  getBotMotionProfile,
  stepBotMotion,
} from '../humanoidMotion'

describe('humanoidMotion', () => {
  it('exposes motion profiles for every training mode', () => {
    const modes = ['static', 'moving', 'flick', 'tracking', 'timed', 'precision'] as const
    for (const mode of modes) {
      const profile = getBotMotionProfile(mode)
      expect(profile.phases.length).toBeGreaterThan(0)
      expect(profile.strafeSpeed).toBeGreaterThan(0)
    }
  })

  it('steps bot motion without NaN offsets', () => {
    const state = createBotMotionState(3)
    const profile = getBotMotionProfile('moving')
    const sample = stepBotMotion(state, 0.05, profile, 1.2)

    expect(Number.isFinite(sample.offsetX)).toBe(true)
    expect(Number.isFinite(sample.offsetY)).toBe(true)
    expect(Number.isFinite(sample.offsetZ)).toBe(true)
    expect(sample.crouchScale).toBeGreaterThan(0.5)
    expect(sample.crouchScale).toBeLessThanOrEqual(1)
  })

  it('advances to a new phase after duration elapses', () => {
    const state = createBotMotionState(7)
    const profile = getBotMotionProfile('timed')
    state.phaseDuration = 0.1
    state.phase = 'strafe'

    stepBotMotion(state, 0.2, profile, 2)
    expect(state.phase).not.toBe('strafe')
  })
})
