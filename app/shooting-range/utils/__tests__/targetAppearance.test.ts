import { describe, expect, it } from 'vitest'
import { getTargetAppearance } from '../targetAppearance'

describe('targetAppearance', () => {
  it('assigns distinct ring colors for flick, tracking, and strafe modes', () => {
    const flick = getTargetAppearance('flick')
    const tracking = getTargetAppearance('tracking')
    const strafe = getTargetAppearance('moving')

    expect(flick.ringColor).not.toBe(tracking.ringColor)
    expect(tracking.ringColor).not.toBe(strafe.ringColor)
    expect(flick.ringColor).not.toBe(strafe.ringColor)
  })

  it('enables spawn brackets only for single-target flick and grid modes', () => {
    expect(getTargetAppearance('flick').showSpawnBrackets).toBe(true)
    expect(getTargetAppearance('precision').showSpawnBrackets).toBe(true)
    expect(getTargetAppearance('tracking').showSpawnBrackets).toBe(false)
    expect(getTargetAppearance('moving').showSpawnBrackets).toBe(false)
  })

  it('enables orbit hint only for tracking mode', () => {
    expect(getTargetAppearance('tracking').showOrbitHint).toBe(true)
    expect(getTargetAppearance('flick').showOrbitHint).toBe(false)
    expect(getTargetAppearance('moving').showOrbitHint).toBe(false)
  })
})
