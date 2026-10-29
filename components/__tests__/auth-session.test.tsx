import { StrictMode } from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthBootstrap } from '../AuthBootstrap'
import { GameAuthGate } from '../GameAuthGate'
import useAuthStore, { type GameUser } from '@/stores/authStore'
import { ApiError } from '@/lib/api'

const mocks = vi.hoisted(() => ({ request: vi.fn(), pathname: '/2048' }))

vi.mock('next/navigation', () => ({ usePathname: () => mocks.pathname }))
vi.mock('@/lib/api', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/api')>(),
  apiRequest: mocks.request,
}))

const user: GameUser = { id: 1, name: '玩家', is_admin: false, permissions: [] }
const newUser: GameUser = { ...user, id: 2, name: '新玩家' }

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

describe('game session restoration', () => {
  beforeEach(() => {
    mocks.request.mockReset()
    mocks.pathname = '/2048'
    useAuthStore.setState({ user: null, isAuthenticated: false, loading: true, hasRestoredSession: false, sessionError: null })
  })

  it('shares a pending session lookup and restores only once across route changes', async () => {
    const lookup = deferred<GameUser>()
    mocks.request.mockReturnValue(lookup.promise)
    const { rerender } = render(<StrictMode><AuthBootstrap /></StrictMode>)
    expect(mocks.request).toHaveBeenCalledTimes(1)
    await act(async () => { lookup.resolve(user); await lookup.promise })

    mocks.pathname = '/snake'
    rerender(<StrictMode><AuthBootstrap /></StrictMode>)
    expect(mocks.request).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().loading).toBe(false)
  })

  it('does not restore on the one-time ticket callback route', () => {
    mocks.pathname = '/auth/callback'
    render(<AuthBootstrap />)
    expect(mocks.request).not.toHaveBeenCalled()
  })

  it('shows an outage recovery action and retries instead of requiring login', async () => {
    mocks.request.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(user)
    render(<><AuthBootstrap /><GameAuthGate><p>游戏内容</p></GameAuthGate></>)
    expect(await screen.findByRole('button', { name: '重试连接' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '前往 DogeOW 登录' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '重试连接' }))
    expect(await screen.findByText('游戏内容')).toBeInTheDocument()
    expect(mocks.request).toHaveBeenCalledTimes(2)
  })

  it('requires login only when the server confirms there is no session', async () => {
    mocks.request.mockRejectedValue(new ApiError('Unauthorized', 401))
    render(<><AuthBootstrap /><GameAuthGate>游戏内容</GameAuthGate></>)
    expect(await screen.findByRole('button', { name: '前往 DogeOW 登录' })).toBeInTheDocument()
    expect(useAuthStore.getState().sessionError).toBeNull()
  })

  it('retains an authenticated game during a failed refresh', async () => {
    useAuthStore.setState({ user, isAuthenticated: true, loading: false, hasRestoredSession: true })
    mocks.request.mockRejectedValue(new Error('Offline'))
    render(<GameAuthGate>游戏内容</GameAuthGate>)
    await act(async () => { await expect(useAuthStore.getState().restoreSession()).rejects.toThrow('Offline') })
    expect(screen.getByText('游戏内容')).toBeInTheDocument()
    expect(useAuthStore.getState().user).toEqual(user)
  })

  it('does not overwrite a newer login with a stale session response', async () => {
    const lookup = deferred<GameUser>()
    mocks.request.mockReturnValueOnce(lookup.promise).mockResolvedValueOnce(newUser)
    const restore = useAuthStore.getState().restoreSession()
    await useAuthStore.getState().exchangeTicket('ticket')
    lookup.resolve(user)
    await restore
    expect(useAuthStore.getState().user).toEqual(newUser)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('does not authenticate again when a stale session response arrives after logout', async () => {
    const lookup = deferred<GameUser>()
    mocks.request.mockReturnValueOnce(lookup.promise).mockResolvedValueOnce(undefined)
    const restore = useAuthStore.getState().restoreSession()
    await useAuthStore.getState().logout()
    lookup.resolve(user)
    await restore
    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(false))
    expect(useAuthStore.getState().user).toBeNull()
  })
})
