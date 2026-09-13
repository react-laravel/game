import type { OutdoorTimeOfDay } from '../types'
import type { MapConfig } from './mapConfigs'

export const DEFAULT_OUTDOOR_TIME_OF_DAY: OutdoorTimeOfDay = 'day'

export interface OutdoorSkyParams {
  sunPosition: [number, number, number]
  mieCoefficient: number
  mieDirectionalG: number
  rayleigh: number
  turbidity: number
}

export interface OutdoorTimePreset {
  id: OutdoorTimeOfDay
  label: string
  hint: string
  background: string
  fog: MapConfig['fog']
  hemisphere: MapConfig['hemisphere']
  directional: MapConfig['directional']
  rimLight?: MapConfig['rimLight']
  fillLight?: MapConfig['fillLight']
  toneMappingExposure: number
  sky: OutdoorSkyParams
  groundTint: string
  grassTint: string
  horizonWash?: { color: string; opacity: number }
  showRangeLights: boolean
  /** 0–1 boost for target plate emissive in low light (night only). */
  targetReadabilityBoost: number
}

export const OUTDOOR_TIME_OPTIONS: OutdoorTimePreset[] = [
  {
    id: 'day',
    label: '白天',
    hint: '清晨晴空 · 柔和侧光',
    background: '#6a9ec0',
    fog: { color: '#a8c4d8', near: 95, far: 175 },
    hemisphere: { sky: '#c8e4f8', ground: '#3a6a38', intensity: 1.95 },
    directional: { color: '#fff0d8', intensity: 2.65, position: [14, 22, 8] },
    rimLight: { color: '#b8dcff', intensity: 0.72, position: [-10, 8, 12] },
    toneMappingExposure: 1.02,
    sky: {
      sunPosition: [85, 22, -45],
      mieCoefficient: 0.004,
      mieDirectionalG: 0.8,
      rayleigh: 1.55,
      turbidity: 6.2,
    },
    groundTint: '#4a8448',
    grassTint: '#4a7a48',
    horizonWash: { color: '#8ab8d8', opacity: 0.28 },
    showRangeLights: false,
    targetReadabilityBoost: 0,
  },
  {
    id: 'noon',
    label: '中午',
    hint: '烈日直射 · 高对比硬阴影',
    background: '#8ab8d8',
    fog: { color: '#c8dce8', near: 105, far: 185 },
    hemisphere: { sky: '#e8f4ff', ground: '#4a7a44', intensity: 2.35 },
    directional: { color: '#fffef0', intensity: 3.45, position: [6, 28, 4] },
    rimLight: { color: '#d8ecff', intensity: 0.45, position: [-8, 12, 10] },
    toneMappingExposure: 1.18,
    sky: {
      sunPosition: [20, 62, -12],
      mieCoefficient: 0.003,
      mieDirectionalG: 0.82,
      rayleigh: 1.25,
      turbidity: 4.8,
    },
    groundTint: '#528a4a',
    grassTint: '#5a8a50',
    horizonWash: { color: '#b8d8f0', opacity: 0.18 },
    showRangeLights: false,
    targetReadabilityBoost: 0,
  },
  {
    id: 'dusk',
    label: '傍晚',
    hint: '金色时刻 · 暖色长影',
    background: '#c87848',
    fog: { color: '#d8a878', near: 88, far: 165 },
    hemisphere: { sky: '#f8d8a8', ground: '#3a5838', intensity: 1.55 },
    directional: { color: '#ffd090', intensity: 2.15, position: [28, 12, -6] },
    rimLight: { color: '#ffb870', intensity: 0.85, position: [-14, 6, 8] },
    toneMappingExposure: 0.95,
    sky: {
      sunPosition: [120, 8, -28],
      mieCoefficient: 0.006,
      mieDirectionalG: 0.78,
      rayleigh: 2.1,
      turbidity: 8.5,
    },
    groundTint: '#4a7040',
    grassTint: '#456838',
    horizonWash: { color: '#e8a868', opacity: 0.32 },
    showRangeLights: false,
    targetReadabilityBoost: 0,
  },
  {
    id: 'night',
    label: '晚上',
    hint: '夜间靶场 · 灯柱与背坡照明',
    background: '#080e18',
    // Match background and push fog past the play space — avoids muddy mid-frame haze.
    fog: { color: '#080e18', near: 118, far: 228 },
    hemisphere: { sky: '#1e3040', ground: '#4a6850', intensity: 1.18 },
    directional: { color: '#b8d0e8', intensity: 0.58, position: [-18, 10, -8] },
    rimLight: { color: '#8098b0', intensity: 0.38, position: [12, 5, 14] },
    fillLight: { color: '#ffe8c8', intensity: 1.72, position: [0, 4.5, -18] },
    toneMappingExposure: 1.14,
    sky: {
      sunPosition: [24, -16, -48],
      mieCoefficient: 0.002,
      mieDirectionalG: 0.74,
      rayleigh: 0.28,
      turbidity: 2.2,
    },
    groundTint: '#4a6450',
    grassTint: '#4a6450',
    showRangeLights: true,
    targetReadabilityBoost: 0.54,
  },
]

const presetById = Object.fromEntries(
  OUTDOOR_TIME_OPTIONS.map(preset => [preset.id, preset])
) as Record<OutdoorTimeOfDay, OutdoorTimePreset>

export function normalizeOutdoorTimeOfDay(value: unknown): OutdoorTimeOfDay {
  if (value === 'noon' || value === 'dusk' || value === 'night' || value === 'day') {
    return value
  }
  return DEFAULT_OUTDOOR_TIME_OF_DAY
}

export function outdoorTimeLabel(timeOfDay: OutdoorTimeOfDay): string {
  return presetById[timeOfDay]?.label ?? presetById.day.label
}

export function getOutdoorTimePreset(timeOfDay: OutdoorTimeOfDay): OutdoorTimePreset {
  return presetById[timeOfDay] ?? presetById.day
}

export interface ResolvedOutdoorEnvironment {
  config: MapConfig
  sky: OutdoorSkyParams
  grassTint: string
  toneMappingExposure: number
  showRangeLights: boolean
  horizonWash?: { color: string; opacity: number }
  targetReadabilityBoost: number
}

export function resolveOutdoorEnvironment(
  baseConfig: MapConfig,
  timeOfDay: OutdoorTimeOfDay
): ResolvedOutdoorEnvironment {
  const preset = getOutdoorTimePreset(timeOfDay)

  return {
    config: {
      ...baseConfig,
      background: preset.background,
      fog: preset.fog,
      hemisphere: preset.hemisphere,
      directional: preset.directional,
      rimLight: preset.rimLight,
      fillLight: preset.fillLight,
      floor: { ...baseConfig.floor, color: preset.groundTint },
    },
    sky: preset.sky,
    grassTint: preset.grassTint,
    toneMappingExposure: preset.toneMappingExposure,
    showRangeLights: preset.showRangeLights,
    horizonWash: preset.horizonWash,
    targetReadabilityBoost: preset.targetReadabilityBoost,
  }
}

export function getOutdoorTargetReadabilityBoost(timeOfDay: OutdoorTimeOfDay): number {
  return getOutdoorTimePreset(timeOfDay).targetReadabilityBoost
}
