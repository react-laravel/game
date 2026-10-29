'use client'

import { usePathname } from 'next/navigation'
import useAuthStore from '@/stores/authStore'

export function GameAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const beginLogin = useAuthStore(state => state.beginLogin)
  const restoreSession = useAuthStore(state => state.restoreSession)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const loading = useAuthStore(state => state.loading)
  const sessionError = useAuthStore(state => state.sessionError)

  if (pathname.startsWith('/auth/callback')) {
    return <>{children}</>
  }

  if (loading && !isAuthenticated) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-6">
        <div className="text-center" role="status">
          <div aria-hidden className="border-primary mx-auto h-10 w-10 motion-safe:animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-muted-foreground mt-4 text-sm">正在恢复游戏会话…</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-6">
        <div className="border-border bg-card w-full max-w-md rounded-xl border p-6 text-center shadow-lg">
          <h1 className="text-xl font-semibold">DogeOW 游戏中心</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {sessionError ?? '使用 DogeOW 账号统一登录；登录完成后会自动返回当前游戏。'}
          </p>
          <button
            type="button"
            className="bg-primary text-primary-foreground mt-5 min-h-11 rounded-md px-4 py-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            onClick={sessionError ? () => {
              void restoreSession().catch(() => {})
            } : beginLogin}
          >
            {sessionError ? '重试连接' : '前往 DogeOW 登录'}
          </button>
        </div>
      </main>
    )
  }

  return <>{children}</>
}
