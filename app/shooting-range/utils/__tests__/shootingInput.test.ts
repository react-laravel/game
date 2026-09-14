import { describe, expect, it } from 'vitest'
import { shouldAcceptLockedShot } from '../shootingInput'

describe('shouldAcceptLockedShot', () => {
  it('rejects shots when pointer lock is released', () => {
    const canvas = document.createElement('canvas')
    const button = document.createElement('button')
    expect(shouldAcceptLockedShot(null, canvas, button)).toBe(false)
    expect(shouldAcceptLockedShot(null, canvas)).toBe(false)
  })

  it('rejects shots aimed at pause or settings UI even if lock was just granted', () => {
    const canvas = document.createElement('canvas')
    const button = document.createElement('button')
    expect(shouldAcceptLockedShot(canvas, canvas, button)).toBe(false)
  })

  it('accepts shots only from the locked canvas', () => {
    const canvas = document.createElement('canvas')
    expect(shouldAcceptLockedShot(canvas, canvas, canvas)).toBe(true)
    expect(shouldAcceptLockedShot(canvas, canvas)).toBe(true)
  })
})
