import type { TrainingModeId } from '../types'

export interface TargetAppearance {
  ringColor: string
  spawnPop: number
  pulseAmplitude: number
  pulseSpeed: number
  /** Brief spawn flash ring color */
  spawnFlashColor: string
  /** Single-target modes get corner bracket guides */
  showSpawnBrackets: boolean
  /** Tracking mode shows orbit path hint */
  showOrbitHint: boolean
}

const appearances: Record<TrainingModeId, TargetAppearance> = {
  flick: {
    ringColor: '#ff8a42',
    spawnPop: 1.55,
    pulseAmplitude: 0,
    pulseSpeed: 0,
    spawnFlashColor: '#ffc080',
    showSpawnBrackets: true,
    showOrbitHint: false,
  },
  tracking: {
    ringColor: '#4de8a0',
    spawnPop: 1.2,
    pulseAmplitude: 0.04,
    pulseSpeed: 3.2,
    spawnFlashColor: '#80f0c0',
    showSpawnBrackets: false,
    showOrbitHint: true,
  },
  moving: {
    ringColor: '#d96cff',
    spawnPop: 1.15,
    pulseAmplitude: 0.035,
    pulseSpeed: 5.5,
    spawnFlashColor: '#e8a0ff',
    showSpawnBrackets: false,
    showOrbitHint: false,
  },
  precision: {
    ringColor: '#4dc8ff',
    spawnPop: 1.5,
    pulseAmplitude: 0,
    pulseSpeed: 0,
    spawnFlashColor: '#90e8ff',
    showSpawnBrackets: true,
    showOrbitHint: false,
  },
  timed: {
    ringColor: '#ff6b6b',
    spawnPop: 1.1,
    pulseAmplitude: 0.03,
    pulseSpeed: 6.5,
    spawnFlashColor: '#ffa0a0',
    showSpawnBrackets: false,
    showOrbitHint: false,
  },
  static: {
    ringColor: '#2ab0ff',
    spawnPop: 1.25,
    pulseAmplitude: 0,
    pulseSpeed: 0,
    spawnFlashColor: '#80d0ff',
    showSpawnBrackets: false,
    showOrbitHint: false,
  },
}

export function getTargetAppearance(modeId: TrainingModeId): TargetAppearance {
  return appearances[modeId]
}
