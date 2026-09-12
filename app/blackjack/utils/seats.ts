import type { Seat } from '../types'

export interface IndexedSeat {
  seat: Seat
  /** 在 store.seats 中的原始下标，用于判断当前行动座位 */
  index: number
}

export interface TableSeatLayout {
  left: IndexedSeat[]
  human: IndexedSeat | null
  right: IndexedSeat[]
}

/**
 * 把真人放到牌桌正中：左右分列机器人。
 * 坐庄（无真人座位）时 human 为 null，全部座位放在 left 以便整排居中。
 */
export function layoutSeatsAroundHuman(seats: Seat[]): TableSeatLayout {
  const indexed: IndexedSeat[] = seats.map((seat, index) => ({ seat, index }))
  const humanIdx = indexed.findIndex(s => s.seat.isHuman)

  if (humanIdx < 0) {
    return { left: indexed, human: null, right: [] }
  }

  const others = indexed.filter((_, i) => i !== humanIdx)
  const leftCount = Math.floor(others.length / 2)

  return {
    left: others.slice(0, leftCount),
    human: indexed[humanIdx],
    right: others.slice(leftCount),
  }
}
