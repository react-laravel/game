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
  /** Linear modes show a motion streak for velocity readability */
  showMotionStreak: boolean
  /** Static wall modes show a subtle anchor ring */
  showStaticAnchor: boolean
}

/** Muted painted-ring colors — warm matte cardboard / spray-painted paper under sun, not neon. */
const appearances: Record<TrainingModeId, TargetAppearance> = {
  flick: {
    ringColor: '#a07858',
    spawnPop: 1.55,
    pulseAmplitude: 0,
    pulseSpeed: 0,
    spawnFlashColor: '#c8a888',
    showSpawnBrackets: true,
    showOrbitHint: false,
    showAimCross: false,
    showSpeedRing: false,
    showMotionStreak: false,
    showStaticAnchor: false,
  },
  tracking: {
    ringColor: '#5a7860',
    spawnPop: 1.2,
    pulseAmplitude: 0.04,
    pulseSpeed: 3.2,
    spawnFlashColor: '#7a9888',
    showSpawnBrackets: false,
    showOrbitHint: true,
    showAimCross: false,
    showSpeedRing: false,
    showMotionStreak: false,
    showStaticAnchor: false,
  },
  moving: {
    ringColor: '#6a6460',
    spawnPop: 1.15,
    pulseAmplitude: 0.048,
    pulseSpeed: 6.8,
    spawnFlashColor: '#9a9490',
    showSpawnBrackets: false,
    showOrbitHint: false,
    showAimCross: false,
    showSpeedRing: false,
    showMotionStreak: true,
    showStaticAnchor: false,
  },
  precision: {
    ringColor: '#6a7880',
    spawnPop: 1.5,
    pulseAmplitude: 0,
    pulseSpeed: 0,
    spawnFlashColor: '#8898a0',
    showSpawnBrackets: true,
    showOrbitHint: false,
    showAimCross: false,
    showSpeedRing: false,
    showMotionStreak: false,
    showStaticAnchor: false,
  },
  timed: {
    ringColor: '#9a6860',
    spawnPop: 1.15,
    pulseAmplitude: 0.05,
    pulseSpeed: 8.5,
    spawnFlashColor: '#b88880',
    showSpawnBrackets: false,
    showOrbitHint: false,
    showAimCross: false,
    showSpeedRing: true,
    showMotionStreak: true,
    showStaticAnchor: false,
  },
  static: {
    ringColor: '#6a7880',
    spawnPop: 1.2,
    pulseAmplitude: 0,
    pulseSpeed: 0,
    spawnFlashColor: '#8898a0',
    showSpawnBrackets: false,
    showOrbitHint: false,
    showAimCross: true,
    showSpeedRing: false,
    showMotionStreak: false,
    showStaticAnchor: true,
  },
}

export function getTargetAppearance(modeId: TrainingModeId): TargetAppearance {
  return appearances[modeId]
}
