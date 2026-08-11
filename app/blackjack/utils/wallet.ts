/** 账号筹码钱包（本地按用户 ID 持久化） */

/** 首次进入游戏的固定初始筹码，之后只靠对局输赢变动，不会再赠送 */
export const ACCOUNT_INITIAL_CHIPS = 10_000
/** 机器人闲家每桌筹码（与账号钱包无关） */
export const BOT_STARTING_CHIPS = 2_000

const STORAGE_PREFIX = 'blackjack-wallet-v1:'

export type WalletOwnerId = number | string

function storageKey(ownerId: WalletOwnerId): string {
  return `${STORAGE_PREFIX}${ownerId}`
}

/** 仅保底 ≥0，余额无上限 */
export function clampAccountChips(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.floor(n))
}

/**
 * 读取账号筹码。
 * - 从未开户：写入并返回初始 10000
 * - 已有记录（含 0）：原样返回，不会重置
 */
export function loadAccountChips(ownerId: WalletOwnerId = 'guest'): number {
  if (typeof window === 'undefined') return ACCOUNT_INITIAL_CHIPS
  try {
    const key = storageKey(ownerId)
    const raw = window.localStorage.getItem(key)
    if (raw === null) {
      saveAccountChips(ownerId, ACCOUNT_INITIAL_CHIPS)
      return ACCOUNT_INITIAL_CHIPS
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) {
      saveAccountChips(ownerId, ACCOUNT_INITIAL_CHIPS)
      return ACCOUNT_INITIAL_CHIPS
    }
    return clampAccountChips(n)
  } catch {
    return ACCOUNT_INITIAL_CHIPS
  }
}

export function saveAccountChips(ownerId: WalletOwnerId, chips: number): number {
  const next = clampAccountChips(chips)
  if (typeof window === 'undefined') return next
  try {
    window.localStorage.setItem(storageKey(ownerId), String(next))
  } catch {
    // quota
  }
  return next
}

/** 应用盈亏后写回（可超过初始 10000，不会低于 0） */
export function applyAccountDelta(ownerId: WalletOwnerId, current: number, delta: number): number {
  return saveAccountChips(ownerId, current + delta)
}
