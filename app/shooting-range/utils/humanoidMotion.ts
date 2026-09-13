import type { TrainingModeId } from '../types'

export type BotMotionPhase =
  | 'strafe'
  | 'advance'
  | 'retreat'
  | 'jump'
  | 'crouch'
  | 'hover'

export interface BotMotionProfile {
  phases: BotMotionPhase[]
  strafeSpeed: number
  advanceSpeed: number
  jumpHeight: number
  crouchDepth: number
  hoverAmplitude: number
  phaseMinSec: number
  phaseMaxSec: number
}

export interface BotMotionState {
  phase: BotMotionPhase
  phaseElapsed: number
  phaseDuration: number
  strafeDir: 1 | -1
  seed: number
}

export interface BotMotionSample {
  offsetX: number
  offsetY: number
  offsetZ: number
  crouchScale: number
  /** 0–1 progress within the current phase — drives limb pose. */
  phaseT: number
  phase: BotMotionPhase
  /** Lateral lean for strafe readability (-1..1). */
  leanX: number
  /** Forward/back lean for advance/retreat (-1..1). */
  leanZ: number
  /** Leg spread for crouch/jump (0 = standing, 1 = wide). */
  legSpread: number
  /** Arm swing offset for gait (-1..1). */
  armSwing: number
}

const profiles: Record<TrainingModeId, BotMotionProfile> = {
  static: {
    phases: ['strafe', 'crouch'],
    strafeSpeed: 0.72,
    advanceSpeed: 0.2,
    jumpHeight: 0.18,
    crouchDepth: 0.28,
    hoverAmplitude: 0.05,
    phaseMinSec: 1.5,
    phaseMaxSec: 2.6,
  },
  moving: {
    phases: ['strafe', 'advance', 'retreat', 'jump'],
    strafeSpeed: 1.35,
    advanceSpeed: 0.95,
    jumpHeight: 0.68,
    crouchDepth: 0.32,
    hoverAmplitude: 0.08,
    phaseMinSec: 0.9,
    phaseMaxSec: 1.5,
  },
  flick: {
    phases: ['strafe', 'crouch'],
    strafeSpeed: 0.82,
    advanceSpeed: 0.25,
    jumpHeight: 0.22,
    crouchDepth: 0.26,
    hoverAmplitude: 0.04,
    phaseMinSec: 1.2,
    phaseMaxSec: 2.0,
  },
  tracking: {
    phases: ['strafe', 'hover', 'advance'],
    strafeSpeed: 1.1,
    advanceSpeed: 0.52,
    jumpHeight: 0.28,
    crouchDepth: 0.22,
    hoverAmplitude: 0.42,
    phaseMinSec: 1.1,
    phaseMaxSec: 1.9,
  },
  timed: {
    phases: ['strafe', 'advance', 'jump', 'retreat'],
    strafeSpeed: 1.55,
    advanceSpeed: 1.15,
    jumpHeight: 0.75,
    crouchDepth: 0.34,
    hoverAmplitude: 0.1,
    phaseMinSec: 0.7,
    phaseMaxSec: 1.2,
  },
  precision: {
    phases: ['strafe', 'crouch'],
    strafeSpeed: 0.62,
    advanceSpeed: 0.18,
    jumpHeight: 0.14,
    crouchDepth: 0.24,
    hoverAmplitude: 0.04,
    phaseMinSec: 1.4,
    phaseMaxSec: 2.4,
  },
}

function pseudoRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

/** Smooth 0→1→0 with a brief hold at the peak for screenshot-friendly poses. */
function pulseEase(t: number): number {
  if (t < 0.12) return t / 0.12
  if (t > 0.88) return (1 - t) / 0.12
  return 1
}

/** Strafe uses a triangle wave so the bot visibly pauses at each side. */
function strafeEase(t: number): number {
  if (t < 0.5) return t * 2
  return 2 - t * 2
}

