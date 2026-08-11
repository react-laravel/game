import type { Card } from '../types'
import { evaluateHand } from './hand'

export type AutoPlayAction = 'hit' | 'stand' | 'double' | 'split'

/** 托管策略配置 */
export interface AutoPlayConfig {
  /** 是否开启托管 */
  enabled: boolean
  /**
   * 硬牌停牌点：点数 >= 此值停牌，低于则要牌。
   * 默认 17（即 16 及以下要牌，17 不加）。
   */
  hardStandAt: number
  /**
   * 软牌停牌点：含 A 按 11 计时，点数 >= 此值停牌。
   * 默认 18（软 17 继续要牌）。
   */
  softStandAt: number
  /** 是否允许托管加倍 */
  allowDouble: boolean
  /** 硬牌加倍下限（含），仅首两张 */
  doubleHardMin: number
  /** 硬牌加倍上限（含） */
  doubleHardMax: number
  /** 自动下注金额（需为 5 的倍数），托管时每局使用 */
  autoBet: number
  /** 局结束自动进入下一局 */
  autoNextRound: boolean
}

export const DEFAULT_AUTO_PLAY: AutoPlayConfig = {
  enabled: false,
  hardStandAt: 17,
  softStandAt: 18,
  allowDouble: true,
  doubleHardMin: 10,
  doubleHardMax: 11,
  autoBet: 20,
  autoNextRound: true,
}

const AUTO_PLAY_STORAGE_KEY = 'blackjack-auto-play-v1'

export function loadAutoPlayConfig(): AutoPlayConfig {
  if (typeof window === 'undefined') return { ...DEFAULT_AUTO_PLAY }
  try {
    const raw = window.localStorage.getItem(AUTO_PLAY_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_AUTO_PLAY }
    const parsed = JSON.parse(raw) as Partial<AutoPlayConfig>
    return {
      ...DEFAULT_AUTO_PLAY,
      ...parsed,
      // 刷新后默认不自动开托管，避免误开；规则仍恢复
      enabled: false,
      hardStandAt: Number(parsed.hardStandAt) || DEFAULT_AUTO_PLAY.hardStandAt,
      softStandAt: Number(parsed.softStandAt) || DEFAULT_AUTO_PLAY.softStandAt,
      doubleHardMin: Number(parsed.doubleHardMin) || DEFAULT_AUTO_PLAY.doubleHardMin,
      doubleHardMax: Number(parsed.doubleHardMax) || DEFAULT_AUTO_PLAY.doubleHardMax,
      autoBet: Number(parsed.autoBet) || DEFAULT_AUTO_PLAY.autoBet,
      allowDouble: parsed.allowDouble ?? DEFAULT_AUTO_PLAY.allowDouble,
      autoNextRound: parsed.autoNextRound ?? DEFAULT_AUTO_PLAY.autoNextRound,
    }
  } catch {
    return { ...DEFAULT_AUTO_PLAY }
  }
}

export function saveAutoPlayConfig(config: AutoPlayConfig) {
  if (typeof window === 'undefined') return
  try {
    // 持久化规则，不强制持久化 enabled（enabled 另存为上次偏好）
    window.localStorage.setItem(
      AUTO_PLAY_STORAGE_KEY,
      JSON.stringify({
        ...config,
        // 记住是否曾开启，但 load 时仍默认 false；若希望记住开启可改为 config.enabled
        lastEnabled: config.enabled,
      })
    )
  } catch {
    // ignore quota
  }
}

/**
 * 根据托管规则决定动作。
 * - 硬牌：total < hardStandAt → 要；否则停
 * - 软牌：total < softStandAt → 要；否则停
 * - 加倍：开启且可加倍时，硬牌 total 在 [min,max] 加倍
 */
export function decideAutoPlayAction(
  cards: Card[],
  chips: number,
  bet: number,
  canDouble: boolean,
  config: Pick<
    AutoPlayConfig,
    'hardStandAt' | 'softStandAt' | 'allowDouble' | 'doubleHardMin' | 'doubleHardMax'
  >
): AutoPlayAction {
  const hand = evaluateHand(cards)
  if (hand.isBust || hand.isBlackjack || hand.total >= 21) return 'stand'

  const hardStand = clampPoint(config.hardStandAt)
  const softStand = clampPoint(config.softStandAt)

  if (
    config.allowDouble &&
    canDouble &&
    cards.length === 2 &&
    chips >= bet &&
    !hand.soft
  ) {
    const dMin = clampDouble(config.doubleHardMin)
    const dMax = clampDouble(config.doubleHardMax)
    if (hand.total >= dMin && hand.total <= dMax) {
      return 'double'
    }
  }

  if (hand.soft) {
    return hand.total < softStand ? 'hit' : 'stand'
  }
  return hand.total < hardStand ? 'hit' : 'stand'
}

/** 停牌点：12–21 */
function clampPoint(n: number): number {
  return Math.max(12, Math.min(21, Math.round(n)))
}

/** 加倍区间：9–11 */
function clampDouble(n: number): number {
  return Math.max(9, Math.min(11, Math.round(n)))
}

export function describeAutoPlayRules(config: AutoPlayConfig): string {
  const hard = clampPoint(config.hardStandAt)
  const soft = clampPoint(config.softStandAt)
  const parts = [
    `硬牌 <${hard} 要牌，≥${hard} 停`,
    `软牌 <${soft} 要牌，≥${soft} 停`,
  ]
  if (config.allowDouble) {
    parts.push(`硬 ${config.doubleHardMin}–${config.doubleHardMax} 加倍`)
  } else {
    parts.push('不加倍')
  }
  parts.push(`自动注 ${config.autoBet}`)
  if (config.autoNextRound) parts.push('自动下局')
  return parts.join(' · ')
}
