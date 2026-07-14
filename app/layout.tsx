import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import { AuthBootstrap } from '@/components/AuthBootstrap'
import { GameAuthGate } from '@/components/GameAuthGate'
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthBootstrap />
        <GameAuthGate>{children}</GameAuthGate>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
