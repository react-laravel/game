import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CROSSHAIR_CONFIG,
  getCrosshairArms,
  getCrosshairCircleRadius,
  getCrosshairSegments,
  normalizeCrosshairConfig,
  shouldRenderCenterDot,
} from '../crosshairConfig'

describe('crosshairConfig', () => {
  it('normalizes invalid values back to safe defaults', () => {
    const normalized = normalizeCrosshairConfig({
      style: 'invalid' as never,
      color: 'not-a-color',
      size: 99,
      thickness: 0,
      gap: -5,
      opacity: 2,
    })

    expect(normalized.style).toBe(DEFAULT_CROSSHAIR_CONFIG.style)
    expect(normalized.color).toBe(DEFAULT_CROSSHAIR_CONFIG.color)
    expect(normalized.size).toBe(28)
    expect(normalized.thickness).toBe(1)
    expect(normalized.gap).toBe(0)
    expect(normalized.opacity).toBe(1)
  })

  it('renders different arm layouts per style', () => {
    expect(getCrosshairArms('cross')).toHaveLength(4)
    expect(getCrosshairArms('t-shape')).toEqual(['top', 'left', 'right'])
    expect(getCrosshairArms('dot')).toEqual([])
    expect(getCrosshairSegments({ ...DEFAULT_CROSSHAIR_CONFIG, style: 'cross' })).toHaveLength(4)
    expect(getCrosshairCircleRadius({ ...DEFAULT_CROSSHAIR_CONFIG, style: 'circle' })).toBeGreaterThan(0)
    expect(getCrosshairCircleRadius({ ...DEFAULT_CROSSHAIR_CONFIG, style: 'cross' })).toBeNull()
    expect(shouldRenderCenterDot({ ...DEFAULT_CROSSHAIR_CONFIG, style: 'dot' })).toBe(true)
  })
})
