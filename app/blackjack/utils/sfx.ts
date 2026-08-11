/** 牌局音效事件（store 发射，UI 订阅播放） */

export type BlackjackSfx =
  | 'deal'
  | 'chip'
  | 'hit'
  | 'stand'
  | 'double'
  | 'bust'
  | 'reveal'
  | 'shuffle'
  | 'win'
  | 'lose'
  | 'push'
  | 'blackjack'
  | 'turn'
  | 'click'

type Listener = (sfx: BlackjackSfx) => void

const listeners = new Set<Listener>()

export function emitBlackjackSfx(sfx: BlackjackSfx) {
  listeners.forEach(listener => {
    try {
      listener(sfx)
    } catch {
      // 音效失败不影响牌局
    }
  })
}

export function subscribeBlackjackSfx(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
