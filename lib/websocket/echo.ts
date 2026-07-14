import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { authenticatedFetch, setSocketIdProvider } from '@/lib/api'

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

let echoInstance: Echo<'reverb'> | null = null

export function createEchoInstance(): Echo<'reverb'> | null {
  if (typeof window === 'undefined') return null
  if (echoInstance) return echoInstance

  window.Pusher = Pusher
  const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME || 'https'
  const secure = scheme === 'https'
  const port = Number(process.env.NEXT_PUBLIC_REVERB_PORT || (secure ? 443 : 8082))
  const host = process.env.NEXT_PUBLIC_REVERB_HOST || window.location.hostname
  const authEndpoint = '/api/broadcasting/auth'

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'game-local',
    wsHost: host,
    wsPort: secure ? undefined : port,
    wssPort: secure && port !== 443 ? port : undefined,
    forceTLS: secure,
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    authorizer: (channel: { name: string }) => ({
      authorize: (
        socketId: string,
        callback: (error: boolean | Error, data?: unknown) => void
      ) => {
        authenticatedFetch(authEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ socket_id: socketId, channel_name: channel.name }),
        })
          .then(async response => {
            if (!response.ok) {
              callback(true, new Error(`频道认证失败 (${response.status})`))
              return
            }
            callback(false, await response.json())
          })
          .catch(error => callback(true, error instanceof Error ? error : new Error(String(error))))
      },
    }),
  } as ConstructorParameters<typeof Echo>[0])
  setSocketIdProvider(() => echoInstance?.socketId())

  return echoInstance
}

export function getEchoInstance(): Echo<'reverb'> | null {
  return echoInstance
}

export function destroyEchoInstance(): void {
  echoInstance?.disconnect()
  echoInstance = null
  setSocketIdProvider(null)
}
