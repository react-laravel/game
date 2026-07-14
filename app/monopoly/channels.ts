/**
 * Monopoly 大厅是公共频道，房间状态只通过需鉴权的私有频道广播。
 */
export function getMonopolyLobbyChannel<T>(echo: { channel(name: string): T }): T {
  return echo.channel('monopoly.lobby')
}

export function getMonopolyRoomChannel<T>(
  echo: { private(name: string): T },
  roomId: number
): T {
  return echo.private(`monopoly.room.${roomId}`)
}
