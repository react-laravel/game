import { describe, expect, it } from 'vitest'
import {
  getMoonDiceAssetFileName,
  getMoonDiceAssetSrc,
  MOON_DICE_DIE_CLASS,
} from '../moonDiceAssets'

describe('moonDiceAssets', () => {
  it('resolves resting, rolling, and placeholder dice filenames', () => {
    expect(getMoonDiceAssetFileName()).toBe('1.jpg')
    expect(getMoonDiceAssetFileName(4)).toBe('4.jpg')
    expect(getMoonDiceAssetFileName(3, true)).toBe('3.gif')
    expect(getMoonDiceAssetFileName(undefined, true)).toBe('1.jpg')
  })

  it('builds CDN asset URLs', () => {
    expect(getMoonDiceAssetSrc(5, false, 'https://example.test/mooncake/')).toBe(
      'https://example.test/mooncake/5.jpg'
    )
    expect(getMoonDiceAssetSrc(2, true, 'https://example.test/mooncake/')).toBe(
      'https://example.test/mooncake/2.gif'
    )
  })

  it('uses blend mode instead of opaque card backgrounds', () => {
    expect(MOON_DICE_DIE_CLASS).toContain('mix-blend-multiply')
    expect(MOON_DICE_DIE_CLASS).not.toContain('bg-white')
    expect(MOON_DICE_DIE_CLASS).not.toContain('rounded-xl')
  })
})
