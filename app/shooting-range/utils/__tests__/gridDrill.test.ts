import { describe, expect, it } from 'vitest'
import { createGridCycle, getGridPositions, type GridPosition } from '../gridDrill'

const positionKey = (position: GridPosition) => position.join(',')

describe('grid drill positions', () => {
  it('forms nine distinct cells in three aligned rows on one depth plane', () => {
    const positions = getGridPositions()

    expect(positions).toHaveLength(9)
    expect(new Set(positions.map(positionKey)).size).toBe(9)
    expect([...new Set(positions.map(([x]) => x))]).toEqual([-3.4, 0, 3.4])
    expect([...new Set(positions.map(([, y]) => y))]).toEqual([1.4, 3.5, 5.6])
    expect([...new Set(positions.map(([, , z]) => z))]).toEqual([-16])
  })

  it.each([2.4, 3.5, 4.2, 6.8])('preserves equally spaced rows below a %s-high roof', maxY => {
    const positions = getGridPositions(maxY)
    const rows = [...new Set(positions.map(([, y]) => y))]

    expect(rows).toHaveLength(3)
    expect(rows[0]).toBeCloseTo(1.4)
    expect(rows[1] - rows[0]).toBeCloseTo(rows[2] - rows[1])
    expect(rows[2]).toBeLessThanOrEqual(maxY)
    expect(new Set(positions.map(positionKey)).size).toBe(9)
    expect(positions.every(([, , z]) => z === -16)).toBe(true)
  })

  it('returns fresh tuples so consumers cannot change another session layout', () => {
    const positions = getGridPositions()
    positions[0][0] = 99

    expect(getGridPositions()[0]).toEqual([-3.4, 1.4, -16])
  })
})

describe('grid drill cycle', () => {
  it('reserves distinct cells immediately when three targets are created together', () => {
    const cycle = createGridCycle(9, () => 0)
    const active = [cycle.next(0), cycle.next(1), cycle.next(2)]

    expect(new Set(active.map(positionKey)).size).toBe(3)
  })

  it('rotates three targets through successive and alternating hits without overlap or same-cell respawns', () => {
    const samples = [0, 0.999, 0.42, 0.15, 0.78]
    let sampleIndex = 0
    const cycle = createGridCycle(6.8, () => samples[sampleIndex++ % samples.length])
    const active = [cycle.next(0), cycle.next(1), cycle.next(2)]
    const validCells = new Set(getGridPositions(6.8).map(positionKey))
    const hitOrder = [0, 1, 2, 2, 0, 1]

    for (let hit = 0; hit < 90; hit += 1) {
      const targetId = hitOrder[hit % hitOrder.length]
      const previousPosition = active[targetId]
      active[targetId] = cycle.next(targetId)

      expect(active[targetId]).not.toEqual(previousPosition)
      expect(new Set(active.map(positionKey)).size).toBe(3)
      expect(active.every(position => validCells.has(positionKey(position)))).toBe(true)
    }
  })

  it('reserves replacements synchronously for a burst of three respawns', () => {
    const cycle = createGridCycle(9, () => 0)
    const active = [cycle.next(0), cycle.next(1), cycle.next(2)]

    for (let burst = 0; burst < 20; burst += 1) {
      for (const targetId of [2, 0, 1]) {
        const previousPosition = active[targetId]
        active[targetId] = cycle.next(targetId)
        expect(active[targetId]).not.toEqual(previousPosition)
        expect(new Set(active.map(positionKey)).size).toBe(3)
      }
    }
  })

  it('keeps occupied slots isolated between sessions, including after a restart', () => {
    const firstSession = createGridCycle(9, () => 0)
    const firstPosition = firstSession.next(0)
    firstSession.next(1)
    firstSession.next(2)
    firstSession.next(0)

    const restartedSession = createGridCycle(9, () => 0)
    expect(restartedSession.next(0)).toEqual(firstPosition)
    expect(firstSession.next(1)).toEqual(firstPosition)
    expect(restartedSession.next(1)).toEqual(getGridPositions()[1])
  })

  it('restores initial occupied cells after a Strict Mode cleanup and re-registration', () => {
    const positions = getGridPositions()
    const active = [positions[0], positions[4], positions[8]]
    const cycle = createGridCycle(9, () => 0)

    active.forEach((position, targetId) => cycle.reserve(targetId, position))
    active.forEach((_, targetId) => cycle.release(targetId))
    active.forEach((position, targetId) => cycle.reserve(targetId, position))

    for (const targetId of [0, 1, 2]) {
      const previousPosition = active[targetId]
      active[targetId] = cycle.next(targetId)
      expect(active[targetId]).not.toEqual(previousPosition)
      expect(new Set(active.map(positionKey)).size).toBe(3)
    }
  })

  it('restores current positions after targets have already moved', () => {
    const cycle = createGridCycle(9, () => 0)
    const active = [cycle.next(0), cycle.next(1), cycle.next(2)]
    active[1] = cycle.next(1)
    active[2] = cycle.next(2)
    active.forEach((_, targetId) => cycle.release(targetId))
    active.forEach((position, targetId) => cycle.reserve(targetId, position))

    const previousPosition = active[0]
    active[0] = cycle.next(0)
    expect(active[0]).not.toEqual(previousPosition)
    expect(new Set(active.map(positionKey)).size).toBe(3)
  })

  it('makes released slots available and tolerates repeated cleanup', () => {
    const cycle = createGridCycle(9, () => 0)
    const first = cycle.next(0)
    cycle.next(1)
    cycle.release(0)
    cycle.release(0)

    expect(cycle.next(2)).toEqual(first)
  })

  it('rejects positions outside the grid instead of silently losing a reservation', () => {
    const cycle = createGridCycle()

    expect(() => cycle.reserve(0, [99, 99, 99])).toThrow('Target position is outside the grid')
  })

  it('returns independent position tuples without exposing the allocator layout', () => {
    const cycle = createGridCycle(9, () => 0)
    const position = cycle.next(0)
    position[0] = 99
    cycle.release(0)

    expect(cycle.next(1)).toEqual([-3.4, 1.4, -16])
  })
})
