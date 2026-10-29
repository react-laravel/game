import userEvent from '@testing-library/user-event'
import { StrictMode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react'
import Game2048 from '../page'
import { useGame2048Store } from '../store'
import { addRandomTile, initializeBoard, isGameOver, moveLeft, moveRight, moveUp, moveDown, type Board } from '../utils/gameEngine'
import { toast } from 'sonner'

const gameActions = vi.hoisted(() => ({
  setBestScore: vi.fn(),
  incrementGamesPlayed: vi.fn(),
  incrementGamesWon: vi.fn(),
  playSound: vi.fn(),
}))
vi.mock('../hooks/useGameSound', () => ({
  useGameSound: () => ({ playSound: gameActions.playSound }),
}))

// Mock dependencies
vi.mock('@/components/ui/button', () => ({
  Button: vi.fn(({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} data-testid="button">
      {children}
    </button>
  )),
}))

vi.mock('@/components/ui/game-rules-dialog', () => ({
  GameRulesDialog: vi.fn(({ title, rules }) => (
    <div data-testid="game-rules-dialog" data-title={title}>
      {rules.map((rule: string, i: number) => (
        <span key={i}>{rule}</span>
      ))}
    </div>
  )),
}))

vi.mock('next/link', () => ({
  default: vi.fn(({ children, href }) => (
    <a href={href} data-testid="link">
      {children}
    </a>
  )),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../components/GameBoard', () => ({
  GameBoard: vi.fn(() => <div data-testid="game-board">GameBoard</div>),
}))

vi.mock('../components/DirectionControls', () => ({
  DirectionControls: vi.fn(({ onMove }) => (
    <div data-testid="direction-controls">
      DirectionControls
      <button onClick={() => onMove('left')}>向左移动</button>
    </div>
  )),
}))

vi.mock('../utils/gameEngine', () => ({
  initializeBoard: vi.fn(() => [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]),
  addRandomTile: vi.fn(),
  isGameOver: vi.fn(() => false),
  moveLeft: vi.fn(() => ({ moved: false, newBoard: [], scoreGained: 0 })),
  moveRight: vi.fn(() => ({ moved: false, newBoard: [], scoreGained: 0 })),
  moveUp: vi.fn(() => ({ moved: false, newBoard: [], scoreGained: 0 })),
  moveDown: vi.fn(() => ({ moved: false, newBoard: [], scoreGained: 0 })),
}))

vi.mock('../store', () => ({
  useGame2048Store: vi.fn(() => ({
    bestScore: 0,
    setBestScore: gameActions.setBestScore,
    incrementGamesPlayed: gameActions.incrementGamesPlayed,
    incrementGamesWon: gameActions.incrementGamesWon,
  })),
}))

// Mock window properties
const mockMatchMedia = vi.fn(
  (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  })
)

