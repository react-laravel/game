export const TOTAL_FRAMES = 10
export const PINS_PER_RACK = 10
export const RESULT_DISPLAY_MS = 1800

export type ThrowKind = 'strike' | 'spare' | 'gutter' | 'open'

export interface FrameScore {
  marks: string[]
  cumulative: number | null
}

export interface ThrowOutcome {
  frames: number[][]
  currentFrame: number
  currentThrow: number
  pinsStanding: number
  kind: ThrowKind
  gameFinished: boolean
  resetPins: boolean
  cumulative: Array<number | null>
  totalScore: number
}

export function emptyFrames(): number[][] {
  return Array.from({ length: TOTAL_FRAMES }, () => [])
}

export function clampPins(value: number, standing: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(standing, Math.round(value)))
}

export function isTenthFrame(frameIndex: number): boolean {
  return frameIndex === TOTAL_FRAMES - 1
}

export function isFrameComplete(frameIndex: number, throws: number[]): boolean {
  if (throws.length === 0) return false

  if (!isTenthFrame(frameIndex)) {
    return throws[0] === PINS_PER_RACK || throws.length >= 2
  }

  if (throws.length < 2) return false
  const first = throws[0]
  const second = throws[1] ?? 0
  if (first === PINS_PER_RACK || first + second === PINS_PER_RACK) {
    return throws.length >= 3
  }
  return true
}

export function isGameComplete(frames: number[][]): boolean {
  return isFrameComplete(TOTAL_FRAMES - 1, frames[TOTAL_FRAMES - 1] ?? [])
}

export function flattenThrows(frames: number[][]): number[] {
  return frames.flat()
}

export function lastCompletedTotal(cumulative: Array<number | null>): number {
  for (let index = cumulative.length - 1; index >= 0; index--) {
    const value = cumulative[index]
    if (value !== null) return value
  }
  return 0
}

export function scoreGame(frames: number[][]): { cumulative: Array<number | null>; total: number } {
  const rolls = flattenThrows(frames)
  const cumulative: Array<number | null> = Array.from({ length: TOTAL_FRAMES }, () => null)
  let total = 0
  let rollIndex = 0

  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    if (frame === TOTAL_FRAMES - 1) {
      const tenth = frames[frame] ?? []
      if (isFrameComplete(frame, tenth)) {
        total += tenth.reduce((sum, pins) => sum + pins, 0)
        cumulative[frame] = total
      }
      break
    }

    const first = rolls[rollIndex]
    if (first === undefined) break

    if (first === PINS_PER_RACK) {
      const bonus1 = rolls[rollIndex + 1]
      const bonus2 = rolls[rollIndex + 2]
      if (bonus1 === undefined || bonus2 === undefined) break
      total += PINS_PER_RACK + bonus1 + bonus2
      cumulative[frame] = total
      rollIndex += 1
      continue
    }

    const second = rolls[rollIndex + 1]
    if (second === undefined) break

    if (first + second === PINS_PER_RACK) {
      const bonus = rolls[rollIndex + 2]
      if (bonus === undefined) break
      total += PINS_PER_RACK + bonus
      cumulative[frame] = total
    } else {
      total += first + second
      cumulative[frame] = total
    }
    rollIndex += 2
  }

  return { cumulative, total: lastCompletedTotal(cumulative) }
}

export function markForPins(pins: number): string {
  if (pins === 0) return '-'
  return String(pins)
}

export function getFrameMarks(throws: number[], tenth: boolean): string[] {
  if (!tenth) {
    if (throws[0] === PINS_PER_RACK) return ['', 'X']
    if (throws.length === 1) return [markForPins(throws[0]), '']
    if (throws.length >= 2) {
      const spare = throws[0] + throws[1] === PINS_PER_RACK
      return [markForPins(throws[0]), spare ? '/' : markForPins(throws[1])]
    }
    return ['', '']
  }

  const marks = ['', '', '']
  if (throws.length === 0) return marks

  marks[0] = throws[0] === PINS_PER_RACK ? 'X' : markForPins(throws[0])

  if (throws.length >= 2) {
    if (throws[0] === PINS_PER_RACK) {
      marks[1] = throws[1] === PINS_PER_RACK ? 'X' : markForPins(throws[1])
    } else if (throws[0] + throws[1] === PINS_PER_RACK) {
      marks[1] = '/'
    } else {
      marks[1] = markForPins(throws[1])
    }
  }

  if (throws.length >= 3) {
    if (throws[2] === PINS_PER_RACK) {
      marks[2] = 'X'
    } else if (
      throws[0] === PINS_PER_RACK &&
      throws[1] !== PINS_PER_RACK &&
      throws[1] + throws[2] === PINS_PER_RACK
    ) {
      marks[2] = '/'
    } else {
      marks[2] = markForPins(throws[2])
    }
  }

  return marks
}

export function classifyThrow(frameThrows: number[], standingBefore: number): ThrowKind {
  const pins = frameThrows[frameThrows.length - 1] ?? 0
  if (pins === 0) return 'gutter'
  if (pins === PINS_PER_RACK && standingBefore === PINS_PER_RACK) return 'strike'
  const previous = frameThrows.slice(0, -1).reduce((sum, value) => sum + value, 0)
  if (previous > 0 && previous < PINS_PER_RACK && previous + pins === PINS_PER_RACK) return 'spare'
  return 'open'
}

export function applyThrow(args: {
  frames: number[][]
  currentFrame: number
  currentThrow: number
  pinsStanding: number
  knockedThisThrow: number
}): ThrowOutcome {
  const frameIndex = args.currentFrame - 1
  const knocked = clampPins(args.knockedThisThrow, args.pinsStanding)
  const frames = args.frames.map(frame => [...frame])
  if (!frames[frameIndex]) frames[frameIndex] = []
  frames[frameIndex].push(knocked)

  const kind = classifyThrow(frames[frameIndex], args.pinsStanding)
  const scores = scoreGame(frames)
  const tenth = isTenthFrame(frameIndex)
  const remaining = args.pinsStanding - knocked
  const complete = isFrameComplete(frameIndex, frames[frameIndex])
  const finished = isGameComplete(frames)

  if (finished) {
    return {
      frames,
      currentFrame: args.currentFrame,
      currentThrow: args.currentThrow,
      pinsStanding: remaining,
      kind,
      gameFinished: true,
      resetPins: false,
      cumulative: scores.cumulative,
      totalScore: scores.total,
    }
  }

  if (!complete) {
    const resetPins = tenth && remaining === 0
    return {
      frames,
      currentFrame: args.currentFrame,
      currentThrow: args.currentThrow + 1,
      pinsStanding: resetPins ? PINS_PER_RACK : remaining,
      kind,
      gameFinished: false,
      resetPins,
      cumulative: scores.cumulative,
      totalScore: scores.total,
    }
  }

  return {
    frames,
    currentFrame: args.currentFrame + 1,
    currentThrow: 1,
    pinsStanding: PINS_PER_RACK,
    kind,
    gameFinished: false,
    resetPins: true,
    cumulative: scores.cumulative,
    totalScore: scores.total,
  }
}

export function buildScorecard(frames: number[][]): FrameScore[] {
  const { cumulative } = scoreGame(frames)

  return frames.map((throws, index) => ({
    marks: getFrameMarks(throws, isTenthFrame(index)),
    cumulative: cumulative[index],
  }))
}
