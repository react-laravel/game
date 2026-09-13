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
}

const profiles: Record<TrainingModeId, BotMotionProfile> = {
  static: {
    phases: ['strafe', 'crouch'],
    strafeSpeed: 0.55,
    advanceSpeed: 0.2,
    jumpHeight: 0.15,
    crouchDepth: 0.22,
    hoverAmplitude: 0.05,
    phaseMinSec: 1.4,
    phaseMaxSec: 2.8,
  },
  moving: {
    phases: ['strafe', 'advance', 'retreat', 'jump'],
    strafeSpeed: 1.15,
    advanceSpeed: 0.85,
    jumpHeight: 0.55,
    crouchDepth: 0.28,
    hoverAmplitude: 0.08,
    phaseMinSec: 0.85,
    phaseMaxSec: 1.6,
  },
  flick: {
    phases: ['strafe', 'crouch'],
    strafeSpeed: 0.65,
    advanceSpeed: 0.25,
    jumpHeight: 0.2,
    crouchDepth: 0.2,
    hoverAmplitude: 0.04,
    phaseMinSec: 1.1,
    phaseMaxSec: 2.2,
  },
  tracking: {
    phases: ['strafe', 'hover', 'advance'],
    strafeSpeed: 0.95,
    advanceSpeed: 0.45,
    jumpHeight: 0.25,
    crouchDepth: 0.18,
    hoverAmplitude: 0.42,
    phaseMinSec: 1.0,
    phaseMaxSec: 2.0,
  },
  timed: {
    phases: ['strafe', 'advance', 'jump', 'retreat'],
    strafeSpeed: 1.35,
    advanceSpeed: 1.05,
    jumpHeight: 0.62,
    crouchDepth: 0.3,
    hoverAmplitude: 0.1,
    phaseMinSec: 0.65,
    phaseMaxSec: 1.25,
  },
  precision: {
    phases: ['strafe', 'crouch'],
    strafeSpeed: 0.5,
    advanceSpeed: 0.18,
    jumpHeight: 0.12,
    crouchDepth: 0.2,
    hoverAmplitude: 0.04,
    phaseMinSec: 1.3,
    phaseMaxSec: 2.5,
  },
}

function pseudoRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
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
  let offsetX = 0
  let offsetY = 0
  let offsetZ = 0
  let crouchScale = 1

  switch (state.phase) {
    case 'strafe':
      offsetX = state.strafeDir * profile.strafeSpeed * wave
      break
    case 'advance':
      offsetZ = -profile.advanceSpeed * wave
      break
    case 'retreat':
      offsetZ = profile.advanceSpeed * wave * 0.85
      break
    case 'jump':
      offsetY = profile.jumpHeight * Math.sin(t * Math.PI)
      break
    case 'crouch':
      crouchScale = 1 - profile.crouchDepth * wave
      offsetY = -profile.crouchDepth * 0.35 * wave
      break
    case 'hover':
      offsetY =
        profile.hoverAmplitude * Math.sin(timeSec * 2.4 + state.seed) +
        profile.hoverAmplitude * 0.35
      offsetX = Math.sin(timeSec * 1.6 + state.seed) * profile.strafeSpeed * 0.35
      break
    default:
      break
  }

  return { offsetX, offsetY, offsetZ, crouchScale }
}
