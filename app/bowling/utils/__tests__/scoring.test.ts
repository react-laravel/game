import { describe, expect, it } from 'vitest'
import {
  applyThrow,
  buildScorecard,
  emptyFrames,
  getFrameMarks,
  isFrameComplete,
  isGameComplete,
  scoreGame,
} from '../scoring'

describe('bowling scoring', () => {
  it('scores a gutter game as zero', () => {
    const frames = Array.from({ length: 10 }, () => [0, 0])
    expect(scoreGame(frames).total).toBe(0)
    expect(isGameComplete(frames)).toBe(true)
  })

  it('scores a perfect game as 300', () => {
    const frames = [...Array.from({ length: 9 }, () => [10]), [10, 10, 10]]
    expect(scoreGame(frames).total).toBe(300)
    expect(scoreGame(frames).cumulative[9]).toBe(300)
  })

  it('scores a spare using the next throw as bonus', () => {
    const frames = emptyFrames()
    frames[0] = [7, 3]
    frames[1] = [4]
    expect(scoreGame(frames).cumulative[0]).toBe(14)
    expect(scoreGame(frames).total).toBe(14)
  })

  it('hides strike totals until both bonus throws exist', () => {
    const frames = emptyFrames()
    frames[0] = [10]
    expect(scoreGame(frames).cumulative[0]).toBeNull()
    frames[1] = [3, 6]
    expect(scoreGame(frames).cumulative[0]).toBe(19)
    expect(scoreGame(frames).cumulative[1]).toBe(28)
  })

  it('marks strike spare and open frames', () => {
    expect(getFrameMarks([10], false)).toEqual(['', 'X'])
    expect(getFrameMarks([7, 3], false)).toEqual(['7', '/'])
    expect(getFrameMarks([8, 1], false)).toEqual(['8', '1'])
    expect(getFrameMarks([10, 10, 9], true)).toEqual(['X', 'X', '9'])
  })

  it('completes the tenth frame after bonus throws', () => {
    expect(isFrameComplete(9, [10, 10])).toBe(false)
    expect(isFrameComplete(9, [10, 10, 10])).toBe(true)
    expect(isFrameComplete(9, [7, 3])).toBe(false)
    expect(isFrameComplete(9, [7, 3, 4])).toBe(true)
    expect(isFrameComplete(9, [8, 1])).toBe(true)
  })

  it('advances frames and resets a bonus rack on the tenth', () => {
    let state = {
      frames: emptyFrames(),
      currentFrame: 10,
      currentThrow: 1,
      pinsStanding: 10,
    }

    const strike = applyThrow({ ...state, knockedThisThrow: 10 })
    expect(strike.kind).toBe('strike')
    expect(strike.resetPins).toBe(true)
    expect(strike.currentThrow).toBe(2)
    expect(strike.gameFinished).toBe(false)

    state = {
      frames: strike.frames,
      currentFrame: strike.currentFrame,
      currentThrow: strike.currentThrow,
      pinsStanding: strike.pinsStanding,
    }

    const bonus = applyThrow({ ...state, knockedThisThrow: 10 })
    expect(bonus.kind).toBe('strike')
    expect(bonus.resetPins).toBe(true)
    expect(bonus.gameFinished).toBe(false)
  })

  it('builds a scorecard with running totals', () => {
    const frames = emptyFrames()
    frames[0] = [4, 5]
    frames[1] = [10]
    const card = buildScorecard(frames)
    expect(card[0]).toEqual({ marks: ['4', '5'], cumulative: 9 })
    expect(card[1].marks).toEqual(['', 'X'])
    expect(card[1].cumulative).toBeNull()
  })
})
