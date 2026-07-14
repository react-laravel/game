import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, setSocketIdProvider } from '../index'

describe('game API request metadata', () => {
  afterEach(() => {
    setSocketIdProvider(null)
    vi.unstubAllGlobals()
  })

  it('uses the game CSRF token and forwards the current Echo socket ID', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, data: { token: 'game-csrf-token' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, data: { ok: true } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    vi.stubGlobal('fetch', fetchMock)
    setSocketIdProvider(() => '123.456')

    await apiRequest('/probe', 'POST', { value: 1 })

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/auth/csrf',
      expect.objectContaining({ credentials: 'include' })
    )
    const request = fetchMock.mock.calls[1]
    const headers = new Headers((request[1] as RequestInit).headers)
    expect(headers.get('X-CSRF-TOKEN')).toBe('game-csrf-token')
    expect(headers.get('X-Socket-ID')).toBe('123.456')
  })
})
