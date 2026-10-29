import { create } from 'zustand'
import { ApiError, apiRequest } from '@/lib/api'

export interface GameUser {
  id: number
  name: string
  email?: string | null
  is_admin: boolean
  permissions: string[]
}

interface AuthState {
  user: GameUser | null
  isAuthenticated: boolean
  loading: boolean
  hasRestoredSession: boolean
  sessionError: string | null
  restoreSession: () => Promise<GameUser | null>
  exchangeTicket: (ticket: string) => Promise<GameUser>
  logout: () => Promise<void>
  beginLogin: () => void
}

let sessionRevision = 0
let pendingRestoration: Promise<GameUser | null> | null = null

function invalidateRestoration() {
  sessionRevision += 1
  pendingRestoration = null
  return sessionRevision
}

function centralLoginUrl(): string {
  const accountUrl = (process.env.NEXT_PUBLIC_ACCOUNT_URL || 'https://next.dogeow.com').replace(
    /\/$/,
    ''
  )
  const returnTo = typeof window === 'undefined' ? 'https://game.dogeow.com/' : window.location.href
  return `${accountUrl}/auth/sso/game?return_to=${encodeURIComponent(returnTo)}`
}

const useAuthStore = create<AuthState>(set => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  hasRestoredSession: false,
  sessionError: null,

  restoreSession: () => {
    // Strict Mode and multiple consumers share the same session lookup.
    if (pendingRestoration) return pendingRestoration
    const revision = ++sessionRevision
    set({ loading: true, sessionError: null })
    const request = (async () => {
      try {
        const user = await apiRequest<GameUser>('/user', 'GET', undefined, {
          suppressUnauthorizedRedirect: true,
        })
        if (revision === sessionRevision) {
          set({ user, isAuthenticated: true, loading: false, hasRestoredSession: true })
        }
        return user
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          if (revision === sessionRevision) {
            set({ user: null, isAuthenticated: false, loading: false, hasRestoredSession: true })
          }
          return null
        }
        if (revision === sessionRevision) {
          set({
            loading: false,
            hasRestoredSession: true,
            sessionError: '暂时无法连接游戏服务，请检查网络后重试。',
          })
        }
        throw error
      } finally {
        if (revision === sessionRevision) pendingRestoration = null
      }
    })()
    pendingRestoration = request
    return request
  },

  exchangeTicket: async ticket => {
    const revision = invalidateRestoration()
    set({ loading: true, sessionError: null })
    try {
      const user = await apiRequest<GameUser>(
        '/auth/exchange',
        'POST',
        { ticket },
        { suppressUnauthorizedRedirect: true }
      )
      if (revision === sessionRevision) {
        set({ user, isAuthenticated: true, loading: false, hasRestoredSession: true })
      }
      return user
    } catch (error) {
      if (revision === sessionRevision) {
        set({ user: null, isAuthenticated: false, loading: false, hasRestoredSession: true })
      }
      throw error
    }
  },

  logout: async () => {
    const revision = invalidateRestoration()
    try {
      await apiRequest('/auth/logout', 'POST', undefined, {
        suppressUnauthorizedRedirect: true,
      })
    } finally {
      if (revision === sessionRevision) {
        set({
          user: null, isAuthenticated: false, loading: false,
          hasRestoredSession: true, sessionError: null,
        })
      }
    }
  },

  beginLogin: () => {
    if (typeof window !== 'undefined') window.location.assign(centralLoginUrl())
  },
}))

if (typeof window !== 'undefined') {
  window.addEventListener('game:unauthorized', () => {
    const state = getSafeState()
    invalidateRestoration()
    useAuthStore.setState({
      user: null, isAuthenticated: false, loading: false,
      hasRestoredSession: true, sessionError: null,
    })
    state.beginLogin()
  })
}

function getSafeState() {
  return useAuthStore.getState()
}

export default useAuthStore
