import { describe, expect, it, vi } from 'vitest'
import { getMonopolyLobbyChannel, getMonopolyRoomChannel } from '../channels'

describe('Monopoly realtime channels', () => {
  it('subscribes the lobby through a public channel', () => {
    const lobbyChannel = { listen: vi.fn() }
    const echo = {
      channel: vi.fn(() => lobbyChannel),
    }

    expect(getMonopolyLobbyChannel(echo)).toBe(lobbyChannel)
    expect(echo.channel).toHaveBeenCalledWith('monopoly.lobby')
  })

  it('subscribes a room through an authenticated private channel', () => {
    const roomChannel = { listen: vi.fn() }
    const echo = {
      private: vi.fn(() => roomChannel),
    }

    expect(getMonopolyRoomChannel(echo, 42)).toBe(roomChannel)
    expect(echo.private).toHaveBeenCalledWith('monopoly.room.42')
  })
})
