import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import { AuthBootstrap } from '@/components/AuthBootstrap'
import { GameAuthGate } from '@/components/GameAuthGate'
import { GameThemeProvider } from '@/components/GameThemeProvider'
import { GAME_THEME_STORAGE_KEY } from '@/lib/theme'
import './globals.css'

export const metadata: Metadata = {
  title: 'DogeOW 游戏中心',
  description: 'DogeOW 独立休闲游戏中心',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
}

const themeBootstrapScript = `
(() => {
  try {
    const storedTheme = localStorage.getItem('${GAME_THEME_STORAGE_KEY}')
    const theme = storedTheme === 'light' || storedTheme === 'dark'
      ? storedTheme
      : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const isDark = theme === 'dark'
    const backgroundColor = isDark ? '#171717' : '#ffffff'
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.style.colorScheme = theme
    document.documentElement.style.backgroundColor = backgroundColor
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', backgroundColor)
  } catch {}
})()
`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>
        <GameThemeProvider>
          <AuthBootstrap />
          <GameAuthGate>{children}</GameAuthGate>
          <Toaster richColors position="top-center" />
        </GameThemeProvider>
      </body>
    </html>
  )
}
