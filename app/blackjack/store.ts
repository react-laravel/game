'use client'

import { create } from 'zustand'
import {
  BOT_NAMES,
  BOT_THINK_MS,
  DEAL_CARD_MS,
  DEALER_HIT_MS,
  DEFAULT_CONFIG,
  MAX_BET,
  MIN_BET,
  RESHUFFLE_RATIO,
  DECK_COUNT,
} from './constants'
import type { Card, Dealer, GameConfig, Phase, Role, Seat } from './types'
import {
  decideAutoPlayAction,
  loadAutoPlayConfig,
  saveAutoPlayConfig,
  type AutoPlayConfig,
} from './utils/autoPlay'
import { createShoe, drawCard } from './utils/cards'
import { decideBotAction, decideBotBet } from './utils/bot'
import { dealerMustHit, evaluateHand } from './utils/hand'
import { settleAllSeats } from './utils/settle'
import { emitBlackjackSfx } from './utils/sfx'
import {
  canSplitHand,
  createHand,
  getActiveHand,
  isAcePair,
  resetHandSeq,
  seatNeedsPlay,
  seatTotalBet,
  shouldBotSplit,
} from './utils/split'
import {
  ACCOUNT_INITIAL_CHIPS,
  BOT_STARTING_CHIPS,
  clampAccountChips,
  loadAccountChips,
  saveAccountChips,
  type WalletOwnerId,
} from './utils/wallet'

const AUTO_NEXT_MS = 1400

interface BlackjackState {
  phase: Phase
  config: GameConfig
  shoe: Card[]
  seats: Seat[]
  dealer: Dealer
  bankChips: number
  activeSeatIndex: number
  message: string
  busy: boolean
  log: string[]
  humanBetDraft: number
  autoPlay: AutoPlayConfig
  /** 本会话统计（闲家真人，或坐庄时的庄家局数） */
  sessionStats: { wins: number; losses: number; pushes: number; blackjacks: number }
  /** 坐庄时本局庄家净盈亏（正赢负输），非结算阶段为 null */
  lastBankDelta: number | null
  /** 坐庄时本牌桌累计盈亏（相对开桌庄家资金） */
  bankSessionProfit: number
  /** 当前账号钱包余额（与持久化同步） */
  accountChips: number
  walletOwnerId: WalletOwnerId

  setRole: (role: Role) => void
  setSeatCount: (n: number) => void
  setHumanBetDraft: (n: number) => void
  setAutoPlay: (partial: Partial<AutoPlayConfig>) => void
  toggleAutoPlay: () => void
  /** 按登录用户加载/初始化钱包 */
  hydrateWallet: (ownerId: WalletOwnerId) => void
  startGame: () => void
  placeHumanBet: () => void
  hit: () => void
  stand: () => void
  doubleDown: () => void
  split: () => void
  nextRound: () => void
  backToSetup: () => void
  tickBots: () => void
  tickAutoPlay: () => void
  resetSessionStats: () => void
}

const emptyDealer = (): Dealer => ({
  cards: [],
  holeRevealed: false,
  status: 'waiting',
})

function makeSeats(config: GameConfig, accountChips: number): Seat[] {
  const seats: Seat[] = []
  const names = [...BOT_NAMES].sort(() => Math.random() - 0.5)
  let botIdx = 0

  for (let i = 0; i < config.seatCount; i++) {
    const isHuman = config.role === 'player' && i === 0
    seats.push({
      id: `seat-${i}`,
      name: isHuman ? '你' : names[botIdx++ % names.length],
      isHuman,
      // 真人用账号钱包；机器人用固定桌内筹码
      chips: isHuman ? accountChips : BOT_STARTING_CHIPS,
      hands: [],
      activeHandIndex: 0,
    })
  }
  return seats
}

function pushLog(log: string[], line: string, max = 40): string[] {
  return [line, ...log].slice(0, max)
}

function updateHand(
  seat: Seat,
  handIndex: number,
  patch: Partial<Seat['hands'][0]>
): Seat {
  return {
    ...seat,
    hands: seat.hands.map((h, i) => (i === handIndex ? { ...h, ...patch } : h)),
  }
}

let timerIds: number[] = []

function clearTimers() {
  timerIds.forEach(id => window.clearTimeout(id))
  timerIds = []
}

function later(fn: () => void, ms: number) {
  const id = window.setTimeout(fn, ms)
  timerIds.push(id)
}

export const useBlackjackStore = create<BlackjackState>((set, get) => {
  const getActiveHuman = () => {
    const { seats, activeSeatIndex } = get()
    const seat = seats[activeSeatIndex]
    return seat?.isHuman ? seat : null
  }

  const canAct = () => {
    const s = get()
    if (s.busy || s.phase !== 'player_turns') return false
    const seat = s.seats[s.activeSeatIndex]
    const hand = seat ? getActiveHand(seat) : undefined
    return !!seat?.isHuman && hand?.status === 'playing'
  }

  const dealToHand = (seatIndex: number, handIndex: number) => {
    const state = get()
    const { card, shoe } = drawCard(state.shoe)
    const seats = state.seats.map((s, i) => {
      if (i !== seatIndex) return s
      return updateHand(s, handIndex, { cards: [...s.hands[handIndex].cards, card] })
    })
    set({ shoe, seats })
    emitBlackjackSfx('deal')
    return card
  }

  const dealToDealer = () => {
    const state = get()
    const { card, shoe } = drawCard(state.shoe)
    set({
      shoe,
      dealer: { ...state.dealer, cards: [...state.dealer.cards, card] },
    })
    emitBlackjackSfx('deal')
    return card
  }

  const scheduleHumanTurn = () => {
    const { autoPlay } = get()
    if (autoPlay.enabled) {
      set({ busy: true, message: '托管决策中…' })
      later(() => get().tickAutoPlay(), BOT_THINK_MS)
    } else {
      emitBlackjackSfx('turn')
      set({ busy: false, message: '轮到你行动：要牌 / 停牌 / 加倍 / 分牌' })
    }
  }

  const scheduleAutoBetIfNeeded = () => {
    const st = get()
    if (
      st.autoPlay.enabled &&
      st.config.role === 'player' &&
      st.phase === 'betting' &&
      !st.busy
    ) {
      later(() => get().placeHumanBet(), BOT_THINK_MS)
    }
  }

  /** 当前手结束后：同座下一手 → 下一座位 → 庄家 */
  const afterHandDone = (seatIndex: number) => {
    const seat = get().seats[seatIndex]
    if (!seat) {
      startDealerTurn()
      return
    }

    // 同座还有未完成的手
    for (let h = seat.activeHandIndex + 1; h < seat.hands.length; h++) {
      if (seat.hands[h].status === 'playing') {
        // 分牌第二手可能还只有一张牌，需先补第二张
        const hand = seat.hands[h]
        set({
          seats: get().seats.map((s, i) =>
            i === seatIndex ? { ...s, activeHandIndex: h } : s
          ),
          busy: true,
          message: `${seat.name} 第 ${h + 1} 手…`,
        })

        const continueHand = () => {
          const cur = get().seats[seatIndex]
          const curHand = cur.hands[h]
          if (curHand.cards.length < 2) {
            dealToHand(seatIndex, h)
            const after = get().seats[seatIndex].hands[h]
            // 分 A：补一张后强制停
            if (after.isSplitAces) {
              set({
                seats: get().seats.map((s, i) =>
                  i === seatIndex ? updateHand(s, h, { status: 'stand' }) : s
                ),
                message: `${seat.name} 分 A 第 ${h + 1} 手停牌`,
              })
              later(() => afterHandDone(seatIndex), BOT_THINK_MS)
              return
            }
            const hv = evaluateHand(after.cards)
            if (hv.total === 21) {
              set({
                seats: get().seats.map((s, i) =>
                  i === seatIndex ? updateHand(s, h, { status: 'stand' }) : s
                ),
              })
              later(() => afterHandDone(seatIndex), BOT_THINK_MS)
              return
            }
          }

          if (cur.isHuman) {
            scheduleHumanTurn()
          } else {
            set({ busy: true, message: `${cur.name} 思考中…` })
            later(() => get().tickBots(), BOT_THINK_MS)
          }
        }

        later(continueHand, DEAL_CARD_MS)
        return
      }
    }

    // 下一座位
    const { seats } = get()
    for (let i = seatIndex + 1; i < seats.length; i++) {
      if (seatNeedsPlay(seats[i])) {
        const next = seats[i]
        const firstPlaying = next.hands.findIndex(h => h.status === 'playing')
        set({
          activeSeatIndex: i,
          seats: seats.map((s, si) =>
            si === i ? { ...s, activeHandIndex: Math.max(0, firstPlaying) } : s
          ),
        })
        if (next.isHuman) {
          scheduleHumanTurn()
        } else {
          set({ busy: true, message: `${next.name} 思考中…` })
          later(() => get().tickBots(), BOT_THINK_MS)
        }
        return
      }
    }
    startDealerTurn()
  }

  const startDealerTurn = () => {
    set({
      phase: 'dealer_turn',
      busy: true,
      message: '庄家翻开暗牌…',
      dealer: { ...get().dealer, holeRevealed: true },
    })
    emitBlackjackSfx('reveal')

    later(() => {
      const runDealer = () => {
        const { dealer } = get()
        if (!dealerMustHit(dealer.cards)) {
          const hv = evaluateHand(dealer.cards)
          set({
            message: hv.isBust
              ? `庄家爆牌（${hv.total}）`
              : `庄家停牌：${hv.total} 点`,
            dealer: {
              ...get().dealer,
              status: hv.isBust ? 'bust' : 'stand',
            },
          })
          if (hv.isBust) emitBlackjackSfx('bust')
          else emitBlackjackSfx('stand')
          later(() => doSettlement(), DEALER_HIT_MS)
          return
        }
        dealToDealer()
        const hv = evaluateHand(get().dealer.cards)
        set({
          message: hv.isBust
            ? `庄家要牌后爆牌（${hv.total}）`
            : `庄家要牌 → ${hv.total} 点`,
        })
        if (hv.isBust) emitBlackjackSfx('bust')
        later(runDealer, DEALER_HIT_MS)
      }
      runDealer()
    }, DEALER_HIT_MS)
  }

  const doSettlement = () => {
    const state = get()
    const results = settleAllSeats(state.seats, state.dealer.cards)
    let bankDelta = 0
    let log = state.log

    const seats = state.seats.map(seat => {
      const r = results.find(x => x.seatId === seat.id)!
      let chips = seat.chips + r.payout
      bankDelta -= r.net

      // 真人闲家：余额无上限，仅保底 ≥0
      if (seat.isHuman && state.config.role === 'player') {
        chips = clampAccountChips(chips)
      }

      const resultText =
        r.result === 'blackjack'
          ? '黑杰克'
          : r.result === 'win'
            ? '赢'
            : r.result === 'lose'
              ? '输'
              : r.result === 'push'
                ? '平'
                : ''

      log = pushLog(
        log,
        `${seat.name}：${resultText} ${r.net >= 0 ? '+' : ''}${r.net}（筹码 ${chips}）`
      )

      const hands = seat.hands.map(h => {
        const hr = r.hands.find(x => x.handId === h.id)
        if (!hr) return { ...h, bet: 0, status: 'settled' as const }
        return {
          ...h,
          bet: 0,
          status: 'settled' as const,
          result: hr.result,
          resultAmount: hr.net,
        }
      })

      return {
        ...seat,
        chips,
        hands,
        activeHandIndex: 0,
      }
    })

    let bankChips = state.bankChips + bankDelta
    // 坐庄时庄家筹码即账号钱包：无上限，仅 ≥0
    if (state.config.role === 'dealer') {
      bankChips = clampAccountChips(bankChips)
      bankDelta = bankChips - state.bankChips
    }

    const bankProfit = state.bankSessionProfit + bankDelta
    log = pushLog(
      log,
      state.config.role === 'dealer'
        ? `本局庄家 ${bankDelta > 0 ? '赢' : bankDelta < 0 ? '输' : '平'} ${bankDelta >= 0 ? '+' : ''}${bankDelta}，余额 ${bankChips}，累计 ${bankProfit >= 0 ? '+' : ''}${bankProfit}`
        : `本局结束`
    )

    // 持久化账号钱包
    let accountChips = state.accountChips
    if (state.config.role === 'dealer') {
      accountChips = saveAccountChips(state.walletOwnerId, bankChips)
    } else {
      const human = seats.find(s => s.isHuman)
      if (human) {
        accountChips = saveAccountChips(state.walletOwnerId, human.chips)
      }
    }

    const dealerMsg =
      state.config.role === 'dealer'
        ? bankDelta > 0
          ? `本局庄家赢 +${bankDelta}`
          : bankDelta < 0
            ? `本局庄家输 ${bankDelta}`
            : '本局庄家平局'
        : '本局结算完成'

    set({
      phase: 'round_end',
      seats,
      bankChips,
      busy: false,
      message: dealerMsg,
      log,
      lastBankDelta: state.config.role === 'dealer' ? bankDelta : null,
      bankSessionProfit:
        state.config.role === 'dealer' ? bankProfit : state.bankSessionProfit,
      accountChips,
    })

    const human = seats.find(s => s.isHuman)
    const humanResult = human ? results.find(r => r.seatId === human.id) : undefined
    const humanNet = humanResult?.net ?? 0
    if (humanResult?.result === 'blackjack') {
      emitBlackjackSfx('blackjack')
    } else if (humanNet > 0) emitBlackjackSfx('win')
    else if (humanNet < 0) emitBlackjackSfx('lose')
    else if (human) emitBlackjackSfx('push')
    else if (state.config.role === 'dealer') {
      if (bankDelta > 0) emitBlackjackSfx('win')
      else if (bankDelta < 0) emitBlackjackSfx('lose')
      else emitBlackjackSfx('push')
    }

    // 会话统计：闲家按真人结果；坐庄按庄家本局盈亏
    if (humanResult) {
      set(s => {
        const stats = { ...s.sessionStats }
        if (humanResult.result === 'blackjack') {
          stats.blackjacks += 1
          stats.wins += 1
        } else if (humanResult.result === 'win') stats.wins += 1
        else if (humanResult.result === 'lose') stats.losses += 1
        else if (humanResult.result === 'push') stats.pushes += 1
        return { sessionStats: stats }
      })
    } else if (state.config.role === 'dealer') {
      set(s => {
        const stats = { ...s.sessionStats }
        if (bankDelta > 0) stats.wins += 1
        else if (bankDelta < 0) stats.losses += 1
        else stats.pushes += 1
        return { sessionStats: stats }
      })
    }

    // 自动下一局：不依赖完整「托管出牌」，坐庄时也可单独开启
    if (state.autoPlay.autoNextRound) {
      later(() => {
        const cur = get()
        if (cur.phase === 'round_end' && cur.autoPlay.autoNextRound) {
          get().nextRound()
        }
      }, AUTO_NEXT_MS)
    }
  }

  const beginDealing = () => {
    set({ phase: 'dealing', busy: true, message: '发牌中…', lastBankDelta: null })

    set(s => ({
      seats: s.seats.map(seat => {
        const bet = seatTotalBet(seat)
        if (bet <= 0 && seat.hands.length === 0) {
          return { ...seat, hands: [], activeHandIndex: 0 }
        }
        // 下注阶段 hands 可能已有一手带 bet
        const baseBet = bet > 0 ? bet : 0
        if (baseBet <= 0) return { ...seat, hands: [], activeHandIndex: 0 }
        return {
          ...seat,
          hands: [
            createHand({
              bet: baseBet,
              cards: [],
              status: 'playing',
              result: null,
              resultAmount: 0,
            }),
          ],
          activeHandIndex: 0,
        }
      }),
      dealer: emptyDealer(),
    }))

    const state0 = get()
    const fullSize = DECK_COUNT * 52
    if (state0.shoe.length < fullSize * RESHUFFLE_RATIO) {
      set({
        shoe: createShoe(),
        message: '重新洗牌…',
        log: pushLog(state0.log, '牌靴剩余不足，重新洗牌'),
      })
      emitBlackjackSfx('shuffle')
    }

    const activeSeats = get()
      .seats.map((s, i) => ({ s, i }))
      .filter(({ s }) => seatTotalBet(s) > 0)

    type Step = { type: 'seat'; index: number } | { type: 'dealer' }
    const steps: Step[] = []
    for (let round = 0; round < 2; round++) {
      for (const { i } of activeSeats) {
        steps.push({ type: 'seat', index: i })
      }
      steps.push({ type: 'dealer' })
    }

    let step = 0
    const next = () => {
      if (step >= steps.length) {
        afterDeal()
        return
      }
      const s = steps[step++]
      if (s.type === 'seat') {
        dealToHand(s.index, 0)
      } else {
        dealToDealer()
      }
      later(next, DEAL_CARD_MS)
    }
    next()
  }

  const afterDeal = () => {
    const state = get()
    let log = state.log
    const seats = state.seats.map(seat => {
      if (seat.hands.length === 0 || seatTotalBet(seat) <= 0) return seat
      const hand = seat.hands[0]
      const hv = evaluateHand(hand.cards)
      if (hv.isBlackjack && !hand.fromSplit) {
        log = pushLog(log, `${seat.name} 黑杰克！`)
        return updateHand(seat, 0, { status: 'blackjack' })
      }
      return updateHand(seat, 0, { status: 'playing' })
    })

    if (seats.some(s => s.hands.some(h => h.status === 'blackjack'))) {
      emitBlackjackSfx('blackjack')
    }

    set({ seats, log, dealer: { ...state.dealer, status: 'playing' } })

    const needPlay = seats.some(seatNeedsPlay)
    if (!needPlay) {
      set({
        phase: 'dealer_turn',
        busy: true,
        message: '全部闲家黑杰克，庄家亮牌…',
        dealer: { ...get().dealer, holeRevealed: true },
      })
      emitBlackjackSfx('reveal')
      later(() => {
        const d = evaluateHand(get().dealer.cards)
        set({
          dealer: {
            ...get().dealer,
            status: d.isBlackjack ? 'blackjack' : d.isBust ? 'bust' : 'stand',
          },
          message: d.isBlackjack ? '庄家也是黑杰克' : '庄家亮牌',
        })
        later(() => doSettlement(), DEALER_HIT_MS)
      }, DEALER_HIT_MS)
      return
    }

    const first = seats.findIndex(seatNeedsPlay)
    const firstHand = seats[first].hands.findIndex(h => h.status === 'playing')
    set({
      phase: 'player_turns',
      activeSeatIndex: first,
      seats: seats.map((s, i) =>
        i === first ? { ...s, activeHandIndex: Math.max(0, firstHand) } : s
      ),
      busy: false,
    })

    const seat = get().seats[first]
    if (seat.isHuman) {
      scheduleHumanTurn()
    } else {
      set({ busy: true, message: `${seat.name} 思考中…` })
      later(() => get().tickBots(), BOT_THINK_MS)
    }
  }

  const applyHit = (seatIndex: number) => {
    const seat = get().seats[seatIndex]
    const handIndex = seat.activeHandIndex
    dealToHand(seatIndex, handIndex)
    const hand = get().seats[seatIndex].hands[handIndex]
    const hv = evaluateHand(hand.cards)

    if (hv.isBust) {
      set({
        seats: get().seats.map((s, i) =>
          i === seatIndex ? updateHand(s, handIndex, { status: 'bust' }) : s
        ),
        message: `${seat.name} 爆牌（${hv.total}）`,
        log: pushLog(get().log, `${seat.name} 爆牌`),
        busy: true,
      })
      emitBlackjackSfx('bust')
      later(() => afterHandDone(seatIndex), BOT_THINK_MS)
      return
    }

    // 加倍：只再拿这一张，之后必须停牌（标准规则）
    if (hv.total === 21 || hand.status === 'doubled' || hand.isSplitAces) {
      const reason =
        hand.status === 'doubled'
          ? `加倍后停牌（${hv.total}）`
          : hand.isSplitAces
            ? `分 A 停牌（${hv.total}）`
            : `停牌（${hv.total}）`
      set({
        seats: get().seats.map((s, i) =>
          i === seatIndex ? updateHand(s, handIndex, { status: 'stand' }) : s
        ),
        message: `${seat.name} ${reason}`,
        log:
          hand.status === 'doubled'
            ? pushLog(get().log, `${seat.name} 加倍拿一张后停牌 ${hv.total}`)
            : get().log,
        busy: true,
      })
      emitBlackjackSfx('stand')
      later(() => afterHandDone(seatIndex), BOT_THINK_MS)
      return
    }

    const cur = get().seats[seatIndex]
    if (!cur.isHuman) {
      set({ busy: true, message: `${cur.name} 思考中…` })
      later(() => get().tickBots(), BOT_THINK_MS)
    } else if (get().autoPlay.enabled) {
      set({ busy: true, message: `托管：${hv.total} 点，继续决策…` })
      later(() => get().tickAutoPlay(), BOT_THINK_MS)
    } else {
      set({ busy: false, message: `你的点数 ${hv.total}，继续？` })
    }
  }

  const applyStand = (seatIndex: number) => {
    const seat = get().seats[seatIndex]
    const handIndex = seat.activeHandIndex
    const hand = seat.hands[handIndex]
    const hv = evaluateHand(hand.cards)
    set({
      seats: get().seats.map((s, i) =>
        i === seatIndex ? updateHand(s, handIndex, { status: 'stand' }) : s
      ),
      message: `${seat.name} 停牌（${hv.total}）`,
      busy: true,
    })
    emitBlackjackSfx('stand')
    later(() => afterHandDone(seatIndex), BOT_THINK_MS / 2)
  }

  /**
   * 加倍（Double Down）：
   * 1. 仅首两张（分 A 后不可加倍）
   * 2. 再押与当前手等额赌注
   * 3. 只再发一张牌，然后强制停牌（由 applyHit 根据 status=doubled 处理）
   */
  const applyDouble = (seatIndex: number) => {
    const state = get()
    const seat = state.seats[seatIndex]
    const handIndex = seat.activeHandIndex
    const hand = seat.hands[handIndex]
    if (hand.cards.length !== 2 || seat.chips < hand.bet || hand.isSplitAces) {
      // 不满足条件时不偷偷改成要牌，避免误解
      set({
        message: '无法加倍：需恰好两张牌，且有等额筹码',
        busy: false,
      })
      return
    }
    const extra = hand.bet
    const newBet = hand.bet + extra
    set({
      seats: state.seats.map((s, i) => {
        if (i !== seatIndex) return s
        return {
          ...updateHand(s, handIndex, {
            bet: newBet,
            status: 'doubled',
          }),
          chips: s.chips - extra,
        }
      }),
      log: pushLog(
        state.log,
        `${seat.name} 加倍 ${hand.bet}→${newBet}（只再拿一张后停牌）`
      ),
      message: `${seat.name} 加倍至 ${newBet}，再发一张…`,
      busy: true,
    })
    emitBlackjackSfx('double')
    // 真人加倍立即落账，防止刷新刷回
    const after = get().seats[seatIndex]
    if (after?.isHuman && get().config.role === 'player') {
      set({ accountChips: saveAccountChips(get().walletOwnerId, after.chips) })
    }
    later(() => applyHit(seatIndex), DEAL_CARD_MS)
  }

  const applySplit = (seatIndex: number) => {
    const state = get()
    const seat = state.seats[seatIndex]
    if (!canSplitHand(seat)) {
      set({ message: '当前无法分牌' })
      return
    }
    const handIndex = seat.activeHandIndex
    const hand = seat.hands[handIndex]
    const [c0, c1] = hand.cards
    const bet = hand.bet
    const splitAces = isAcePair(hand.cards)

    const hand0 = createHand({
      bet,
      cards: [c0],
      status: 'playing',
      fromSplit: true,
      isSplitAces: splitAces,
    })
    const hand1 = createHand({
      bet,
      cards: [c1],
      status: 'playing',
      fromSplit: true,
      isSplitAces: splitAces,
    })

    set({
      seats: state.seats.map((s, i) => {
        if (i !== seatIndex) return s
        return {
          ...s,
          chips: s.chips - bet,
          hands: [hand0, hand1],
          activeHandIndex: 0,
        }
      }),
      log: pushLog(state.log, `${seat.name} 分牌（各注 ${bet}）`),
      message: `${seat.name} 分牌`,
      busy: true,
    })
    emitBlackjackSfx('chip')
    const afterSplit = get().seats[seatIndex]
    if (afterSplit?.isHuman && get().config.role === 'player') {
      set({ accountChips: saveAccountChips(get().walletOwnerId, afterSplit.chips) })
    }

    // 先给第一手补一张
    later(() => {
      dealToHand(seatIndex, 0)
      const h0 = get().seats[seatIndex].hands[0]
      if (splitAces) {
        // 分 A：两手各补一张后都停
        set({
          seats: get().seats.map((s, i) =>
            i === seatIndex ? updateHand(s, 0, { status: 'stand' }) : s
          ),
        })
        later(() => {
          dealToHand(seatIndex, 1)
          set({
            seats: get().seats.map((s, i) =>
              i === seatIndex
                ? { ...updateHand(s, 1, { status: 'stand' }), activeHandIndex: 1 }
                : s
            ),
            message: `${seat.name} 分 A 完成`,
          })
          later(() => afterHandDone(seatIndex), BOT_THINK_MS)
        }, DEAL_CARD_MS)
        return
      }

      const hv = evaluateHand(h0.cards)
      if (hv.total === 21) {
        set({
          seats: get().seats.map((s, i) =>
            i === seatIndex ? updateHand(s, 0, { status: 'stand' }) : s
          ),
        })
        later(() => afterHandDone(seatIndex), BOT_THINK_MS)
        return
      }

      const cur = get().seats[seatIndex]
      if (cur.isHuman) {
        if (get().autoPlay.enabled) {
          set({ busy: true, message: '托管：分牌后决策…' })
          later(() => get().tickAutoPlay(), BOT_THINK_MS)
        } else {
          set({ busy: false, message: '分牌第 1 手：要牌 / 停牌 / 加倍' })
        }
      } else {
        set({ busy: true, message: `${cur.name} 思考中…` })
        later(() => get().tickBots(), BOT_THINK_MS)
      }
    }, DEAL_CARD_MS)
  }

  return {
    phase: 'setup',
    config: { ...DEFAULT_CONFIG },
    shoe: [],
    seats: [],
    dealer: emptyDealer(),
    bankChips: DEFAULT_CONFIG.bankChips,
    activeSeatIndex: 0,
    message: '选择身份并开始游戏',
    busy: false,
    log: [],
    humanBetDraft: 0,
    autoPlay: loadAutoPlayConfig(),
    sessionStats: { wins: 0, losses: 0, pushes: 0, blackjacks: 0 },
    lastBankDelta: null,
    bankSessionProfit: 0,
    accountChips: ACCOUNT_INITIAL_CHIPS,
    walletOwnerId: 'guest',

    setRole: role => set(s => ({ config: { ...s.config, role } })),
    setSeatCount: n => set(s => ({ config: { ...s.config, seatCount: n } })),
    setHumanBetDraft: n => set({ humanBetDraft: n }),
    hydrateWallet: ownerId => {
      const chips = loadAccountChips(ownerId)
      set({
        walletOwnerId: ownerId,
        accountChips: chips,
        config: {
          ...get().config,
          startingChips: chips,
          bankChips: chips,
        },
      })
    },
    resetSessionStats: () =>
      set({
        sessionStats: { wins: 0, losses: 0, pushes: 0, blackjacks: 0 },
        bankSessionProfit: 0,
        lastBankDelta: null,
      }),

    setAutoPlay: partial => {
      set(s => {
        const autoPlay = { ...s.autoPlay, ...partial }
        saveAutoPlayConfig(autoPlay)
        return { autoPlay }
      })
      const st = get()
      if (!st.autoPlay.enabled) return
      const seat = st.seats[st.activeSeatIndex]
      const hand = seat ? getActiveHand(seat) : undefined
      if (
        st.phase === 'player_turns' &&
        seat?.isHuman &&
        hand?.status === 'playing' &&
        !st.busy
      ) {
        set({ busy: true, message: '托管决策中…' })
        later(() => get().tickAutoPlay(), 350)
      } else if (st.phase === 'betting' && st.config.role === 'player' && !st.busy) {
        scheduleAutoBetIfNeeded()
      } else if (st.phase === 'round_end' && st.autoPlay.autoNextRound) {
        later(() => {
          if (get().phase === 'round_end' && get().autoPlay.autoNextRound) get().nextRound()
        }, 600)
      }
    },

    toggleAutoPlay: () => {
      const next = !get().autoPlay.enabled
      get().setAutoPlay({ enabled: next })
      set(s => {
        saveAutoPlayConfig(s.autoPlay)
        return {
          message: next
            ? `已开启托管（硬≥${s.autoPlay.hardStandAt}停 · 软≥${s.autoPlay.softStandAt}停）`
            : '已关闭托管',
          log: pushLog(
            s.log,
            next
              ? `开启托管：硬牌≥${s.autoPlay.hardStandAt}停，软牌≥${s.autoPlay.softStandAt}停`
              : '关闭托管'
          ),
        }
      })
    },

    startGame: () => {
      clearTimers()
      resetHandSeq()
      const st0 = get()
      // 开桌前刷新钱包
      const accountChips = loadAccountChips(st0.walletOwnerId)
      const config = {
        ...st0.config,
        startingChips: accountChips,
        bankChips: accountChips,
      }

      if (accountChips < MIN_BET) {
        set({
          accountChips,
          config,
          message: `筹码为 ${accountChips}，已耗尽且不会重置。请靠赢取积累后再来。`,
          log: pushLog(st0.log, '筹码不足，无法开桌'),
        })
        return
      }

      const seats = makeSeats(config, accountChips)
      set({
        phase: 'betting',
        config,
        seats,
        shoe: createShoe(),
        dealer: emptyDealer(),
        // 坐庄：庄家资金=账号钱包；做闲家：系统庄家用独立池，不花账号钱
        // 做闲家时系统庄家使用大额筹码池，与账号无关
        bankChips: config.role === 'dealer' ? accountChips : Math.max(1_000_000, accountChips * 50),
        accountChips,
        activeSeatIndex: 0,
        busy: false,
        log: [
          `新牌桌：${config.role === 'dealer' ? '坐庄' : '闲家'} · 账号筹码 ${accountChips}`,
        ],
        message:
          config.role === 'dealer' ? '你是庄家。机器人正在下注…' : '请下注',
        humanBetDraft: 0,
        lastBankDelta: null,
        bankSessionProfit: 0,
        sessionStats: { wins: 0, losses: 0, pushes: 0, blackjacks: 0 },
      })

      later(() => {
        const st = get()
        let log = st.log
        const nextSeats = st.seats.map(seat => {
          if (seat.isHuman) return seat
          const bet = decideBotBet(seat.chips)
          if (bet <= 0) {
            log = pushLog(log, `${seat.name} 筹码不足，本局观战`)
            return seat
          }
          log = pushLog(log, `${seat.name} 下注 ${bet}`)
          return {
            ...seat,
            chips: seat.chips - bet,
            hands: [createHand({ bet, status: 'betting' })],
          }
        })
        set({ seats: nextSeats, log })
        if (nextSeats.some(s => seatTotalBet(s) > 0)) emitBlackjackSfx('chip')

        if (st.config.role === 'dealer') {
          set({ message: '下注完成，开始发牌' })
          later(() => beginDealing(), BOT_THINK_MS)
        } else {
          const human = nextSeats.find(s => s.isHuman)
          if (!human || human.chips < MIN_BET) {
            set({
              message: '你的筹码不足，无法继续（归零不会重置）',
              phase: 'round_end',
            })
            return
          }
          set({ message: '请选择下注金额并确认' })
          scheduleAutoBetIfNeeded()
        }
      }, BOT_THINK_MS)
    },

    placeHumanBet: () => {
      const st = get()
      if (st.phase !== 'betting' || st.config.role !== 'player' || st.busy) return
      const human = st.seats.find(s => s.isHuman)
      if (!human) return

      let bet = st.autoPlay.enabled ? st.autoPlay.autoBet : st.humanBetDraft
      bet = Math.max(MIN_BET, Math.min(MAX_BET, bet, human.chips))
      bet = Math.floor(bet / 5) * 5
      if (st.autoPlay.enabled && bet > human.chips) {
        bet = Math.floor(human.chips / 5) * 5
      }
      if (bet < MIN_BET || bet > human.chips) {
        set({ message: st.autoPlay.enabled ? '筹码不足，无法托管下注' : '下注金额无效' })
        return
      }
      if (st.autoPlay.enabled) set({ humanBetDraft: bet })

      const seats = st.seats.map(s =>
        s.isHuman
          ? {
              ...s,
              chips: s.chips - bet,
              hands: [createHand({ bet, status: 'betting' })],
            }
          : s
      )
      const humanAfter = seats.find(s => s.isHuman)!
      const accountChips = saveAccountChips(st.walletOwnerId, humanAfter.chips)
      set({
        seats,
        accountChips,
        message: st.autoPlay.enabled
          ? `托管下注 ${bet}，开始发牌`
          : `你下注 ${bet}，开始发牌`,
        log: pushLog(st.log, `${st.autoPlay.enabled ? '托管' : '你'}下注 ${bet}`),
        busy: true,
      })
      emitBlackjackSfx('chip')
      later(() => beginDealing(), BOT_THINK_MS / 2)
    },

    hit: () => {
      if (!canAct()) return
      set({ busy: true, message: '你要牌…' })
      emitBlackjackSfx('hit')
      applyHit(get().activeSeatIndex)
    },

    stand: () => {
      if (!canAct()) return
      applyStand(get().activeSeatIndex)
    },

    doubleDown: () => {
      if (!canAct()) return
      const seat = getActiveHuman()
      const hand = seat ? getActiveHand(seat) : undefined
      if (!hand || hand.cards.length !== 2 || seat!.chips < hand.bet) {
        set({ message: '当前无法加倍' })
        return
      }
      applyDouble(get().activeSeatIndex)
    },

    split: () => {
      if (!canAct()) return
      const seat = getActiveHuman()
      if (!seat || !canSplitHand(seat)) {
        set({ message: '当前无法分牌（需对子且有等额筹码）' })
        return
      }
      applySplit(get().activeSeatIndex)
    },

    nextRound: () => {
      clearTimers()
      const st = get()
      const seats = st.seats.map(s => ({
        ...s,
        hands: [],
        activeHandIndex: 0,
      }))

      const human = seats.find(s => s.isHuman)
      if (st.config.role === 'player' && human && human.chips < MIN_BET) {
        set({
          seats,
          dealer: emptyDealer(),
          phase: 'round_end',
          message: '筹码不足，游戏结束。请返回设置重新开始。',
          busy: false,
        })
        return
      }

      if (st.config.role === 'dealer' && st.bankChips < MIN_BET) {
        set({
          seats,
          dealer: emptyDealer(),
          phase: 'round_end',
          message: '庄家筹码耗尽，游戏结束。',
          busy: false,
        })
        return
      }

      if (!seats.some(s => s.chips >= MIN_BET)) {
        set({
          seats,
          dealer: emptyDealer(),
          phase: 'round_end',
          message: '所有闲家破产，游戏结束。',
          busy: false,
        })
        return
      }

      set({
        seats,
        dealer: emptyDealer(),
        phase: 'betting',
        busy: false,
        message: st.config.role === 'dealer' ? '机器人下注中…' : '请下注',
        humanBetDraft: 0,
        lastBankDelta: null,
      })

      later(() => {
        const cur = get()
        let log = cur.log
        const nextSeats = cur.seats.map(seat => {
          if (seat.chips < MIN_BET) return { ...seat, hands: [] }
          if (seat.isHuman) return { ...seat, hands: [] }
          const bet = decideBotBet(seat.chips)
          if (bet <= 0) return { ...seat, hands: [] }
          log = pushLog(log, `${seat.name} 下注 ${bet}`)
          return {
            ...seat,
            chips: seat.chips - bet,
            hands: [createHand({ bet, status: 'betting' })],
          }
        })
        set({ seats: nextSeats, log })
        if (nextSeats.some(s => seatTotalBet(s) > 0)) emitBlackjackSfx('chip')

        if (cur.config.role === 'dealer') {
          if (!nextSeats.some(s => seatTotalBet(s) > 0)) {
            set({ phase: 'round_end', message: '没有闲家能下注，游戏结束。', busy: false })
            return
          }
          set({ message: '下注完成，开始发牌', busy: true })
          later(() => beginDealing(), BOT_THINK_MS)
        } else {
          set({ message: '请选择下注金额并确认', busy: false })
          scheduleAutoBetIfNeeded()
        }
      }, BOT_THINK_MS)
    },

    backToSetup: () => {
      clearTimers()
      set({
        phase: 'setup',
        seats: [],
        dealer: emptyDealer(),
        shoe: [],
        busy: false,
        message: '选择身份并开始游戏',
        log: [],
      })
    },

    tickBots: () => {
      const st = get()
      if (st.phase !== 'player_turns') return
      const idx = st.activeSeatIndex
      const seat = st.seats[idx]
      const hand = seat ? getActiveHand(seat) : undefined
      if (!seat || seat.isHuman || hand?.status !== 'playing') return

      const dealerUp = st.dealer.cards[0]
      if (!dealerUp) {
        applyStand(idx)
        return
      }

      if (canSplitHand(seat) && shouldBotSplit(hand.cards, dealerUp)) {
        set({ message: `${seat.name} 分牌` })
        applySplit(idx)
        return
      }

      const canDouble =
        hand.cards.length === 2 && seat.chips >= hand.bet && !hand.isSplitAces
      const action = decideBotAction(
        hand.cards,
        dealerUp,
        seat.chips,
        hand.bet,
        canDouble
      )

      if (action === 'double') {
        applyDouble(idx)
      } else if (action === 'hit') {
        set({ message: `${seat.name} 要牌` })
        applyHit(idx)
      } else {
        applyStand(idx)
      }
    },

    tickAutoPlay: () => {
      const st = get()
      if (!st.autoPlay.enabled || st.phase !== 'player_turns') return
      const idx = st.activeSeatIndex
      const seat = st.seats[idx]
      const hand = seat ? getActiveHand(seat) : undefined
      if (!seat?.isHuman || hand?.status !== 'playing') return

      const dealerUp = st.dealer.cards[0]
      // 托管：A/8 对子自动分牌
      if (
        dealerUp &&
        canSplitHand(seat) &&
        (isAcePair(hand.cards) || hand.cards[0] && rankValueSafe(hand.cards) === 8)
      ) {
        set({ message: '托管：分牌' })
        applySplit(idx)
        return
      }

      const canDouble =
        hand.cards.length === 2 && seat.chips >= hand.bet && !hand.isSplitAces
      const action = decideAutoPlayAction(
        hand.cards,
        seat.chips,
        hand.bet,
        canDouble,
        st.autoPlay
      )

      if (action === 'double') {
        set({ message: '托管：加倍' })
        applyDouble(idx)
      } else if (action === 'hit') {
        set({ message: '托管：要牌' })
        emitBlackjackSfx('hit')
        applyHit(idx)
      } else {
        set({ message: '托管：停牌' })
        applyStand(idx)
      }
    },
  }
})

function rankValueSafe(cards: Card[]): number {
  const r = cards[0]?.rank
  if (!r) return 0
  if (r === 'A') return 11
  if (r === 'J' || r === 'Q' || r === 'K') return 10
  return Number(r)
}

export function getHumanSeat(seats: Seat[]): Seat | undefined {
  return seats.find(s => s.isHuman)
}

export function canDoubleDown(seat: Seat | undefined): boolean {
  if (!seat) return false
  const hand = getActiveHand(seat)
  if (!hand) return false
  return (
    hand.cards.length === 2 &&
    seat.chips >= hand.bet &&
    hand.status === 'playing' &&
    !hand.isSplitAces
  )
}

export function canSplit(seat: Seat | undefined): boolean {
  if (!seat) return false
  return canSplitHand(seat)
}

export { seatTotalBet, getActiveHand, seatNeedsPlay }
