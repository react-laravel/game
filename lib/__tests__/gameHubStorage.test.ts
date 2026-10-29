import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FAVORITES_KEY, RECENT_GAMES_KEY, getHubSnapshot, readGameIds, recordRecentGame, subscribeToHub, toggleFavorite } from '../gameHubStorage'

describe('game hub storage validation', () => {
  beforeEach(() => {
    window.localStorage.clear()
    const unsubscribe = subscribeToHub(() => {})
    window.dispatchEvent(new StorageEvent('storage', { key: null }))
    unsubscribe()
  })
  afterEach(() => vi.restoreAllMocks())

  it('rejects malformed storage and removes unknown or duplicate game IDs', () => {
    expect(readGameIds('not JSON')).toEqual([])
    expect(readGameIds('null')).toEqual([])
    expect(readGameIds('{"id":"2048"}')).toEqual([])
    expect(readGameIds('["snake",null,"unknown","snake",42,"2048"]')).toEqual(['snake', '2048'])
    toggleFavorite('unknown')
    expect(getHubSnapshot(FAVORITES_KEY)).toBe('[]')
  })

  it('keeps the four most recent distinct visits in order and avoids repeat writes', () => {
    for (const id of ['snake', '2048', 'tetris', 'maze', 'minesweeper', 'maze']) recordRecentGame(id)
    expect(readGameIds(getHubSnapshot(RECENT_GAMES_KEY))).toEqual(['maze', 'minesweeper', 'tetris', '2048'])
    vi.mocked(window.localStorage.setItem).mockClear()
    recordRecentGame('maze')
    expect(window.localStorage.setItem).not.toHaveBeenCalled()
  })

  it('only notifies for hub keys and removes subscriptions', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeToHub(listener)
    window.dispatchEvent(new StorageEvent('storage', { key: 'other' }))
    expect(listener).not.toHaveBeenCalled()
    window.dispatchEvent(new StorageEvent('storage', { key: FAVORITES_KEY }))
    expect(listener).toHaveBeenCalledOnce()
    unsubscribe()
    toggleFavorite('snake')
    expect(listener).toHaveBeenCalledOnce()
  })
})