export function getBotMotionProfile(modeId: TrainingModeId): BotMotionProfile {
  return profiles[modeId]
}

export function createBotMotionState(id: number): BotMotionState {
  const seed = id * 1.37 + 0.5
  const profile = profiles.static
  const duration =
    profile.phaseMinSec +
    pseudoRandom(seed) * (profile.phaseMaxSec - profile.phaseMinSec)
  return {
    phase: 'strafe',
    phaseElapsed: 0,
    phaseDuration: duration,
    strafeDir: pseudoRandom(seed + 1) > 0.5 ? 1 : -1,
    seed,
  }
}

function pickNextPhase(profile: BotMotionProfile, state: BotMotionState): BotMotionPhase {
  const index = Math.floor(pseudoRandom(state.seed + state.phaseElapsed * 17) * profile.phases.length)
  const next = profile.phases[index]
  if (next === state.phase && profile.phases.length > 1) {
    return profile.phases[(index + 1) % profile.phases.length]
  }
  return next
}

export function stepBotMotion(
  state: BotMotionState,
  delta: number,
  profile: BotMotionProfile,
  timeSec: number
): BotMotionSample {
  state.phaseElapsed += delta
  if (state.phaseElapsed >= state.phaseDuration) {
    state.phase = pickNextPhase(profile, state)
    state.phaseElapsed = 0
    state.phaseDuration =
      profile.phaseMinSec +
      pseudoRandom(state.seed + timeSec) * (profile.phaseMaxSec - profile.phaseMinSec)
    if (state.phase === 'strafe') {
      state.strafeDir = state.strafeDir === 1 ? -1 : 1
    }
  }

  const t = state.phaseElapsed / Math.max(0.001, state.phaseDuration)
  const wave = Math.sin(t * Math.PI)
  const pulse = pulseEase(t)
  const strafeWave = strafeEase(t)
  let offsetX = 0
  let offsetY = 0
  let offsetZ = 0
  let crouchScale = 1
  let leanX = 0
  let leanZ = 0
  let legSpread = 0
  let armSwing = 0

  switch (state.phase) {
    case 'strafe':
      offsetX = state.strafeDir * profile.strafeSpeed * strafeWave
      leanX = state.strafeDir * strafeWave * 0.35
      armSwing = Math.sin(t * Math.PI * 2) * 0.55
      break
    case 'advance':
      offsetZ = -profile.advanceSpeed * pulse
      leanZ = -pulse * 0.4
      armSwing = pulse * 0.45
      break
    case 'retreat':
      offsetZ = profile.advanceSpeed * pulse * 0.85
      leanZ = pulse * 0.32
      armSwing = -pulse * 0.35
      break
    case 'jump': {
      const jumpArc = Math.sin(t * Math.PI)
      const squat = t < 0.18 ? (0.18 - t) / 0.18 : 0
      offsetY = profile.jumpHeight * jumpArc
      crouchScale = 1 - squat * 0.12
      legSpread = squat * 0.35 + jumpArc * 0.15
      armSwing = jumpArc > 0.4 ? -0.5 : 0.35
      break
    }
    case 'crouch':
      crouchScale = 1 - profile.crouchDepth * pulse
      offsetY = -profile.crouchDepth * 0.42 * pulse
      legSpread = pulse * 0.55
      leanZ = pulse * 0.12
      break
    case 'hover':
      offsetY =
        profile.hoverAmplitude * Math.sin(timeSec * 2.4 + state.seed) +
        profile.hoverAmplitude * 0.35
      offsetX = Math.sin(timeSec * 1.6 + state.seed) * profile.strafeSpeed * 0.35
      armSwing = Math.sin(timeSec * 3.2 + state.seed) * 0.25
      break
    default:
      break
  }

  return {
    offsetX,
    offsetY,
    offsetZ,
    crouchScale,
    phaseT: t,
    phase: state.phase,
    leanX,
    leanZ,
    legSpread,
    armSwing,
  }
}
