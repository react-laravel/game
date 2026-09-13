import { describe, expect, it } from 'vitest'
import {
  BASE_LOOK_SPEED,
  clampLookSensitivity,
  DEFAULT_LOOK_SENSITIVITY,
  lookSensitivityLabel,
  lookSpeedForSensitivity,
  normalizeLookSensitivity,
} from '../lookSensitivity'

describe('lookSensitivity', () => {
  it('clamps and steps values into the supported range', () => {
    expect(clampLookSensitivity(0.1)).toBe(0.5)
    expect(clampLookSensitivity(3)).toBe(2)
    expect(clampLookSensitivity(1.23)).toBeCloseTo(1.2, 5)
  })

  it('normalizes invalid input to the default', () => {
    expect(normalizeLookSensitivity(undefined)).toBe(DEFAULT_LOOK_SENSITIVITY)
    expect(normalizeLookSensitivity('fast')).toBe(DEFAULT_LOOK_SENSITIVITY)
  })

  it('scales base look speed by sensitivity', () => {
    expect(lookSpeedForSensitivity(1)).toBeCloseTo(BASE_LOOK_SPEED, 8)
    expect(lookSpeedForSensitivity(2)).toBeCloseTo(BASE_LOOK_SPEED * 2 ** 1.06, 8)
  })

  it('maps values to readable labels', () => {
    expect(lookSensitivityLabel(0.6)).toBe('较慢')
    expect(lookSensitivityLabel(1)).toBe('标准')
    expect(lookSensitivityLabel(1.5)).toBe('较快')
  })
})
