import { asset } from '@/lib/helpers/assets'

export const MOON_DICE_CDN_PREFIX = `${asset('/mooncake')}/`

/** Blend JPG white padding into the green felt instead of opaque cards. */
export const MOON_DICE_DIE_CLASS =
  'h-16 w-16 object-contain mix-blend-multiply drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]'

export function getMoonDiceAssetFileName(value?: number, rolling = false): string {
  if (rolling) {
    return value ? `${value}.gif` : '1.jpg'
  }

  return value ? `${value}.jpg` : '1.jpg'
}

export function getMoonDiceAssetSrc(
  value?: number,
  rolling = false,
  cdnPrefix = MOON_DICE_CDN_PREFIX
): string {
  return `${cdnPrefix}${getMoonDiceAssetFileName(value, rolling)}`
}
