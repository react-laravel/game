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

/** Muted painted-ring colors — matte cardboard / spray-painted metal, not neon. */
const appearances: Record<TrainingModeId, TargetAppearance> = {
  flick: {
    ringColor: '#b86838',
    spawnPop: 1.55,
    pulseAmplitude: 0,
    pulseSpeed: 0,
    spawnFlashColor: '#d8a878',
    showSpawnBrackets: true,
    showOrbitHint: false,
    showAimCross: false,
    showSpeedRing: false,
  },
  tracking: {
    ringColor: '#3a8460',
    spawnPop: 1.2,
    pulseAmplitude: 0.04,
    pulseSpeed: 3.2,
    spawnFlashColor: '#6a9a78',
    showSpawnBrackets: false,
    showOrbitHint: true,
    showAimCross: false,
    showSpeedRing: false,
  },
  moving: {
    ringColor: '#886898',
    spawnPop: 1.15,
    pulseAmplitude: 0.035,
    pulseSpeed: 5.5,
    spawnFlashColor: '#a888b0',
    showSpawnBrackets: false,
    showOrbitHint: false,
    showAimCross: false,
    showSpeedRing: false,
  },
  precision: {
    ringColor: '#4a8098',
    spawnPop: 1.5,
    pulseAmplitude: 0,
    pulseSpeed: 0,
    spawnFlashColor: '#78a0b0',
    showSpawnBrackets: true,
    showOrbitHint: false,
    showAimCross: false,
    showSpeedRing: false,
  },
  timed: {
    ringColor: '#b05858',
    spawnPop: 1.15,
    pulseAmplitude: 0.05,
    pulseSpeed: 8.5,
    spawnFlashColor: '#c88888',
    showSpawnBrackets: false,
    showOrbitHint: false,
    showAimCross: false,
    showSpeedRing: true,
  },
  static: {
    ringColor: '#4a7a98',
    spawnPop: 1.2,
    pulseAmplitude: 0,
    pulseSpeed: 0,
    spawnFlashColor: '#78a0b8',
    showSpawnBrackets: false,
    showOrbitHint: false,
    showAimCross: true,
    showSpeedRing: false,
  },
}

export function getTargetAppearance(modeId: TrainingModeId): TargetAppearance {
  return appearances[modeId]
}
