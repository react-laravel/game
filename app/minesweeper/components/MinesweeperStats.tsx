interface MinesweeperStatsProps {
  gamesPlayed: number
  gamesWon: number
  bestTime: number
}

export function MinesweeperStats({ gamesPlayed, gamesWon, bestTime }: MinesweeperStatsProps) {
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0

  return (
    <div className="text-muted-foreground text-xs">
      <div className="flex justify-center gap-8">
        <div className="text-center">
          <div>游戏: {gamesPlayed}</div>
          <div>胜利: {gamesWon}</div>
        </div>
        <div className="text-center">胜率: {winRate}%</div>
        <div className="text-center">最佳: {bestTime > 0 ? `${bestTime}s` : '-'}</div>
      </div>
    </div>
  )
}
