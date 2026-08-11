'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, Coins, Crown, User, Wallet } from 'lucide-react'
import { MAX_SEATS, MIN_BET, MIN_SEATS } from '../constants'
import { useBlackjackStore } from '../store'
import { emitBlackjackSfx } from '../utils/sfx'
import { ACCOUNT_INITIAL_CHIPS } from '../utils/wallet'
import { cn } from '@/lib/helpers'

export function SetupScreen() {
  const config = useBlackjackStore(s => s.config)
  const accountChips = useBlackjackStore(s => s.accountChips)
  const setRole = useBlackjackStore(s => s.setRole)
  const setSeatCount = useBlackjackStore(s => s.setSeatCount)
  const autoPlay = useBlackjackStore(s => s.autoPlay)
  const setAutoPlay = useBlackjackStore(s => s.setAutoPlay)
  const startGame = useBlackjackStore(s => s.startGame)

  const broke = accountChips < MIN_BET

  return (
    <Card className="mx-auto max-w-lg border-emerald-900/10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">开设牌桌</CardTitle>
        <CardDescription>
          选择坐庄或做闲家。账号筹码持久保存，只靠对局输赢变动。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 账号钱包 */}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Wallet className="h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-medium">账号筹码</p>
              <p className="text-muted-foreground text-xs">
                新用户赠送 {ACCOUNT_INITIAL_CHIPS} · 余额无上限 · 归零不重置
              </p>
            </div>
          </div>
          <div
            className={cn(
              'text-lg font-bold tabular-nums',
              broke ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'
            )}
          >
            {accountChips}
          </div>
        </div>

        {broke && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-600 dark:text-red-400">
            筹码已耗尽，不会自动重置。请靠对局赢取后再来。
          </p>
        )}

        <div>
          <p className="mb-2 text-sm font-medium">你的身份</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                emitBlackjackSfx('click')
                setRole('player')
              }}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition',
                config.role === 'player'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40'
              )}
            >
              <User className="text-primary h-8 w-8" />
              <span className="font-semibold">做闲家</span>
              <span className="text-muted-foreground text-center text-xs">
                用账号筹码下注，与系统庄家对战
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                emitBlackjackSfx('click')
                setRole('dealer')
              }}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition',
                config.role === 'dealer'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40'
              )}
            >
              <Crown className="h-8 w-8 text-amber-500" />
              <span className="font-semibold">坐庄</span>
              <span className="text-muted-foreground text-center text-xs">
                账号筹码作为庄家资金，对战机器人闲家
              </span>
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">闲家座位数</p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: MAX_SEATS - MIN_SEATS + 1 }, (_, i) => MIN_SEATS + i).map(n => (
              <Button
                key={n}
                type="button"
                size="sm"
                variant={config.seatCount === n ? 'default' : 'outline'}
                onClick={() => setSeatCount(n)}
              >
                {n} 人
              </Button>
            ))}
          </div>
          <p className="text-muted-foreground mt-1.5 flex items-center gap-1 text-xs">
            <Bot className="h-3.5 w-3.5" />
            {config.role === 'player'
              ? `你占 1 席，另 ${Math.max(0, config.seatCount - 1)} 席为机器人`
              : `${config.seatCount} 席全部为机器人闲家`}
          </p>
        </div>

        {config.role === 'dealer' && (
          <div className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-medium">自动下一局</p>
              <p className="text-muted-foreground text-xs">
                结算后自动开新局（闲家机器人会继续下注）
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant={autoPlay.autoNextRound ? 'default' : 'outline'}
              onClick={() => {
                emitBlackjackSfx('click')
                setAutoPlay({ autoNextRound: !autoPlay.autoNextRound })
              }}
            >
              {autoPlay.autoNextRound ? '已开启' : '关闭'}
            </Button>
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          disabled={broke}
          onClick={() => {
            emitBlackjackSfx('chip')
            startGame()
          }}
        >
          <Coins className="h-4 w-4" />
          {broke ? '筹码不足' : '开始游戏'}
        </Button>

        <p className="text-muted-foreground text-center text-xs">
          黑杰克 3:2 · 庄家软 17 停牌 · 新用户 {ACCOUNT_INITIAL_CHIPS} 起步
        </p>
      </CardContent>
    </Card>
  )
}
