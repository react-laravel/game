'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RotateCcw, Users, Bot, User, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from './stores/game-store'
import { GameStats } from './components/game-stats'
import { GameRulesDialog } from '@/components/ui/game-rules-dialog'
import Link from 'next/link'

const TicTacToe = () => {
  const {
    board,
    currentPlayer,
    winner,
    gameOver,
    gameMode,
    difficulty,
    scores,
    isAiThinking,
    makeMove,
    resetGame,
    resetScores,
    setGameMode,
    setDifficulty,
  } = useGameStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 主游戏区域 */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex w-full items-center justify-between">
                  <div className="text-muted-foreground text-sm">
                    <Link href="/" className="hover:text-foreground transition-colors">
                      游戏中心
                    </Link>
                    <span className="mx-1">{'>'}</span>{' '}
                    <span className="text-foreground font-medium">井字棋</span>
                  </div>
                  <GameRulesDialog
                    title="井字棋游戏规则"
                    rules={[
                      '两名玩家轮流在 3×3 的棋盘上放置标记（X 和 O）',
                      '率先在横、竖或斜线上连成三个标记的玩家获胜',
                      '如果棋盘填满且无人获胜，则为平局',
                      '点击"重新开始"可以开始新一轮游戏',
                      '人机对战模式下，你是 X，AI 是 O',
                      'AI 有三种难度：简单（随机）、中等（混合策略）、困难（最优策略）',
                    ]}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {/* 游戏模式选择 */}
                <div className="mb-6 flex justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={gameMode === 'pvp' ? 'default' : 'outline'}
                      onClick={() => setGameMode('pvp')}
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      双人对战
                    </Button>
                    <Button
                      variant={gameMode === 'ai' ? 'default' : 'outline'}
                      onClick={() => setGameMode('ai')}
                      className="flex items-center gap-2"
                    >
                      <Bot className="h-4 w-4" />
                      人机对战
                    </Button>
                  </div>
                </div>

                {/* AI 难度选择 */}
                {gameMode === 'ai' && (
                  <div className="mb-6 flex justify-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">AI 难度:</span>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">简单</SelectItem>
                          <SelectItem value="medium">中等</SelectItem>
                          <SelectItem value="hard">困难</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* 分数显示 */}
                <div className="mb-6 flex justify-center gap-4">
                  <Badge variant="outline" className="px-4 py-2 text-lg">
                    <User className="mr-2 h-4 w-4" />
                    X: {scores.X}
                  </Badge>
                  <Badge variant="outline" className="px-4 py-2 text-lg">
                    平局: {scores.draws}
                  </Badge>
                  <Badge variant="outline" className="px-4 py-2 text-lg">
                    {gameMode === 'ai' ? (
                      <Bot className="mr-2 h-4 w-4" />
                    ) : (
                      <User className="mr-2 h-4 w-4" />
                    )}
                    O: {scores.O}
                  </Badge>
                </div>

                {/* 游戏状态 */}
                <div className="mb-6 text-center">
                  <AnimatePresence mode="wait">
                    {isAiThinking ? (
                      <motion.div
                        key="thinking"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center justify-center gap-2 text-xl text-emerald-600 dark:text-emerald-400"
                      >
                        <Loader2 className="h-5 w-5 animate-spin" />
                        AI 思考中...
                      </motion.div>
                    ) : winner ? (
                      <motion.div
                        key="winner"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-2xl font-bold text-green-600"
                      >
                        🎉 {gameMode === 'ai' && winner === 'O' ? 'AI' : `玩家 ${winner}`} 获胜！
                      </motion.div>
                    ) : gameOver ? (
                      <motion.div
                        key="draw"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-2xl font-bold text-yellow-600"
                      >
                        🤝 平局！
                      </motion.div>
                    ) : (
                      <motion.div
                        key="current"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="text-xl text-gray-700 dark:text-gray-200"
                      >
                        当前玩家:{' '}
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {gameMode === 'ai' && currentPlayer === 'O'
                            ? 'AI (O)'
                            : `${currentPlayer}`}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 游戏棋盘 */}
                <div className="mx-auto mb-6 grid max-w-xs grid-cols-3 gap-2">
                  {board.map((cell, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: cell ? 1 : 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => makeMove(index)}
                      className={`aspect-square rounded-lg border-2 border-gray-300 bg-white text-4xl font-bold transition-all duration-200 hover:border-emerald-400 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:hover:border-emerald-500 ${cell ? 'cursor-default' : 'cursor-pointer'} ${cell === 'X' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'} ${isAiThinking && gameMode === 'ai' ? 'pointer-events-none opacity-50' : ''} `}
                      disabled={!!cell || gameOver || isAiThinking}
                    >
                      <AnimatePresence>
                        {cell && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          >
                            {cell}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                </div>

                {/* 控制按钮 */}
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={resetGame}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={isAiThinking}
                  >
                    <RotateCcw className="h-4 w-4" />
                    重新开始
                  </Button>
                  <Button
                    onClick={resetScores}
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    disabled={isAiThinking}
                  >
                    重置分数
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏统计 */}
          <div className="lg:col-span-1">
            <GameStats />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicTacToe
