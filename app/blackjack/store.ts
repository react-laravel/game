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
import { createShoe, drawCard } from './utils/cards'
import { decideBotAction, decideBotBet } from './utils/bot'
import { dealerMustHit, evaluateHand } from './utils/hand'
import { settleAllSeats } from './utils/settle'
import { emitBlackjackSfx } from './utils/sfx'

interface BlackjackState {
  phase: Phase
  config: GameConfig
  shoe: Card[]
  seats: Seat[]
  dealer: Dealer
  /** 坐庄时的庄家筹码；做闲家时为赌场无限庄（仅记账用） */
  bankChips: number
  activeSeatIndex: number
  message: string
  /** 是否在自动推进中（机器人/发牌动画） */
  busy: boolean
  /** 本局日志 */
  log: string[]
  humanBetDraft: number

  // actions
  setRole: (role: Role) => void
  setSeatCount: (n: number) => void
  setStartingChips: (n: number) => void
  setBankChipsConfig: (n: number) => void
  setHumanBetDraft: (n: number) => void
  startGame: () => void
  placeHumanBet: () => void
  hit: () => void
  stand: () => void
  doubleDown: () => void
  nextRound: () => void
  backToSetup: () => void
  /** 内部调度用，暴露给 effect 推进 */
  tickBots: () => void
}

const emptyDealer = (): Dealer => ({
  cards: [],
  holeRevealed: false,
  status: 'waiting',
})

function makeSeats(config: GameConfig): Seat[] {
  const seats: Seat[] = []
  const names = [...BOT_NAMES].sort(() => Math.random() - 0.5)
  let botIdx = 0

  for (let i = 0; i < config.seatCount; i++) {
    const isHuman = config.role === 'player' && i === 0
    seats.push({
      id: `seat-${i}`,
      name: isHuman ? '你' : names[botIdx++ % names.length],
      isHuman,
      chips: config.startingChips,
      bet: 0,
      cards: [],
      status: 'waiting',
      result: null,
      resultAmount: 0,
    })
  }
  return seats
}

