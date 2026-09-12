import { describe, expect, it } from 'vitest'
import type { Seat } from '../../types'
import { layoutSeatsAroundHuman } from '../seats'

function seat(id: string, isHuman = false): Seat {
  return {
    id,
    name: id,
    isHuman,
    chips: 100,
    hands: [],
    activeHandIndex: 0,
  }
}

describe('layoutSeatsAroundHuman', () => {
  it('无真人时全部放左侧以便整排居中', () => {
    const seats = [seat('a'), seat('b'), seat('c')]
    const layout = layoutSeatsAroundHuman(seats)
    expect(layout.human).toBeNull()
    expect(layout.left.map(s => s.seat.id)).toEqual(['a', 'b', 'c'])
    expect(layout.right).toEqual([])
  })

  it('1 人时真人单独居中', () => {
    const layout = layoutSeatsAroundHuman([seat('you', true)])
    expect(layout.human?.seat.id).toBe('you')
    expect(layout.left).toEqual([])
    expect(layout.right).toEqual([])
  })

  it('3 席时左右各 1 个机器人，真人正中', () => {
    const layout = layoutSeatsAroundHuman([
      seat('you', true),
      seat('bot1'),
      seat('bot2'),
    ])
    expect(layout.left.map(s => s.seat.id)).toEqual(['bot1'])
    expect(layout.human?.seat.id).toBe('you')
    expect(layout.human?.index).toBe(0)
    expect(layout.right.map(s => s.seat.id)).toEqual(['bot2'])
  })

  it('4 席时左侧 1、右侧 2，真人仍在正中列', () => {
    const layout = layoutSeatsAroundHuman([
      seat('you', true),
      seat('bot1'),
      seat('bot2'),
      seat('bot3'),
    ])
    expect(layout.left.map(s => s.seat.id)).toEqual(['bot1'])
    expect(layout.human?.seat.id).toBe('you')
    expect(layout.right.map(s => s.seat.id)).toEqual(['bot2', 'bot3'])
  })

  it('保留原始下标，方便对照 activeSeatIndex', () => {
    const layout = layoutSeatsAroundHuman([
      seat('you', true),
      seat('bot1'),
      seat('bot2'),
    ])
    expect(layout.left[0]?.index).toBe(1)
    expect(layout.right[0]?.index).toBe(2)
  })
})
