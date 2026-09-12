'use client'

import { Button } from '@/components/ui/button'
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
import { GameHud, GameResultOverlay, GameStage } from '@/components/game'

const TIC_TAC_TOE_RULES = [
  '两名玩家轮流在 3×3 的棋盘上放置标记（X 和 O）',
  '率先在横、竖或斜线上连成三个标记的玩家获胜',
  '如果棋盘填满且无人获胜，则为平局',
  '点击"重新开始"可以开始新一轮游戏',
  '人机对战模式下，你是 X，AI 是 O',
  'AI 有三种难度：简单（随机）、中等（混合策略）、困难（最优策略）',
]

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

  const resultTitle = winner
    ? `${gameMode === 'ai' && winner === 'O' ? 'AI' : `玩家 ${winner}`} 获胜！`
    : '平局！'

  return (
    <GameStage title="井字棋" rules={TIC_TAC_TOE_RULES} fill>
      <div className="mx-auto grid min-h-0 w-full max-w-6xl flex-1 gap-6 lg:grid-cols-3">
        <div className="relative flex min-h-0 flex-col justify-center lg:col-span-2">
          <GameHud className="flex flex-col items-center">
            <div className="mb-5 flex justify-center gap-3">
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

            {gameMode === 'ai' && (
              <div className="mb-5 flex justify-center">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">AI 难度:</span>
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

            <div className="mb-5 flex justify-center gap-4">
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

            <div className="mb-5 text-center">
              <AnimatePresence mode="wait">
                {isAiThinking ? (
                  <motion.div
                    key="thinking"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-primary flex items-center justify-center gap-2 text-xl"
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
                    className="text-2xl font-bold text-emerald-600"
                  >
                    🎉 {gameMode === 'ai' && winner === 'O' ? 'AI' : `玩家 ${winner}`} 获胜！
                  </motion.div>
                ) : gameOver ? (
                  <motion.div
                    key="draw"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-2xl font-bold text-amber-600"
                  >
                    🤝 平局！
                  </motion.div>
                ) : (
                  <motion.div
                    key="current"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-muted-foreground text-xl"
                  >
                    当前玩家:{' '}
                    <span className="text-primary font-bold">
                      {gameMode === 'ai' && currentPlayer === 'O' ? 'AI (O)' : `${currentPlayer}`}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mx-auto mb-6 grid w-full max-w-sm shrink-0 grid-cols-3 gap-3">
              {board.map((cell, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: cell ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => makeMove(index)}
                  className={`aspect-square rounded-2xl border-2 border-border bg-card text-4xl font-black shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md ${cell ? 'cursor-default' : 'cursor-pointer'} ${cell === 'X' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} ${isAiThinking && gameMode === 'ai' ? 'pointer-events-none opacity-50' : ''} `}
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
          </GameHud>
          <GameResultOverlay
            open={!!winner || (!!gameOver && !winner)}
            eyebrow={winner ? 'Winner' : 'Draw'}
            title={resultTitle}
          >
            <Button
              className="mt-6 w-full bg-amber-400 py-5 font-bold text-zinc-950 hover:bg-amber-300"
              onClick={resetGame}
              disabled={isAiThinking}
            >
              重新开始
            </Button>
          </GameResultOverlay>
        </div>

        <div className="lg:col-span-1">
          <GameStats />
        </div>
      </div>
    </GameStage>
  )
}

export default TicTacToe
