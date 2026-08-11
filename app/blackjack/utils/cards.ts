import { DECK_COUNT } from '../constants'
import type { Card, Rank, Suit } from '../types'

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export function createShoe(deckCount = DECK_COUNT): Card[] {
  const shoe: Card[] = []
  let id = 0
  for (let d = 0; d < deckCount; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        shoe.push({ suit, rank, id: `${d}-${suit}-${rank}-${id++}` })
      }
    }
  }
  return shuffle(shoe)
}

/** Fisher–Yates 洗牌 */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function drawCard(shoe: Card[]): { card: Card; shoe: Card[] } {
  if (shoe.length === 0) {
    const fresh = createShoe()
    const [card, ...rest] = fresh
    return { card, shoe: rest }
  }
  const [card, ...rest] = shoe
  return { card, shoe: rest }
}

export function rankValue(rank: Rank): number {
  if (rank === 'A') return 11
  if (rank === 'J' || rank === 'Q' || rank === 'K') return 10
  return Number(rank)
}
