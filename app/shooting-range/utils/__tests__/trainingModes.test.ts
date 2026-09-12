import { describe, expect, it } from 'vitest'
import { resolveTrainingSettings, trainingModes } from '../trainingModes'

describe('trainingModes', () => {
  it('exposes all required training modes', () => {
    expect(Object.keys(trainingModes).sort()).toEqual([
      'flick',
      'moving',
      'static',
      'timed',
      'tracking',
    ])
  })

  it('resolves mode-specific target counts and movement', () => {
    const staticSettings = resolveTrainingSettings('easy', 'static')
    expect(staticSettings.movement).toBe('static')
    expect(staticSettings.targetSpeed).toBe(0)

    const flickSettings = resolveTrainingSettings('hard', 'flick')
    expect(flickSettings.targetCount).toBeLessThan(16)
    expect(flickSettings.scorePerHit).toBe(15)

    const timedSettings = resolveTrainingSettings('medium', 'timed')
    expect(timedSettings.durationSeconds).toBe(45)
    expect(timedSettings.targetSpeed).toBeGreaterThan(0.02)
  })
})
