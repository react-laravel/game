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

  it('resolves clearly different movement profiles per mode', () => {
    const staticSettings = resolveTrainingSettings('easy', 'static')
    expect(staticSettings.movement).toBe('static')
    expect(staticSettings.targetSpeed).toBe(0)
    expect(staticSettings.faceCamera).toBe(false)
    expect(staticSettings.targetCount).toBeGreaterThanOrEqual(8)

    const movingSettings = resolveTrainingSettings('easy', 'moving')
    expect(movingSettings.movement).toBe('linear')
    expect(movingSettings.targetSpeed).toBeGreaterThan(0.04)
    expect(movingSettings.faceCamera).toBe(true)

    const flickSettings = resolveTrainingSettings('hard', 'flick')
    expect(flickSettings.targetCount).toBe(1)
    expect(flickSettings.movement).toBe('static')
    expect(flickSettings.respawnDelayMs).toBeLessThanOrEqual(400)
    expect(flickSettings.scorePerHit).toBe(15)

    const trackingSettings = resolveTrainingSettings('medium', 'tracking')
    expect(trackingSettings.movement).toBe('orbit')
    expect(trackingSettings.orbitRadius).toBeGreaterThan(0)
    expect(trackingSettings.targetCount).toBeLessThan(12)

    const timedSettings = resolveTrainingSettings('medium', 'timed')
    expect(timedSettings.durationSeconds).toBe(45)
    expect(timedSettings.targetSpeed).toBeGreaterThan(movingSettings.targetSpeed)
  })
})
