import type { TrainingModeId } from '../types'
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
}

export const trainingModes: Record<TrainingModeId, TrainingModeConfig> = {
  static: {
    id: 'static',
    name: '固定靶',
    description: '全场多靶同时静止，不跟枪旋转，练稳瞄',
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
    name: '移动靶',
    description: '多靶高速反弹乱窜，需持续追踪预判',
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
    name: '快速反应',
    description: '仅 1 个靶，命中后 0.35 秒换点闪现',
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
    name: '追踪训练',
    description: '少量靶沿圆形轨迹匀速环绕，练跟枪',
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
    name: '限时挑战',
    description: '45 秒高密度移动靶，射速与精度并重',
    durationSeconds: 45,
    baseSpeed: 0.065,
    targetCountMultiplier: 1.15,
    movement: 'linear',
    respawnDelayMs: 500,
    scorePerHit: 10,
    jitterChance: 0.45,
    faceCamera: true,
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
  }
}
