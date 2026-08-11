'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, Coins, Crown, User } from 'lucide-react'
import {
  DEFAULT_BANK_CHIPS,
  DEFAULT_STARTING_CHIPS,
  MAX_SEATS,
  MIN_SEATS,
} from '../constants'
import { useBlackjackStore } from '../store'
import { emitBlackjackSfx } from '../utils/sfx'
import { cn } from '@/lib/helpers'

export function SetupScreen() {
  const config = useBlackjackStore(s => s.config)
  const setRole = useBlackjackStore(s => s.setRole)
  const setSeatCount = useBlackjackStore(s => s.setSeatCount)
  const setStartingChips = useBlackjackStore(s => s.setStartingChips)
  const setBankChipsConfig = useBlackjackStore(s => s.setBankChipsConfig)
  const autoPlay = useBlackjackStore(s => s.autoPlay)
  const setAutoPlay = useBlackjackStore(s => s.setAutoPlay)
  const startGame = useBlackjackStore(s => s.startGame)

  return (
    <Card className="mx-auto max-w-lg border-emerald-900/10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">开设牌桌</CardTitle>
        <CardDescription>
          选择坐庄或做闲家。没有真实玩家的座位将由机器人自动下注与出牌。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
                你自己下注出牌，庄家为系统，其余座位机器人
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
                你持有庄家筹码，闲家全为机器人（庄家按规则自动要牌）
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

        <div
          className={cn(
            'grid gap-4',
            config.role === 'dealer' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
          )}
        >
          <div>
            <p className="mb-2 text-sm font-medium">闲家初始筹码</p>
            <div className="flex flex-nowrap gap-2">
              {[500, 1000, 2000].map(n => (
                <Button
                  key={n}
                  type="button"
                  size="sm"
                  variant={config.startingChips === n ? 'default' : 'outline'}
                  onClick={() => setStartingChips(n)}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>
          {config.role === 'dealer' && (
            <div>
              <p className="mb-2 text-sm font-medium">庄家资金</p>
              <div className="flex flex-nowrap gap-2">
                {[3000, 5000, 10000].map(n => (
                  <Button
                    key={n}
                    type="button"
                    size="sm"
                    variant={config.bankChips === n ? 'default' : 'outline'}
                    onClick={() => setBankChipsConfig(n)}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 坐庄时机器人全自动，常用「自动下一局」单独开关 */}
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
          onClick={() => {
            emitBlackjackSfx('chip')
            startGame()
          }}
        >
          <Coins className="h-4 w-4" />
          开始游戏
        </Button>

        <p className="text-muted-foreground text-center text-xs">
          默认：闲家 {DEFAULT_STARTING_CHIPS} 筹码
          {config.role === 'dealer' ? ` · 庄家 ${DEFAULT_BANK_CHIPS}` : ''} · 黑杰克 3:2 · 庄家软
          17 停牌
        </p>
      </CardContent>
    </Card>
  )
}
