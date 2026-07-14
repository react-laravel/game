import type { NextConfig } from 'next'

const apiOrigin = (process.env.GAME_API_ORIGIN || 'http://127.0.0.1:8002').replace(/\/$/, '')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/game/:path*',
        destination: '/:path*',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${apiOrigin}/api/:path*` },
      { source: '/sanctum/:path*', destination: `${apiOrigin}/sanctum/:path*` },
    ]
  },
  images: {
    // Game assets include animated dice GIFs and user-selected puzzle images.
    // Serve them directly instead of routing them through the Next image proxy.
    unoptimized: true,
    dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
    remotePatterns: [
      { protocol: 'https', hostname: 'upyun.dogeow.com', pathname: '/**' },
      { protocol: 'https', hostname: 'game-api.dogeow.com', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
    ],
  },
}

export default nextConfig
