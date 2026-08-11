import type { GameConfig } from './types'

/** 使用 6 副牌，接近赌场常见设置 */
export const DECK_COUNT = 6

/** 剩余牌不足此比例时重新洗牌 */
export const RESHUFFLE_RATIO = 0.25

/** 黑杰克赔率 3:2 */
export const BLACKJACK_PAYOUT = 1.5

export const MIN_BET = 5
export const MAX_BET = 500
/** 可选筹码面额（小到大，用于下注选择） */
export const BET_PRESETS = [5, 10, 20, 50, 100, 200] as const

export const MIN_SEATS = 1
export const MAX_SEATS = 4

export const DEFAULT_STARTING_CHIPS = 1000
export const DEFAULT_BANK_CHIPS = 5000

export const DEFAULT_CONFIG: GameConfig = {
  role: 'player',
  seatCount: 3,
  startingChips: DEFAULT_STARTING_CHIPS,
  bankChips: DEFAULT_BANK_CHIPS,
}

export const BOT_NAMES = ['阿强', '小美', '老王', '阿杰', '小李', '大锤'] as const

/** 机器人思考延迟（毫秒） */
export const BOT_THINK_MS = 700
export const DEAL_CARD_MS = 280
export const DEALER_HIT_MS = 650

export const SUIT_SYMBOL: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
}

export const SUIT_COLOR: Record<string, 'red' | 'black'> = {
  hearts: 'red',
  diamonds: 'red',
  clubs: 'black',
  spades: 'black',
}

export const GAME_RULES = [
  '目标：手牌点数尽量接近 21 且不超过，并击败庄家。',
  '牌面：2–10 按点数；J/Q/K 各 10 点；A 可算 1 或 11 点。',
  '发牌：每位闲家两张明牌；庄家一张明牌、一张暗牌。',
  '黑杰克：首两张为 A + 10 点牌，赔率 3:2（1.5 倍赌注）。双方皆黑杰克则平局。',
  '闲家可选择：要牌（Hit）、停牌（Stand）、加倍（Double，仅首两张，再拿一张后停牌）。',
  '点数超过 21 为爆牌，立即输掉本局赌注。',
  '闲家全部行动后，庄家翻开暗牌；点数未达 17 必须要牌，软/硬 17 均停牌。',
  '庄家爆牌则未爆闲家皆赢；否则比点数，高者赢，相同平局退回赌注。',
  '可选择坐庄或做闲家；空座位由机器人自动下注与出牌。',
  '下注使用筹码：面额 5 / 10 / 20 / 50 / 100 / 200，点击累加后确认。',
] as const
