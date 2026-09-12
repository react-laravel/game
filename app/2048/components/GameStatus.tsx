interface GameStatusProps {
  gameWon: boolean
  gameOver: boolean
  score: number
}

export function GameStatus({ gameWon, gameOver, score }: GameStatusProps) {
  return (
    <>
      {gameWon && (
        <div className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/15 p-4 text-center">
          <div className="font-bold text-emerald-800 dark:text-emerald-200">
            🎉 恭喜！你达到了2048！
          </div>
          <div className="text-sm text-emerald-700 dark:text-emerald-300">继续游戏挑战更高分数</div>
        </div>
      )}
      {gameOver && (
        <div className="mb-4 rounded-2xl border border-rose-400/30 bg-rose-500/15 p-4 text-center">
          <div className="font-bold text-rose-800 dark:text-rose-200">游戏结束</div>
          <div className="text-sm text-rose-700 dark:text-rose-300">最终分数: {score}</div>
        </div>
      )}
    </>
  )
}
