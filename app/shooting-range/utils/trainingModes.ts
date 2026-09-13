import type { SpawnPattern, TrainingModeId } from '../types'
import { difficultySettings } from './gameUtils'

export type TargetMovement = 'static' | 'linear' | 'orbit'

export interface TrainingModeConfig {
  id: TrainingModeId
  name: string
  description: string
  durationSeconds: number
  /** Absolute target speed before difficulty scaling. */
  baseSpeed: number
  targetCountMultiplier: number
  /** When set, caps how many targets are spawned regardless of difficulty count. */
  maxActiveTargets?: number
  movement: TargetMovement
  respawnDelayMs: number
  scorePerHit: number
  jitterChance: number
  faceCamera: boolean
  orbitRadius?: number
  orbitSpeed?: number
  spawnPattern?: SpawnPattern
  /** Short skill tag for HUD / results */
  focus: string
  /** One-line behavior hint for in-session HUD */
  hudHint: string
}

export const trainingModes: Record<TrainingModeId, TrainingModeConfig> = {
  static: {
    id: 'static',
    name: '静态精准',
    description: '全场多靶同时静止，练稳定瞄准与准度',
    focus: 'Precision',
    hudHint: '多靶静止 · 练稳定瞄准',
    durationSeconds: 60,
    baseSpeed: 0,
    targetCountMultiplier: 1,
    movement: 'static',
    respawnDelayMs: 1100,
    scorePerHit: 10,
    jitterChance: 0,
    faceCamera: false,
  },
  moving: {
    id: 'moving',
    name: '动态追踪',
    description: '多靶高速反弹乱窜，练预判与持续跟枪',
    focus: 'Strafe',
    hudHint: '多靶乱窜 · 练预判跟枪',
    durationSeconds: 60,
    baseSpeed: 0.055,
    targetCountMultiplier: 1,
    movement: 'linear',
    respawnDelayMs: 850,
    scorePerHit: 10,
    jitterChance: 0.5,
    faceCamera: true,
  },
  flick: {
    id: 'flick',
    name: '甩枪反应',
    description: '单靶闪现换点，练第一眼定位与反应',
    focus: 'Flick',
    hudHint: '单靶闪现 · 练第一眼定位',
    durationSeconds: 60,
    baseSpeed: 0,
    targetCountMultiplier: 1,
    maxActiveTargets: 1,
    movement: 'static',
    respawnDelayMs: 350,
    scorePerHit: 15,
    jitterChance: 0,
    faceCamera: false,
  },
  tracking: {
    id: 'tracking',
    name: '环绕跟枪',
    description: '少量靶沿圆形轨迹匀速环绕，练平滑追踪',
    focus: 'Tracking',
    hudHint: '轨道环绕 · 练平滑追踪',
    durationSeconds: 60,
    baseSpeed: 0,
    targetCountMultiplier: 0.55,
    movement: 'orbit',
    respawnDelayMs: 900,
    scorePerHit: 12,
    jitterChance: 0,
    faceCamera: true,
    orbitRadius: 3.2,
    orbitSpeed: 1.45,
  },
  timed: {
    id: 'timed',
    name: '速射挑战',
    description: '45 秒高密度移动靶，射速与精度并重',
    focus: 'Speed',
    hudHint: '限时高密度 · 射速与精度',
    durationSeconds: 45,
    baseSpeed: 0.065,
    targetCountMultiplier: 1.15,
    movement: 'linear',
    respawnDelayMs: 500,
    scorePerHit: 10,
    jitterChance: 0.45,
    faceCamera: true,
  },
  precision: {
    id: 'precision',
    name: '网格速点',
    description: '单靶按网格顺序闪现，练准度与手速',
    durationSeconds: 60,
    baseSpeed: 0,
    targetCountMultiplier: 1,
    maxActiveTargets: 1,
    movement: 'static',
    respawnDelayMs: 280,
    scorePerHit: 12,
    jitterChance: 0,
    faceCamera: false,
    spawnPattern: 'grid',
    focus: 'Grid',
    hudHint: '网格顺序 · 练准度手速',
  },
}

export const trainingModeOptions = Object.values(trainingModes)

const difficultySpeedScale = {
  easy: 0.88,
  medium: 1,
  hard: 1.14,
} as const

export function resolveTrainingSettings(
  difficulty: keyof typeof difficultySettings,
  modeId: TrainingModeId
) {
  const base = difficultySettings[difficulty]
  const mode = trainingModes[modeId]
  const scaledCount = Math.max(1, Math.round(base.targetCount * mode.targetCountMultiplier))
  const targetCount = mode.maxActiveTargets
    ? Math.min(mode.maxActiveTargets, scaledCount)
    : scaledCount

  return {
    targetCount,
    targetSpeed: mode.baseSpeed * difficultySpeedScale[difficulty],
    gameAreaSize: base.gameAreaSize,
    movement: mode.movement,
    respawnDelayMs: mode.respawnDelayMs,
    scorePerHit: mode.scorePerHit,
    jitterChance: mode.jitterChance,
    durationSeconds: mode.durationSeconds,
    faceCamera: mode.faceCamera,
    orbitRadius: mode.orbitRadius ?? 0,
    orbitSpeed: mode.orbitSpeed ?? 0,
    maxActiveTargets: mode.maxActiveTargets,
    spawnPattern: mode.spawnPattern ?? 'random',
  }
}
