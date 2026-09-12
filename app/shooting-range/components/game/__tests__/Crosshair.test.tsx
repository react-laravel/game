import { describe, expect, it } from 'vitest'
import { DEFAULT_CROSSHAIR_CONFIG } from '../../../utils/crosshairConfig'
import { Crosshair } from '../Crosshair'

describe('Crosshair', () => {
  it('should render configured crosshair', () => {
    const result = Crosshair({ config: DEFAULT_CROSSHAIR_CONFIG })
    expect(result).toBeDefined()
  })

  it('should render hit feedback state', () => {
    const result = Crosshair({
      config: { ...DEFAULT_CROSSHAIR_CONFIG, style: 'dot' },
      hit: true,
    })
    expect(result).toBeDefined()
  })
})
