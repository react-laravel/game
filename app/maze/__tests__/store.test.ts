import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act } from '@testing-library/react'
import { DEFAULT_MAZE_SHAPE, DEFAULT_MAZE_SIZE } from '../constants'
import { useMazeStore, type MazeCell } from '../store'

describe('maze game store', () => {
  beforeEach(() => {
    useMazeStore.setState({ mazeSize: DEFAULT_MAZE_SIZE, mazeShape: DEFAULT_MAZE_SHAPE })
    useMazeStore.getState().resetGame()
  })

  afterEach(() => {
    useMazeStore.setState({ mazeSize: DEFAULT_MAZE_SIZE, mazeShape: DEFAULT_MAZE_SHAPE })
    useMazeStore.getState().resetGame()
  })

  describe('initial state', () => {
    it('should have correct default values', () => {
      const state = useMazeStore.getState()
      expect(state.gameStarted).toBe(false)
      expect(state.gameCompleted).toBe(false)
      expect(state.gameTime).toBe(0)
      expect(state.moves).toBe(0)
      expect(state.mazeSize).toBe(15)
      expect(state.mazeShape).toBe('square')
      expect(state.maze).toEqual([])
      expect(state.ball).toEqual({ x: 0, y: 0, z: 0 })
      expect(state.isMoving).toBe(false)
      expect(state.autoPath).toEqual([])
      expect(state.isAutoMoving).toBe(false)
      expect(state.autoMoveInterrupt).toBe(false)
    })
  })

  describe('resetGame', () => {
    it('should reset all state to initial values', () => {
      // First set some state
      useMazeStore.setState({
        gameStarted: true,
        gameCompleted: true,
        gameTime: 120,
        moves: 50,
        isMoving: true,
        autoPath: [{ x: 1, y: 1 }],
        isAutoMoving: true,
        autoMoveInterrupt: true,
      })

      act(() => {
        useMazeStore.getState().resetGame()
      })

      const state = useMazeStore.getState()
      expect(state.gameStarted).toBe(false)
      expect(state.gameCompleted).toBe(false)
      expect(state.gameTime).toBe(0)
      expect(state.moves).toBe(0)
      expect(state.isMoving).toBe(false)
      expect(state.autoPath).toEqual([])
      expect(state.isAutoMoving).toBe(false)
      expect(state.autoMoveInterrupt).toBe(false)
      expect(state.maze).toEqual([])
    })
  })

  describe('generateMaze', () => {
    it('should generate a maze with correct dimensions', () => {
      act(() => {
        useMazeStore.getState().generateMaze()
      })

      const { maze, mazeSize } = useMazeStore.getState()
      expect(maze).toHaveLength(mazeSize)
      expect(maze[0]).toHaveLength(mazeSize)
    })

    it('should generate an A4 maze that is taller than it is wide', () => {
      act(() => {
        useMazeStore.getState().setMazeShape('a4')
      })

      const { maze, mazeSize, mazeShape } = useMazeStore.getState()
      expect(mazeShape).toBe('a4')
      expect(mazeSize).toBe(15)
      expect(maze[0]).toHaveLength(15)
      expect(maze).toHaveLength(21)
    })

    it('should generate cells with all wall properties', () => {
      act(() => {
        useMazeStore.getState().generateMaze()
      })

      const { maze } = useMazeStore.getState()
      const cell = maze[0][0]
      expect(cell).toHaveProperty('top')
      expect(cell).toHaveProperty('right')
      expect(cell).toHaveProperty('bottom')
      expect(cell).toHaveProperty('left')
      expect(cell).toHaveProperty('visited')
    })

    it('should mark cells as visited', () => {
      act(() => {
        useMazeStore.getState().generateMaze()
      })

      const { maze } = useMazeStore.getState()
      const visitedCount = maze.flat().filter(cell => cell.visited).length
      expect(visitedCount).toBe(maze.length * maze[0].length)
    })

    it('should include dead-end cells', () => {
      act(() => {
        useMazeStore.getState().generateMaze()
      })

      const { maze } = useMazeStore.getState()
      const deadEnds = maze.flat().filter(cell => {
        const openings =
          Number(!cell.top) + Number(!cell.right) + Number(!cell.bottom) + Number(!cell.left)
        return openings === 1
      }).length

      expect(deadEnds).toBeGreaterThan(0)
    })

    it('should produce a valid maze (not all walls intact)', () => {
      act(() => {
        useMazeStore.getState().generateMaze()
      })

      const { maze } = useMazeStore.getState()
      // Count walls that are false (open passages)
      let openPassages = 0
      for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
          const cell = maze[y][x]
          if (!cell.top) openPassages++
          if (!cell.right) openPassages++
          if (!cell.bottom) openPassages++
          if (!cell.left) openPassages++
        }
      }
      // A valid maze must have some open passages
      expect(openPassages).toBeGreaterThan(0)
    })
  })

  describe('moveBall', () => {
    it('should not move when maze is empty', () => {
      const store = useMazeStore.getState()
      act(() => {
        store.moveBall('right')
      })
      expect(useMazeStore.getState().ball).toEqual({ x: 0, y: 0, z: 0 })
    })

    it('should not move when game is completed', () => {
      // Setup a minimal maze
      const cell: MazeCell = { top: true, right: true, bottom: false, left: true, visited: true }
      useMazeStore.setState({
        maze: Array(3)
          .fill(null)
          .map(() =>
            Array(3)
              .fill(null)
              .map(() => ({ ...cell }))
          ),
        mazeSize: 3,
        gameStarted: true,
        gameCompleted: true,
      })

      const store = useMazeStore.getState()
      const initialBall = { ...store.ball }
      act(() => {
        store.moveBall('down')
      })
      expect(useMazeStore.getState().ball).toEqual(initialBall)
    })

    it('should increment moves on valid move', () => {
      // Setup a maze with open path
      const cell: MazeCell = { top: true, right: false, bottom: true, left: true, visited: true }
      useMazeStore.setState({
        maze: [[cell]],
        mazeSize: 1,
        gameStarted: true,
      })

      const store = useMazeStore.getState()
      act(() => {
        store.moveBall('right')
      })
      expect(useMazeStore.getState().moves).toBe(1)
    })
  })

  describe('moveToPosition', () => {
    it('should not move when maze is empty', () => {
      act(() => {
        useMazeStore.getState().moveToPosition(5, 5)
      })
      expect(useMazeStore.getState().ball).toEqual({ x: 0, y: 0, z: 0 })
    })

    it('should not move when at target position', () => {
      const cell: MazeCell = { top: true, right: true, bottom: true, left: true, visited: true }
      useMazeStore.setState({
        maze: [[cell]],
        mazeSize: 1,
        gameStarted: true,
      })

      act(() => {
        useMazeStore.getState().moveToPosition(0, 0)
      })
      // Should not start auto-move since already at target
      expect(useMazeStore.getState().isAutoMoving).toBe(false)
    })
  })

  describe('interruptAutoMove', () => {
    it('should set autoMoveInterrupt flag', () => {
      act(() => {
        useMazeStore.getState().interruptAutoMove()
      })
      expect(useMazeStore.getState().autoMoveInterrupt).toBe(true)
    })
  })

  describe('startGame', () => {
    it('should not start if already started', () => {
      useMazeStore.setState({ gameStarted: true })
      const initialMaze = useMazeStore.getState().maze

      act(() => {
        useMazeStore.getState().startGame()
      })

      // Should not regenerate maze
      expect(useMazeStore.getState().maze).toBe(initialMaze)
    })
  })

  describe('setMazeSize', () => {
    it('changes maze size and generates a matching maze', () => {
      act(() => {
        useMazeStore.getState().setMazeSize(21)
      })

      const { maze, mazeSize, gameStarted, ball, moves } = useMazeStore.getState()
      expect(mazeSize).toBe(21)
      expect(gameStarted).toBe(true)
      expect(maze).toHaveLength(21)
      expect(maze[0]).toHaveLength(21)
      expect(ball).toEqual({ x: 0, y: 0, z: 0 })
      expect(moves).toBe(0)
    })

    it('clamps oversized values and skips regenerating the same size', () => {
      act(() => {
        useMazeStore.getState().setMazeSize(40)
      })
      const maze = useMazeStore.getState().maze

      act(() => {
        useMazeStore.getState().setMazeSize(99)
      })

      expect(useMazeStore.getState().mazeSize).toBe(40)
      expect(useMazeStore.getState().maze).toBe(maze)
    })
  })

  describe('setMazeShape', () => {
    it('switches to an A4 rectangle without changing the slider size', () => {
      act(() => {
        useMazeStore.getState().setMazeSize(11)
      })
      act(() => {
        useMazeStore.getState().setMazeShape('a4')
      })

      const { maze, mazeSize, mazeShape } = useMazeStore.getState()
      expect(mazeShape).toBe('a4')
      expect(mazeSize).toBe(11)
      expect(maze[0]).toHaveLength(11)
      expect(maze).toHaveLength(16)
    })

    it('keeps the selected shape after reset', () => {
      act(() => {
        useMazeStore.getState().setMazeShape('a4')
      })
      act(() => {
        useMazeStore.getState().resetGame()
      })

      expect(useMazeStore.getState().mazeShape).toBe('a4')
      expect(useMazeStore.getState().mazeSize).toBe(15)
    })
  })
})
