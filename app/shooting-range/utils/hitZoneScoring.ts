import type { HitZone, TargetShape } from '../types'

export const HIT_ZONE_MULTIPLIERS: Record<HitZone, number> = {
  head: 2,
  body: 1,
  limb: 0.5,
}

export const HIT_ZONE_LABELS: Record<HitZone, string> = {
  head: '头部',
  body: '躯干',
  limb: '四肢',
}

export function resolveHitPoints(
  baseScore: number,
  hitZone?: HitZone,
  targetShape: TargetShape = 'circle'
): number {
  if (targetShape !== 'humanoid') return baseScore
  const zone = hitZone ?? 'body'
  return Math.round(baseScore * HIT_ZONE_MULTIPLIERS[zone])
}

export function hitZoneLabel(zone: HitZone): string {
  return HIT_ZONE_LABELS[zone]
}
