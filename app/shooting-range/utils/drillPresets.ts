import type { ShootingDifficulty, ShootingMapId, TrainingModeId } from '../types'

export type DrillFocus = 'flick' | 'tracking' | 'speed' | 'precision' | 'mixed'

export interface DrillPreset {
  id: string
  name: string
  subtitle: string
  focus: DrillFocus
  modeId: TrainingModeId
  mapId: ShootingMapId
  difficulty: ShootingDifficulty
  /** Short label shown on quick-start cards */
  tag: string
}

export const drillPresets: DrillPreset[] = [
  {
    id: 'flick-reflex',
    name: '甩枪反应',
    subtitle: '单靶闪现 · 练第一眼定位',
    focus: 'flick',
    modeId: 'flick',
    mapId: 'indoor',
    difficulty: 'medium',
    tag: 'Flick',
  },
  {
    id: 'grid-speed',
    name: '网格速点',
    subtitle: '顺序网格靶 · 准度与手速',
    focus: 'precision',
    modeId: 'precision',
    mapId: 'indoor',
    difficulty: 'medium',
    tag: 'Grid',
  },
  {
    id: 'orbit-track',
    name: '环绕跟枪',
    subtitle: '匀速轨道靶 · 平滑追踪',
    focus: 'tracking',
    modeId: 'tracking',
    mapId: 'outdoor',
    difficulty: 'medium',
    tag: 'Track',
  },
  {
    id: 'strafe-rush',
    name: '乱战移动',
    subtitle: '多靶乱窜 · 预判与跟枪',
    focus: 'mixed',
    modeId: 'moving',
    mapId: 'warehouse',
    difficulty: 'hard',
    tag: 'Strafe',
  },
  {
    id: 'speed-burst',
    name: '45 秒速射',
    subtitle: '高密度限时 · 射速与精度',
    focus: 'speed',
    modeId: 'timed',
    mapId: 'indoor',
    difficulty: 'hard',
    tag: 'Speed',
  },
  {
    id: 'static-aim',
    name: '静态精准',
    subtitle: '多靶静止 · 稳定瞄准',
    focus: 'precision',
    modeId: 'static',
    mapId: 'outdoor',
    difficulty: 'easy',
    tag: 'Aim',
  },
]

export const defaultDrillPreset = drillPresets[0]

export function findDrillPreset(id: string): DrillPreset | undefined {
  return drillPresets.find(preset => preset.id === id)
}

export function drillLabelForConfig(
  modeId: TrainingModeId,
  mapId: ShootingMapId,
  difficulty: ShootingDifficulty
): string {
  const match = drillPresets.find(
    preset =>
      preset.modeId === modeId && preset.mapId === mapId && preset.difficulty === difficulty
  )
  if (match) return match.name
  return `${modeId} · ${mapId}`
}
