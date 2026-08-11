export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

export interface Card {
  suit: Suit
  rank: Rank
  id: string
}

export type HandStatus =
  | 'waiting'
  | 'betting'
  | 'playing'
  | 'stand'
  | 'bust'
  | 'blackjack'
  | 'doubled'
  | 'settled'
  | 'broke'

export type RoundResult = 'win' | 'lose' | 'push' | 'blackjack' | null

export type Role = 'player' | 'dealer'

export type Phase =
  | 'setup'
  | 'betting'
  | 'dealing'
  | 'player_turns'
  | 'dealer_turn'
  | 'settlement'
  | 'round_end'

export interface Seat {
  id: string
  name: string
  isHuman: boolean
  chips: number
  bet: number
  cards: Card[]
  status: HandStatus
  result: RoundResult
  /** 本局筹码变化（正为赢，负为输） */
  resultAmount: number
}

export interface Dealer {
  cards: Card[]
  /** 暗牌是否已翻开 */
  holeRevealed: boolean
  status: HandStatus
}

export interface GameConfig {
  role: Role
  /** 闲家座位数量（含真人，若角色为闲家） */
  seatCount: number
  startingChips: number
  /** 坐庄时庄家初始筹码 */
  bankChips: number
}

export interface HandValue {
  /** 最优点数（尽量接近 21 且不爆） */
  total: number
  /** 是否含按 11 计的 A */
  soft: boolean
  isBlackjack: boolean
  isBust: boolean
}
