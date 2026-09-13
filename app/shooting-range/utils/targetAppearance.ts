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
  /** Static aim mode shows thin center cross guides */
  showAimCross: boolean
  /** Timed speed mode shows outer urgency ring */
  showSpeedRing: boolean
}

/** Muted painted-ring colors — matte cardboard / spray-painted paper under sun, not neon. */
const appearances: Record<TrainingModeId, TargetAppearance> = {
  flick: {
    ringColor: '#946848',
    spawnPop: 1.55,
    pulseAmplitude: 0,
    pulseSpeed: 0,
    spawnFlashColor: '#b89878',
    showSpawnBrackets: true,
    showOrbitHint: false,
    showAimCross: false,
    showSpeedRing: false,
  },
  tracking: {
    ringColor: '#4a6e58',
    spawnPop: 1.2,
    pulseAmplitude: 0.04,
    pulseSpeed: 3.2,
    spawnFlashColor: '#6a8878',
    showSpawnBrackets: false,
    showOrbitHint: true,
    showAimCross: false,
    showSpeedRing: false,
  },
  moving: {
    ringColor: '#5a5858',
    spawnPop: 1.15,
    pulseAmplitude: 0.035,
    pulseSpeed: 5.5,
    spawnFlashColor: '#8a8488',
    showSpawnBrackets: false,
    showOrbitHint: false,
    showAimCross: false,
    showSpeedRing: false,
  },
  precision: {
    ringColor: '#5a6878',
    spawnPop: 1.5,
    pulseAmplitude: 0,
    pulseSpeed: 0,
    spawnFlashColor: '#788898',
    showSpawnBrackets: true,
    showOrbitHint: false,
    showAimCross: false,
    showSpeedRing: false,
  },
  timed: {
    ringColor: '#8a5858',
    spawnPop: 1.15,
    pulseAmplitude: 0.05,
    pulseSpeed: 8.5,
    spawnFlashColor: '#a87878',
    showSpawnBrackets: false,
    showOrbitHint: false,
    showAimCross: false,
    showSpeedRing: true,
  },
  static: {
    ringColor: '#5a6878',
    spawnPop: 1.2,
    pulseAmplitude: 0,
    pulseSpeed: 0,
    spawnFlashColor: '#788898',
    showSpawnBrackets: false,
    showOrbitHint: false,
    showAimCross: true,
    showSpeedRing: false,
  },
}

export function getTargetAppearance(modeId: TrainingModeId): TargetAppearance {
  return appearances[modeId]
}
