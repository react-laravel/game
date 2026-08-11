'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GameRulesDialog } from '@/components/ui/game-rules-dialog'
import { Crown, Spade, Volume2, VolumeX } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import { DECK_COUNT, GAME_RULES } from '../constants'
import { getHumanSeat } from '../store'
import { useBlackjackKeyboard } from '../hooks/useBlackjackKeyboard'
import { useBlackjackSounds } from '../hooks/useBlackjackSounds'
import { useBlackjackStore } from '../store'
import { displayTotal } from '../utils/hand'

import { ActionBar } from './ActionBar'
import { AutoPlayPanel } from './AutoPlayPanel'
import { PlayerSeat } from './PlayerSeat'
import { CardFan } from './PlayingCard'
import { SetupScreen } from './SetupScreen'
import { cn } from '@/lib/helpers'

export default function BlackjackGame() {
  const phase = useBlackjackStore(s => s.phase)
  const seats = useBlackjackStore(s => s.seats)
  const dealer = useBlackjackStore(s => s.dealer)
  const bankChips = useBlackjackStore(s => s.bankChips)
  const config = useBlackjackStore(s => s.config)
  const message = useBlackjackStore(s => s.message)
  const log = useBlackjackStore(s => s.log)
  const activeSeatIndex = useBlackjackStore(s => s.activeSeatIndex)
  const autoPlay = useBlackjackStore(s => s.autoPlay)
  const sessionStats = useBlackjackStore(s => s.sessionStats)
  const lastBankDelta = useBlackjackStore(s => s.lastBankDelta)
  const bankSessionProfit = useBlackjackStore(s => s.bankSessionProfit)
  const accountChips = useBlackjackStore(s => s.accountChips)
  const hydrateWallet = useBlackjackStore(s => s.hydrateWallet)
  const shoe = useBlackjackStore(s => s.shoe)
  const user = useAuthStore(s => s.user)
  const { muted, toggleMuted, playSound } = useBlackjackSounds()

  const humanSeat = getHumanSeat(seats)
  /** 局中优先显示座位实时筹码（下注后会变） */
  const displayChips =
    phase !== 'setup' && config.role === 'player' && humanSeat
      ? humanSeat.chips
      : config.role === 'dealer' && phase !== 'setup'
        ? bankChips
        : accountChips

  const shoeFull = DECK_COUNT * 52
  const shoePct = shoe.length > 0 ? Math.round((shoe.length / shoeFull) * 100) : 0

  useEffect(() => {
    hydrateWallet(user?.id ?? 'guest')
  }, [user?.id, hydrateWallet])

  useBlackjackKeyboard({
    onToggleMute: () => {
      playSound('click')
      toggleMuted()
    },
  })

  if (phase === 'setup') {
    return (
      <div className="space-y-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <Spade className="h-5 w-5" />
              21 点
            </h1>
            <p className="text-muted-foreground mt-0.5 text-xs">
              余额{' '}
              <span
                className={cn(
                  'font-semibold tabular-nums',
                  accountChips < 5
                    ? 'text-red-500'
                    : 'text-amber-600 dark:text-amber-400'
                )}
              >
                {accountChips.toLocaleString()}
              </span>
              {' · '}
              坐庄 / 闲家 · 托管
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Badge
              variant="secondary"
              className="h-8 gap-1 px-2.5 text-sm tabular-nums"
              title="我的账号筹码"
            >
              💰 {accountChips.toLocaleString()}
            </Badge>
            <AutoPlayPanel />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => {
                playSound('click')
                toggleMuted()
              }}
              title={muted ? '开启音效' : '静音'}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <GameRulesDialog title="21 点游戏规则" rules={[...GAME_RULES]} />
          </div>
        </div>
        <SetupScreen />
      </div>
    )
  }

  const hideHole = !dealer.holeRevealed && dealer.cards.length >= 2
  const dealerTotal = displayTotal(dealer.cards, hideHole)
  const latestLog = log[0]
  const dealerBust = dealer.status === 'bust'
  const dealerBj =
    dealer.holeRevealed &&
    dealer.cards.length === 2 &&
    displayTotal(dealer.cards) === '黑杰克'

  return (
    <div className="flex h-[calc(100dvh-var(--app-header-total-height,0px)-0.75rem)] max-h-[100dvh] flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-2 pb-1.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <Spade className="h-4 w-4 shrink-0" />
          <span className="text-sm font-bold">21 点</span>
          <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
            {config.role === 'dealer' ? (
              <span className="flex items-center gap-0.5">
                <Crown className="h-3 w-3 text-amber-500" />
                庄
              </span>
            ) : (
              '闲'
            )}
          </Badge>
          <Badge
            variant="secondary"
            className="h-5 px-1.5 text-[10px] tabular-nums"
            title="我的筹码"
          >
            💰 {displayChips.toLocaleString()}
          </Badge>
          {shoe.length > 0 && (
            <Badge
              variant="outline"
              className="text-muted-foreground h-5 gap-1 px-1.5 text-[10px] tabular-nums"
              title={`牌靴剩余 ${shoe.length}/${shoeFull}`}
            >
              <span className="bg-muted inline-block h-1.5 w-8 overflow-hidden rounded-full">
                <span
                  className="bg-primary block h-full rounded-full transition-all"
                  style={{ width: `${shoePct}%` }}
                />
              </span>
              {shoePct}%
            </Badge>
          )}
          {config.role === 'dealer' && bankSessionProfit !== 0 && (
            <Badge
              className={cn(
                'h-5 px-1.5 text-[10px] tabular-nums',
                bankSessionProfit > 0
                  ? 'bg-emerald-600/90 text-white hover:bg-emerald-600/90'
                  : 'bg-red-600/90 text-white hover:bg-red-600/90'
              )}
              title="本牌桌庄家累计盈亏"
            >
              累计 {bankSessionProfit > 0 ? '+' : ''}
              {bankSessionProfit}
            </Badge>
          )}
          <Badge variant="outline" className="text-muted-foreground h-5 px-1.5 text-[10px]">
            {phaseLabel(phase)}
          </Badge>
          {autoPlay.enabled && (
            <Badge className="h-5 bg-violet-600 px-1.5 text-[10px] text-white hover:bg-violet-600">
              托管 硬≥{autoPlay.hardStandAt}
            </Badge>
          )}
          {autoPlay.autoNextRound && (
            <Badge
              variant="secondary"
              className="h-5 px-1.5 text-[10px]"
              title="结算后自动开下一局"
            >
              自动下局
            </Badge>
          )}
          {(sessionStats.wins > 0 ||
            sessionStats.losses > 0 ||
            sessionStats.pushes > 0) && (
            <Badge
              variant="outline"
              className="text-muted-foreground h-5 max-w-[9rem] truncate px-1.5 text-[10px] tabular-nums"
              title={
                config.role === 'dealer'
                  ? `庄家局数 胜 ${sessionStats.wins} · 负 ${sessionStats.losses} · 平 ${sessionStats.pushes}`
                  : `胜 ${sessionStats.wins} · 负 ${sessionStats.losses} · 平 ${sessionStats.pushes} · BJ ${sessionStats.blackjacks}`
              }
            >
              {sessionStats.wins}W/{sessionStats.losses}L/{sessionStats.pushes}P
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <AutoPlayPanel compact />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              playSound('click')
              toggleMuted()
            }}
            title={muted ? '开启音效' : '静音'}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <GameRulesDialog title="21 点游戏规则" rules={[...GAME_RULES]} />
        </div>
      </header>

      <div
        className={cn(
          'relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem]',
          'border border-emerald-900/30 bg-gradient-to-b from-emerald-700 via-emerald-800 to-emerald-950',
          'shadow-inner'
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,255,255,0.12),transparent_55%)]" />

        {/* 结算闪烁层 */}
        <AnimatePresence>
          {phase === 'round_end' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.35, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-amber-200/20 via-transparent to-transparent"
            />
          )}
        </AnimatePresence>

        {/* 庄家靠上、闲家靠下，中间留出桌面距离 */}
        <div className="relative flex min-h-0 flex-1 flex-col py-3 sm:py-4">
          {/* 庄家 */}
          <motion.div
            layout
            className="flex shrink-0 flex-col items-center gap-1 pt-1 sm:pt-2"
            animate={dealerBust ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }}
            transition={dealerBust ? { duration: 0.45 } : undefined}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-emerald-50/80">
              <Crown className="h-3.5 w-3.5 text-amber-300" />
              庄家
              {config.role === 'dealer' && (
                <span className="rounded bg-amber-400/20 px-1 text-[9px] text-amber-100">你</span>
              )}
              <AnimatePresence mode="wait">
                {dealer.cards.length > 0 && (
                  <motion.span
                    key={dealerTotal}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn(
                      'ml-1 rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums',
                      dealerBust
                        ? 'bg-red-500/30 text-red-100'
                        : dealerBj
                          ? 'bg-amber-400/30 text-amber-50'
                          : 'bg-black/25 text-emerald-50'
                    )}
                  >
                    {dealerTotal}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div className="flex min-h-14 items-end justify-center">
              {dealer.cards.length === 0 ? (
                <span className="text-xs text-emerald-100/40">等待发牌</span>
              ) : (
                <CardFan
                  cards={dealer.cards}
                  hideHoleIndex={hideHole ? 1 : undefined}
                  size="md"
                />
              )}
            </div>

            {/* 坐庄：本局输赢（与闲家结果徽章对齐） */}
            <AnimatePresence>
              {config.role === 'dealer' &&
                phase === 'round_end' &&
                lastBankDelta !== null && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 6 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-1 flex flex-wrap items-center justify-center gap-1.5"
                  >
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums shadow-sm',
                        lastBankDelta > 0
                          ? 'bg-emerald-400/30 text-emerald-50 ring-1 ring-emerald-300/40'
                          : lastBankDelta < 0
                            ? 'bg-red-500/30 text-red-100 ring-1 ring-red-300/40'
                            : 'bg-white/15 text-emerald-50 ring-1 ring-white/20'
                      )}
                    >
                      {lastBankDelta > 0
                        ? `庄家赢 +${lastBankDelta}`
                        : lastBankDelta < 0
                          ? `庄家输 ${lastBankDelta}`
                          : '庄家平局'}
                    </span>
                    {bankSessionProfit !== 0 && (
                      <span className="rounded-full bg-black/25 px-2 py-0.5 text-[10px] tabular-nums text-emerald-100/85">
                        累计 {bankSessionProfit > 0 ? '+' : ''}
                        {bankSessionProfit}
                      </span>
                    )}
                  </motion.div>
                )}
            </AnimatePresence>
          </motion.div>

          {/* 消息：占满中间区域并垂直居中 */}
          <div className="mx-auto flex min-h-12 max-w-[90%] flex-1 items-center justify-center py-4 sm:py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={message}
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="truncate rounded-full bg-black/25 px-3 py-1 text-center text-[11px] text-emerald-50/95"
              >
                {message}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 闲家 */}
          <div className="flex shrink-0 items-end justify-around gap-0.5 px-1 pb-1 sm:px-3 sm:pb-2">
            {seats.map((seat, i) => (
              <PlayerSeat
                key={seat.id}
                seat={seat}
                isActive={phase === 'player_turns' && activeSeatIndex === i}
              />
            ))}
          </div>
        </div>

        {latestLog && (
          <motion.div
            key={latestLog}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative shrink-0 truncate border-t border-white/5 px-3 py-1 text-center text-[10px] text-emerald-100/45"
          >
            {latestLog}
          </motion.div>
        )}
      </div>

      <ActionBar />
    </div>
  )
}

function phaseLabel(phase: string): string {
  switch (phase) {
    case 'betting':
      return '下注'
    case 'dealing':
      return '发牌'
    case 'player_turns':
      return '行动'
    case 'dealer_turn':
      return '庄家'
    case 'settlement':
      return '结算'
    case 'round_end':
      return '结束'
    default:
      return phase
  }
}
