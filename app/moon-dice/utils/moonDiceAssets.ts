import { asset } from '@/lib/helpers/assets'

export const MOON_DICE_CDN_PREFIX = `${asset('/mooncake')}/`

/** Crop JPG padding while keeping dice faces bright (no multiply tint). */
export const MOON_DICE_DIE_FRAME_CLASS =
  'relative inline-flex h-16 w-16 shrink-0 overflow-hidden drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]'

export const MOON_DICE_DIE_CLASS =
  'absolute inset-0 h-full w-full scale-[1.38] object-contain'

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
