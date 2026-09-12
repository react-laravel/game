import type { TrainingModeId } from '../types'
import { difficultySettings } from './gameUtils'

export type TargetMovement = 'static' | 'linear' | 'tracking'

export interface TrainingModeConfig {
  id: TrainingModeId
  name: string
  description: string
  durationSeconds: number
  targetSpeedMultiplier: number
  targetCountMultiplier: number
  movement: TargetMovement
  respawnDelayMs: number
  scorePerHit: number
  jitterChance: number
}

export const trainingModes: Record<TrainingModeId, TrainingModeConfig> = {
  static: {
    id: 'static',
    name: '固定靶',
    description: '目标静止不动，专注瞄准与扳机控制',
    durationSeconds: 60,
    targetSpeedMultiplier: 0,
    targetCountMultiplier: 1,
    movement: 'static',
    respawnDelayMs: 900,
    scorePerHit: 10,
    jitterChance: 0,
  },
  moving: {
    id: 'moving',
    name: '移动靶',
    description: '经典移动无人靶，考验追踪与预判',
    durationSeconds: 60,
    targetSpeedMultiplier: 1,
    targetCountMultiplier: 1,
    movement: 'linear',
    respawnDelayMs: 900,
    scorePerHit: 10,
    jitterChance: 0.3,
  },
  flick: {
    id: 'flick',
    name: '快速反应',
    description: '少量目标快速刷新，训练甩枪与瞬间锁定',
    durationSeconds: 60,
    targetSpeedMultiplier: 0.35,
    targetCountMultiplier: 0.45,
    movement: 'static',
    respawnDelayMs: 550,
    scorePerHit: 15,
    jitterChance: 0,
  },
  tracking: {
    id: 'tracking',
    name: '追踪训练',
    description: '目标沿平滑弧线移动，强化持续跟枪',
    durationSeconds: 60,
    targetSpeedMultiplier: 0.75,
    targetCountMultiplier: 0.85,
    movement: 'tracking',
    respawnDelayMs: 900,
    scorePerHit: 12,
    jitterChance: 0.08,
  },
  timed: {
    id: 'timed',
    name: '限时挑战',
    description: '45 秒高压节奏，速度与精度并重',
    durationSeconds: 45,
    targetSpeedMultiplier: 1.35,
    targetCountMultiplier: 1.1,
    movement: 'linear',
    respawnDelayMs: 700,
    scorePerHit: 10,
    jitterChance: 0.35,
  },
}

export const trainingModeOptions = Object.values(trainingModes)

export function resolveTrainingSettings(
  difficulty: keyof typeof difficultySettings,
  modeId: TrainingModeId
) {
  const base = difficultySettings[difficulty]
  const mode = trainingModes[modeId]

  return {
    targetCount: Math.max(3, Math.round(base.targetCount * mode.targetCountMultiplier)),
    targetSpeed: base.targetSpeed * mode.targetSpeedMultiplier,
    gameAreaSize: base.gameAreaSize,
    movement: mode.movement,
    respawnDelayMs: mode.respawnDelayMs,
    scorePerHit: mode.scorePerHit,
    jitterChance: mode.jitterChance,
    durationSeconds: mode.durationSeconds,
  }
}
