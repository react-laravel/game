import { describe, expect, it } from 'vitest'
import { canRevealCell, cycleCellMark, remainingMinesDelta } from '../board'

describe('cycleCellMark', () => {
  it('cycles unmarked → flag → question → unmarked', () => {
    expect(cycleCellMark('hidden')).toBe('flagged')
    expect(cycleCellMark('flagged')).toBe('questioned')
    expect(cycleCellMark('questioned')).toBe('hidden')
  })

  it('does not change revealed cells', () => {
    expect(cycleCellMark('revealed')).toBe('revealed')
  })
})

describe('remainingMinesDelta', () => {
  it('decreases remaining mines only when placing a flag', () => {
    expect(remainingMinesDelta('hidden', 'flagged')).toBe(-1)
  })

  it('restores remaining mines when a flag becomes a question mark', () => {
    expect(remainingMinesDelta('flagged', 'questioned')).toBe(1)
  })

  it('does not change remaining mines when clearing a question mark', () => {
    expect(remainingMinesDelta('questioned', 'hidden')).toBe(0)
  })
})

describe('canRevealCell', () => {
  it('allows revealing unmarked and questioned cells, but not flags', () => {
    expect(canRevealCell('hidden')).toBe(true)
    expect(canRevealCell('questioned')).toBe(true)
    expect(canRevealCell('flagged')).toBe(false)
    expect(canRevealCell('revealed')).toBe(false)
  })
})
