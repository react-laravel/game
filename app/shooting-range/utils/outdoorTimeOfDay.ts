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
    grassTint: '#7aaa78',
    horizonWash: { color: '#8ab8d8', opacity: 0.28 },
    showRangeLights: false,
    targetReadabilityBoost: 0,
  },
  {
    id: 'noon',
    label: '中午',
    hint: '烈日直射 · 高对比硬阴影',
    background: '#7eb0d0',
    fog: { color: '#b8d4e8', near: 98, far: 178 },
    hemisphere: { sky: '#e0f0ff', ground: '#4a7a44', intensity: 2.2 },
    directional: { color: '#fff8e8', intensity: 3.25, position: [6, 28, 4] },
    rimLight: { color: '#c8e4ff', intensity: 0.52, position: [-8, 12, 10] },
    toneMappingExposure: 1.22,
    sky: {
      sunPosition: [20, 62, -12],
      mieCoefficient: 0.003,
      mieDirectionalG: 0.82,
      rayleigh: 1.25,
      turbidity: 4.8,
    },
    groundTint: '#4e8648',
    grassTint: '#7aaa78',
    horizonWash: { color: '#a8cce0', opacity: 0.22 },
    showRangeLights: false,
    targetReadabilityBoost: 0,
  },
  {
    id: 'dusk',
    label: '傍晚',
    hint: '金色时刻 · 暖色长影',
    background: '#b86840',
    fog: { color: '#c89868', near: 92, far: 168 },
    hemisphere: { sky: '#f0d0a0', ground: '#3e5c3a', intensity: 1.62 },
    directional: { color: '#ffc888', intensity: 2.25, position: [28, 12, -6] },
    rimLight: { color: '#f0a860', intensity: 0.78, position: [-14, 6, 8] },
    toneMappingExposure: 1.0,
    sky: {
      sunPosition: [120, 8, -28],
      mieCoefficient: 0.006,
      mieDirectionalG: 0.78,
      rayleigh: 2.1,
      turbidity: 8.5,
    },
    groundTint: '#4a6e40',
    grassTint: '#4a7648',
    horizonWash: { color: '#d89858', opacity: 0.28 },
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
    hemisphere: { sky: '#243848', ground: '#5a7860', intensity: 1.38 },
    directional: { color: '#c0d8f0', intensity: 0.68, position: [-18, 10, -8] },
    rimLight: { color: '#90a8c0', intensity: 0.45, position: [12, 5, 14] },
    fillLight: { color: '#fff0d8', intensity: 2.05, position: [0, 5, -20] },
    toneMappingExposure: 1.2,
    sky: {
      sunPosition: [24, -16, -48],
      mieCoefficient: 0.002,
      mieDirectionalG: 0.74,
      rayleigh: 0.28,
      turbidity: 2.2,
    },
    groundTint: '#5a7060',
    grassTint: '#5a7060',
    showRangeLights: true,
    targetReadabilityBoost: 0.62,
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
