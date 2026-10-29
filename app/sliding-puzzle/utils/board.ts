export function createSolvedBoard(size: number): number[] {
  return Array.from({ length: size * size }, (_, index) =>
    index === size * size - 1 ? 0 : index + 1
  )
}

export function isSolved(board: number[]): boolean {
  return board.length > 0 && board.every((tile, index) =>
    tile === (index === board.length - 1 ? 0 : index + 1)
  )
}

export function checkSolvable(board: number[], size: number): boolean {
  if (!Number.isInteger(size) || size < 1 || board.length !== size * size) return false
  if (new Set(board).size !== board.length || board.some(tile =>
    !Number.isInteger(tile) || tile < 0 || tile >= board.length
  )) return false

  let inversions = 0
  for (let i = 0; i < board.length; i++) {
    if (board[i] === 0) continue
    for (let j = i + 1; j < board.length; j++) {
      if (board[j] !== 0 && board[i] > board[j]) inversions++
    }
  }

  if (size % 2 === 1) return inversions % 2 === 0
  // Count the blank's row from the bottom starting at one.
  const emptyRowFromBottom = size - Math.floor(board.indexOf(0) / size)
  return (inversions + emptyRowFromBottom) % 2 === 1
}

export function isValidMove(index: number, board: number[], size: number): boolean {
  const emptyIndex = board.indexOf(0)
  if (!Number.isInteger(index) || index < 0 || index >= board.length || emptyIndex < 0) return false
  return (
    (Math.floor(index / size) === Math.floor(emptyIndex / size) && Math.abs(index - emptyIndex) === 1) ||
    (index % size === emptyIndex % size && Math.abs(index - emptyIndex) === size)
  )
}

export function createBoard(size: number, random: () => number = Math.random): number[] {
  const board = createSolvedBoard(size)
  for (let i = board.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[board[i], board[j]] = [board[j], board[i]]
  }

  // Swapping two numbered tiles fixes parity without a retry limit.
  if (!checkSolvable(board, size)) {
    const first = board.findIndex(tile => tile !== 0)
    const second = board.findIndex((tile, index) => index > first && tile !== 0)
    ;[board[first], board[second]] = [board[second], board[first]]
  }
  // A legal move from the goal keeps the board solvable and starts a real game.
  if (board.length > 1 && isSolved(board)) {
    const last = board.length - 1
    ;[board[last - 1], board[last]] = [board[last], board[last - 1]]
  }
  return board
}