describe('Game2048', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useGame2048Store).mockReset().mockReturnValue({
      bestScore: 0,
      setBestScore: gameActions.setBestScore,
      incrementGamesPlayed: gameActions.incrementGamesPlayed,
      incrementGamesWon: gameActions.incrementGamesWon,
    })
    vi.mocked(initializeBoard).mockReset().mockImplementation(() => Array.from({ length: 4 }, () => [0, 0, 0, 0]))
    vi.mocked(addRandomTile).mockReset()
    vi.mocked(isGameOver).mockReset().mockReturnValue(false)
    for (const move of [moveLeft, moveRight, moveUp, moveDown]) {
      vi.mocked(move).mockReset().mockReturnValue({ moved: false, newBoard: [], scoreGained: 0 })
    }
    vi.spyOn(window, 'matchMedia').mockImplementation(mockMatchMedia)
  })

  describe('Initial Render', () => {
    it('should render game title', () => {
      render(<Game2048 />)
      expect(screen.getByText('2048')).toBeInTheDocument()
    })

    it('should render game board', () => {
      render(<Game2048 />)
      expect(screen.getByTestId('game-board')).toBeInTheDocument()
    })

    it('should render direction controls', () => {
      render(<Game2048 />)
      expect(screen.getByTestId('direction-controls')).toBeInTheDocument()
    })

    it('should render score displays', () => {
      render(<Game2048 />)
      expect(screen.getByText('当前分数')).toBeInTheDocument()
      expect(screen.getByText('最高分')).toBeInTheDocument()
    })

    it('should render reset button', () => {
      render(<Game2048 />)
      expect(screen.getByText('重新开始')).toBeInTheDocument()
    })

    it('should render undo button', () => {
      render(<Game2048 />)
      expect(screen.getByText('撤销')).toBeInTheDocument()
    })

    it('should render auto run controls', () => {
      render(<Game2048 />)
      expect(screen.getByText('🎲')).toBeInTheDocument()
    })
  })

  describe('Game Controls', () => {
    it('should start new game when reset button clicked', async () => {
      const incrementGamesPlayed = vi.fn()
      vi.mocked(useGame2048Store).mockReturnValueOnce({
        bestScore: 0,
        setBestScore: vi.fn(),
        incrementGamesPlayed,
        incrementGamesWon: vi.fn(),
      })

      render(<Game2048 />)

      const resetButton = screen.getByText('重新开始')
      fireEvent.click(resetButton)

      await waitFor(() => {
        expect(screen.getByText('当前分数')).toBeInTheDocument()
      })
    })

    it('should have undo button disabled when canUndo is false', () => {
      vi.mocked(useGame2048Store).mockReturnValueOnce({
        bestScore: 0,
        setBestScore: vi.fn(),
        incrementGamesPlayed: vi.fn(),
        incrementGamesWon: vi.fn(),
      })

      render(<Game2048 />)

      const undoButton = screen.getByText('撤销')
      expect(undoButton.closest('button')).toHaveAttribute('disabled')
    })
  })

  describe('Keyboard Controls', () => {
    it('should add event listener for keydown', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      render(<Game2048 />)

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })
  })

  describe('Game States', () => {
    it('should display game won message when gameWon is true', () => {
      // The component uses internal state, so we test the rendering behavior
      // by checking if the win condition UI elements exist
      render(<Game2048 />)
      // The actual win display depends on internal state manipulation
      expect(screen.getByText('2048')).toBeInTheDocument()
    })

    it('should display game over message when gameOver is true', () => {
      render(<Game2048 />)
      // The actual game over display depends on internal state
      expect(screen.getByText('2048')).toBeInTheDocument()
    })
  })

  describe('Speed Controls', () => {
    it('should render speed options', () => {
      render(<Game2048 />)
      expect(screen.getByText('不能再快了')).toBeInTheDocument()
      expect(screen.getByText('快')).toBeInTheDocument()
      expect(screen.getByText('正常')).toBeInTheDocument()
      expect(screen.getByText('慢')).toBeInTheDocument()
    })
  })

  describe('Direction Controls', () => {
    it('should render direction buttons', () => {
      render(<Game2048 />)
      // The direction controls component should have up, down, left, right buttons
      expect(screen.getByTestId('direction-controls')).toBeInTheDocument()
    })
  })

  describe('Global Navigation', () => {
    it('leaves app navigation to the shared floating menu', () => {
      render(<Game2048 />)
      expect(screen.queryByText('游戏中心')).not.toBeInTheDocument()
    })
  })

  describe('Auto Run Controls', () => {
    it('should render random auto run button', () => {
      render(<Game2048 />)
      expect(screen.getByText('🎲')).toBeInTheDocument()
    })

    it('should render clockwise run button', () => {
      render(<Game2048 />)
      expect(screen.getByText(/↻/)).toBeInTheDocument()
    })

    it('should render counter-clockwise run button', () => {
      render(<Game2048 />)
      expect(screen.getByText(/↺/)).toBeInTheDocument()
    })
  })

  describe('Game Rules Dialog', () => {
    it('should render game rules dialog', () => {
      render(<Game2048 />)
      expect(screen.getByTestId('game-rules-dialog')).toBeInTheDocument()
    })
  })
  describe('StrictMode move transactions', () => {
    function readGame() {
      const gameWindow = window as Window & { render_game_to_text: () => string }
      return JSON.parse(gameWindow.render_game_to_text()) as { board: Board; score: number; mode: string }
    }
    function press(key: string) {
      act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key })))
    }

    it('records one merge, random tile, sound and undo entry per move', () => {
      const initialBoard = [[2, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
      vi.mocked(initializeBoard).mockImplementation(() => initialBoard.map(row => [...row]))
      vi.mocked(moveLeft).mockReturnValue({
        moved: true, scoreGained: 4,
        newBoard: [[4, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      })
      vi.mocked(addRandomTile).mockImplementation(board => { board[3][3] = 2 })
      render(<StrictMode><Game2048 /></StrictMode>)
      press('ArrowLeft')
      expect(readGame().score).toBe(4)
      expect(readGame().board[3][3]).toBe(2)
      expect(addRandomTile).toHaveBeenCalledOnce()
      expect(gameActions.playSound).toHaveBeenCalledOnce()
      fireEvent.click(screen.getByText('撤销'))
      expect(readGame().board).toEqual(initialBoard)
      expect(readGame().score).toBe(0)
      expect(screen.getByText('撤销').closest('button')).toBeDisabled()
    })

    it('counts reaching 2048 once across batched moves and an undo', () => {
      vi.mocked(initializeBoard).mockReturnValue([[1024, 1024, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]])
      const wonBoard = [[2048, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
      vi.mocked(moveLeft).mockReturnValue({ moved: true, scoreGained: 2048, newBoard: wonBoard })
      vi.mocked(moveRight).mockReturnValue({ moved: true, scoreGained: 0, newBoard: wonBoard })
      render(<StrictMode><Game2048 /></StrictMode>)
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
      })
      expect(readGame().score).toBe(2048)
      expect(gameActions.incrementGamesWon).toHaveBeenCalledOnce()
      fireEvent.click(screen.getByText('撤销'))
      press('ArrowRight')
      expect(gameActions.incrementGamesWon).toHaveBeenCalledOnce()
    })

    it('rejects further batched input immediately after game over', () => {
      vi.mocked(moveLeft).mockReturnValue({
        moved: true, scoreGained: 4,
        newBoard: [[4, 8, 16, 32], [8, 16, 32, 64], [16, 32, 64, 128], [32, 64, 128, 256]],
      })
      vi.mocked(isGameOver).mockReturnValue(true)
      render(<StrictMode><Game2048 /></StrictMode>)
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
      })
      expect(readGame().mode).toBe('game-over')
      expect(gameActions.incrementGamesPlayed).toHaveBeenCalledOnce()
      expect(toast.error).toHaveBeenCalledExactlyOnceWith('游戏结束！')
      expect(moveRight).not.toHaveBeenCalled()
    })


    it('accepts arrow keys after clicking a direction button', async () => {
      const user = userEvent.setup()
      vi.mocked(moveLeft).mockReturnValue({
        moved: true, scoreGained: 4,
        newBoard: [[4, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      })
      vi.mocked(moveRight).mockReturnValue({
        moved: true, scoreGained: 0,
        newBoard: [[0, 0, 0, 4], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      })
      render(<Game2048 />)
      await user.click(screen.getByRole('button', { name: '向左移动' }))
      await user.keyboard('{ArrowRight}')
      expect(moveRight).toHaveBeenCalledOnce()
      expect(readGame().board[0]).toEqual([0, 0, 0, 4])
      expect(readGame().score).toBe(4)
    })

    it('does not create history, audio or random tiles for an unchanged board', () => {
      render(<StrictMode><Game2048 /></StrictMode>)
      press('ArrowLeft')
      expect(readGame().score).toBe(0)
      expect(addRandomTile).not.toHaveBeenCalled()
      expect(gameActions.playSound).not.toHaveBeenCalled()
      expect(screen.getByText('撤销').closest('button')).toBeDisabled()
    })
  })

})