function pushLog(log: string[], line: string, max = 40): string[] {
  return [line, ...log].slice(0, max)
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
    return !!seat?.isHuman && (seat.status === 'playing' || seat.status === 'doubled')
  }

  /** 发一张牌给闲家 */
  const dealToSeat = (seatIndex: number) => {
    const state = get()
    let shoe = state.shoe
    const { card, shoe: next } = drawCard(shoe)
    shoe = next
    const seats = state.seats.map((s, i) =>
      i === seatIndex ? { ...s, cards: [...s.cards, card] } : s
    )
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

  const afterPlayerDone = (fromIndex: number) => {
    const { seats } = get()
    // 找下一个还在 playing 的座位
    for (let i = fromIndex + 1; i < seats.length; i++) {
      if (seats[i].status === 'playing') {
        set({ activeSeatIndex: i, busy: false })
        // 若是机器人，稍后 tick
        if (!seats[i].isHuman) {
          set({ busy: true, message: `${seats[i].name} 思考中…` })
          later(() => get().tickBots(), BOT_THINK_MS)
        } else {
          emitBlackjackSfx('turn')
          set({ message: '轮到你行动：要牌 / 停牌 / 加倍' })
        }
        return
      }
    }
    // 全部闲家结束 → 庄家回合
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
      // 下注时已扣 bet，结算时按 payout 加回
      const chips = seat.chips + r.payout
      bankDelta -= r.net // 庄家与闲家盈亏相反

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

      return {
        ...seat,
        chips,
        status: 'settled' as const,
        result: r.result,
        resultAmount: r.net,
        bet: 0,
      }
    })

    const bankChips = state.bankChips + bankDelta
    log = pushLog(
      log,
      state.config.role === 'dealer'
        ? `本局庄家筹码变化 ${bankDelta >= 0 ? '+' : ''}${bankDelta}，余额 ${bankChips}`
        : `本局结束`
    )

    set({
      phase: 'round_end',
      seats,
      bankChips,
      busy: false,
      message: '本局结算完成',
      log,
    })

    // 结算音效：优先跟真人结果，坐庄时跟庄家盈亏
    const human = seats.find(s => s.isHuman)
    if (human?.result === 'blackjack') emitBlackjackSfx('blackjack')
    else if (human?.result === 'win') emitBlackjackSfx('win')
    else if (human?.result === 'lose') emitBlackjackSfx('lose')
    else if (human?.result === 'push') emitBlackjackSfx('push')
    else if (state.config.role === 'dealer') {
      if (bankDelta > 0) emitBlackjackSfx('win')
      else if (bankDelta < 0) emitBlackjackSfx('lose')
      else emitBlackjackSfx('push')
    }
  }

  const beginDealing = () => {
    set({ phase: 'dealing', busy: true, message: '发牌中…' })

    // 重置手牌
    set(s => ({
      seats: s.seats.map(seat => ({
        ...seat,
        cards: [],
        status: seat.bet > 0 ? 'playing' : 'waiting',
        result: null,
        resultAmount: 0,
      })),
      dealer: emptyDealer(),
    }))

    // 可能需要重新洗牌
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
      .filter(({ s }) => s.bet > 0)

    // 发牌顺序：两轮，每轮 闲家们 → 庄家
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
        dealToSeat(s.index)
      } else {
        dealToDealer()
      }
      later(next, DEAL_CARD_MS)
    }
    next()
  }

  const afterDeal = () => {
    // 检查黑杰克
    const state = get()
    let log = state.log
    const seats = state.seats.map(seat => {
      if (seat.bet <= 0) return seat
      const hv = evaluateHand(seat.cards)
      if (hv.isBlackjack) {
        log = pushLog(log, `${seat.name} 黑杰克！`)
        return { ...seat, status: 'blackjack' as const }
      }
      return { ...seat, status: 'playing' as const }
    })

    if (seats.some(s => s.status === 'blackjack')) {
      emitBlackjackSfx('blackjack')
    }

    // 庄家两张都已发，但暗牌未翻；仅在需要时检查
    // 标准流程：若有玩家非 BJ，进入玩家回合；BJ 玩家跳过行动
    set({ seats, log, dealer: { ...state.dealer, status: 'playing' } })

    // 若所有闲家都是 BJ，直接庄家翻牌结算
    const needPlay = seats.some(s => s.status === 'playing')

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

    // 找第一个 playing 的座位
    const first = seats.findIndex(s => s.status === 'playing')
    set({
      phase: 'player_turns',
      activeSeatIndex: first,
      busy: false,
    })

    const seat = seats[first]
    if (seat.isHuman) {
      emitBlackjackSfx('turn')
      set({ message: '轮到你行动：要牌 / 停牌 / 加倍' })
    } else {
      set({ busy: true, message: `${seat.name} 思考中…` })
      later(() => get().tickBots(), BOT_THINK_MS)
    }
  }

  const applyHit = (seatIndex: number) => {
    dealToSeat(seatIndex)
    const seat = get().seats[seatIndex]
    const hv = evaluateHand(seat.cards)
    if (hv.isBust) {
      set({
        seats: get().seats.map((s, i) =>
          i === seatIndex ? { ...s, status: 'bust' } : s
        ),
        message: `${seat.name} 爆牌（${hv.total}）`,
        log: pushLog(get().log, `${seat.name} 爆牌`),
        busy: true,
      })
      emitBlackjackSfx('bust')
      later(() => afterPlayerDone(seatIndex), BOT_THINK_MS)
      return
    }
    if (hv.total === 21 || seat.status === 'doubled') {
      set({
        seats: get().seats.map((s, i) =>
          i === seatIndex ? { ...s, status: 'stand' } : s
        ),
        message: `${seat.name} 停牌（${hv.total}）`,
        busy: true,
      })
      emitBlackjackSfx('stand')
      later(() => afterPlayerDone(seatIndex), BOT_THINK_MS)
      return
    }
    // 继续，若是机器人再思考
    if (!seat.isHuman) {
      set({ busy: true, message: `${seat.name} 思考中…` })
      later(() => get().tickBots(), BOT_THINK_MS)
    } else {
      set({ busy: false, message: `你的点数 ${hv.total}，继续？` })
    }
  }

  const applyStand = (seatIndex: number) => {
    const seat = get().seats[seatIndex]
    const hv = evaluateHand(seat.cards)
    set({
      seats: get().seats.map((s, i) =>
        i === seatIndex ? { ...s, status: 'stand' } : s
      ),
      message: `${seat.name} 停牌（${hv.total}）`,
      busy: true,
    })
    emitBlackjackSfx('stand')
    later(() => afterPlayerDone(seatIndex), BOT_THINK_MS / 2)
  }

  const applyDouble = (seatIndex: number) => {
    const state = get()
    const seat = state.seats[seatIndex]
    if (seat.cards.length !== 2 || seat.chips < seat.bet) {
      // 无法加倍则当 hit
      applyHit(seatIndex)
      return
    }
    const extra = seat.bet
    set({
      seats: state.seats.map((s, i) =>
        i === seatIndex
          ? {
              ...s,
              chips: s.chips - extra,
              bet: s.bet + extra,
              status: 'doubled',
            }
          : s
      ),
      log: pushLog(state.log, `${seat.name} 加倍，赌注 ${seat.bet + extra}`),
      message: `${seat.name} 加倍`,
      busy: true,
    })
    emitBlackjackSfx('double')
    later(() => applyHit(seatIndex), DEAL_CARD_MS)
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

    setRole: role => set(s => ({ config: { ...s.config, role } })),
    setSeatCount: n => set(s => ({ config: { ...s.config, seatCount: n } })),
    setStartingChips: n => set(s => ({ config: { ...s.config, startingChips: n } })),
    setBankChipsConfig: n => set(s => ({ config: { ...s.config, bankChips: n } })),
    setHumanBetDraft: n => set({ humanBetDraft: n }),

    startGame: () => {
      clearTimers()
      const { config } = get()
      const seats = makeSeats(config)
      set({
        phase: 'betting',
        seats,
        shoe: createShoe(),
        dealer: emptyDealer(),
        bankChips: config.bankChips,
        activeSeatIndex: 0,
        busy: false,
        log: [`新牌桌：你选择${config.role === 'dealer' ? '坐庄' : '做闲家'}，${config.seatCount} 个闲家位`],
        message:
          config.role === 'dealer'
            ? '你是庄家。机器人正在下注…'
            : '请下注',
        humanBetDraft: 0,
      })

      // 机器人自动下注
      later(() => {
        const st = get()
        let log = st.log
        const nextSeats = st.seats.map(seat => {
          if (seat.isHuman) return { ...seat, status: 'betting' as const }
          const bet = decideBotBet(seat.chips)
          if (bet <= 0) {
            log = pushLog(log, `${seat.name} 筹码不足，本局观战`)
            return { ...seat, bet: 0, status: 'broke' as const }
          }
          log = pushLog(log, `${seat.name} 下注 ${bet}`)
          return {
            ...seat,
            bet,
            chips: seat.chips - bet,
            status: 'betting' as const,
          }
        })
        set({ seats: nextSeats, log })
        if (nextSeats.some(s => s.bet > 0)) emitBlackjackSfx('chip')

        // 坐庄：无真人闲家，全部 bot 下完直接发牌
        if (st.config.role === 'dealer') {
          set({ message: '下注完成，开始发牌' })
          later(() => beginDealing(), BOT_THINK_MS)
        } else {
          const human = nextSeats.find(s => s.isHuman)
          if (!human || human.chips < MIN_BET) {
            set({
              message: '你的筹码不足，无法继续',
              phase: 'round_end',
              seats: nextSeats.map(s =>
                s.isHuman ? { ...s, status: 'broke' } : s
              ),
            })
            return
          }
          set({ message: '请选择下注金额并确认' })
        }
      }, BOT_THINK_MS)
    },

    placeHumanBet: () => {
      const st = get()
      if (st.phase !== 'betting' || st.config.role !== 'player' || st.busy) return
      const human = st.seats.find(s => s.isHuman)
      if (!human) return

      let bet = st.humanBetDraft
      bet = Math.max(MIN_BET, Math.min(MAX_BET, bet, human.chips))
      bet = Math.floor(bet / 5) * 5
      if (bet < MIN_BET || bet > human.chips) {
        set({ message: '下注金额无效' })
        return
      }

      const seats = st.seats.map(s =>
        s.isHuman
          ? { ...s, bet, chips: s.chips - bet, status: 'betting' as const }
          : s
      )
      set({
        seats,
        message: `你下注 ${bet}，开始发牌`,
        log: pushLog(st.log, `你下注 ${bet}`),
        busy: true,
      })
      emitBlackjackSfx('chip')
      later(() => beginDealing(), BOT_THINK_MS / 2)
    },

    hit: () => {
      if (!canAct()) return
      const idx = get().activeSeatIndex
      set({ busy: true, message: '你要牌…' })
      emitBlackjackSfx('hit')
      applyHit(idx)
    },

    stand: () => {
      if (!canAct()) return
      applyStand(get().activeSeatIndex)
    },

    doubleDown: () => {
      if (!canAct()) return
      const seat = getActiveHuman()
      if (!seat || seat.cards.length !== 2 || seat.chips < seat.bet) {
        set({ message: '当前无法加倍' })
        return
      }
      applyDouble(get().activeSeatIndex)
    },

    nextRound: () => {
      clearTimers()
      const st = get()
      // 清除破产座位或跳过
      const seats = st.seats.map(s => ({
        ...s,
        bet: 0,
        cards: [],
        status: s.chips < MIN_BET ? ('broke' as const) : ('waiting' as const),
        result: null,
        resultAmount: 0,
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

      // 至少要有一个有筹码的闲家
      const anyPlayer = seats.some(s => s.chips >= MIN_BET)
      if (!anyPlayer) {
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
      })

      later(() => {
        const cur = get()
        let log = cur.log
        const nextSeats = cur.seats.map(seat => {
          if (seat.chips < MIN_BET) {
            return { ...seat, bet: 0, status: 'broke' as const }
          }
          if (seat.isHuman) return { ...seat, status: 'betting' as const }
          const bet = decideBotBet(seat.chips)
          if (bet <= 0) {
            return { ...seat, bet: 0, status: 'broke' as const }
          }
          log = pushLog(log, `${seat.name} 下注 ${bet}`)
          return {
            ...seat,
            bet,
            chips: seat.chips - bet,
            status: 'betting' as const,
          }
        })
        set({ seats: nextSeats, log })
        if (nextSeats.some(s => s.bet > 0)) emitBlackjackSfx('chip')

        if (cur.config.role === 'dealer') {
          const anyBet = nextSeats.some(s => s.bet > 0)
          if (!anyBet) {
            set({ phase: 'round_end', message: '没有闲家能下注，游戏结束。', busy: false })
            return
          }
          set({ message: '下注完成，开始发牌', busy: true })
          later(() => beginDealing(), BOT_THINK_MS)
        } else {
          set({ message: '请选择下注金额并确认', busy: false })
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
      if (!seat || seat.isHuman || seat.status !== 'playing') return

      const dealerUp = st.dealer.cards[0]
      if (!dealerUp) {
        applyStand(idx)
        return
      }

      const canDouble = seat.cards.length === 2 && seat.chips >= seat.bet
      const action = decideBotAction(seat.cards, dealerUp, seat.chips, seat.bet, canDouble)

      if (action === 'double') {
        applyDouble(idx)
      } else if (action === 'hit') {
        set({ message: `${seat.name} 要牌` })
        applyHit(idx)
      } else {
        applyStand(idx)
      }
    },
  }
})

export function getHumanSeat(seats: Seat[]): Seat | undefined {
  return seats.find(s => s.isHuman)
}

export function canDoubleDown(seat: Seat | undefined): boolean {
  if (!seat) return false
  return seat.cards.length === 2 && seat.chips >= seat.bet && seat.status === 'playing'
}
