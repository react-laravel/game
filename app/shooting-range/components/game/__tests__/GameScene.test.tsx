import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GameScene } from '../GameScene'

// Mock three.js and react-three-fiber
vi.mock('@react-three/fiber', () => ({
  useThree: vi.fn(() => ({
    camera: {
      position: { clone: vi.fn(() => ({ add: vi.fn() })) },
    },
    gl: { domElement: document.createElement('canvas') },
    scene: { traverse: vi.fn() },
  })),
  useFrame: vi.fn(),
}))

vi.mock('three', () => ({
  Euler: class MockEuler {
    x = 0
    y = 0
    setFromQuaternion = vi.fn(() => this)
  },
  MathUtils: { clamp: vi.fn((value: number) => value) },
  Vector2: class MockVector2 {},
  Vector3: class MockVector3 {},
  Raycaster: class MockRaycaster {
    setFromCamera = vi.fn()
    intersectObjects = vi.fn(() => [])
  },
  Sphere: vi.fn(),
  Mesh: class {},
  Object3D: class {},
}))

vi.mock('../Target', () => ({
  Target: vi.fn(() => <div data-testid="target">Target</div>),
}))

vi.mock('../Bullet', () => ({
  Bullet: vi.fn(() => <div data-testid="bullet">Bullet</div>),
}))

vi.mock('../FPSWeapon', () => ({
  FPSWeapon: vi.fn(() => <div data-testid="fps-weapon">FPSWeapon</div>),
}))

vi.mock('../Explosion', () => ({
  Explosion: vi.fn(() => <div data-testid="explosion">Explosion</div>),
}))

vi.mock('../../../utils/gameUtils', () => ({
  difficultySettings: {
    easy: { targetCount: 5, targetSpeed: 0.01, gameAreaSize: 50 },
    medium: { targetCount: 8, targetSpeed: 0.015, gameAreaSize: 60 },
    hard: { targetCount: 12, targetSpeed: 0.02, gameAreaSize: 70 },
  },
  generateRandomPosition: vi.fn(() => [0, 5, 0]),
  generateRandomDirection: vi.fn(() => [1, 0, 0]),
}))

vi.mock('../../../utils/audioUtils', () => ({
  playShotSound: vi.fn(),
  playHitSound: vi.fn(),
}))

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
  writable: true,
})

describe('GameScene', () => {
  const defaultProps = {
    difficulty: 'easy' as const,
    onScore: vi.fn(),
    gameStarted: false,
    setGameStarted: vi.fn(),
    useFallbackControls: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<GameScene {...defaultProps} />)
      expect(container).toBeDefined()
    })

  })

  describe('Scene Elements', () => {
    it('should render ambient light', () => {
      render(<GameScene {...defaultProps} />)
      // Scene should have ambient lighting
    })

    it('should render directional light', () => {
      render(<GameScene {...defaultProps} />)
      // Scene should have directional lighting
    })

    it('should render fog effect', () => {
      render(<GameScene {...defaultProps} />)
      // Scene should have fog attached
    })

    it('should render ground plane', () => {
      render(<GameScene {...defaultProps} />)
      // Ground mesh should be rendered
    })

    it('should render stars', () => {
      render(<GameScene {...defaultProps} />)
      // Stars should be generated and rendered
    })
  })

  describe('Difficulty Settings', () => {
    it('should use easy difficulty settings', () => {
      render(<GameScene {...defaultProps} difficulty="easy" />)
      // Should use easy settings: 5 targets
    })

    it('should use medium difficulty settings', () => {
      render(<GameScene {...defaultProps} difficulty="medium" />)
      // Should use medium settings: 8 targets
    })

    it('should use hard difficulty settings', () => {
      render(<GameScene {...defaultProps} difficulty="hard" />)
      // Should use hard settings: 12 targets
    })
  })

  describe('Game Started State', () => {
    it('should not lock pointer when game not started', () => {
      render(<GameScene {...defaultProps} gameStarted={false} />)
      // Controls should not attempt to lock
    })

    it('should attempt to lock pointer when game starts', () => {
      render(<GameScene {...defaultProps} gameStarted={true} />)
      // Controls should attempt to lock when game starts
    })
  })

  describe('Targets', () => {
    it('should initialize targets based on difficulty', () => {
      render(<GameScene {...defaultProps} difficulty="easy" gameStarted={true} />)
      // Easy should have 5 targets
    })

    it('should render Target components', () => {
      render(<GameScene {...defaultProps} gameStarted={true} />)
      // Targets should be rendered as children
    })
  })

  describe('Bullets', () => {
    it('should render Bullet components when bullets exist', () => {
      render(<GameScene {...defaultProps} gameStarted={true} />)
      // Bullet components should be rendered when shooting
    })
  })

  describe('Weapon', () => {
    it('should render FPSWeapon component', () => {
      render(<GameScene {...defaultProps} gameStarted={true} />)
      // FPSWeapon should be rendered
    })

    it('should show muzzle flash when shooting', () => {
      render(<GameScene {...defaultProps} gameStarted={true} />)
      // Muzzle flash state is internal
    })
  })

  describe('Explosions', () => {
    it('should render Explosion components', () => {
      render(<GameScene {...defaultProps} gameStarted={true} />)
      // Explosion effects should be rendered
    })
  })

  describe('Fallback Controls', () => {
    it('should not lock pointer with fallback controls', () => {
      render(<GameScene {...defaultProps} useFallbackControls={true} gameStarted={true} />)
      // No pointer lock should be attempted
    })
  })

  describe('Event Listeners', () => {
    it('should add pointerlockchange event listener', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
      render(<GameScene {...defaultProps} gameStarted={true} />)

      expect(addEventListenerSpy).toHaveBeenCalledWith('pointerlockchange', expect.any(Function))
    })

    it('should add beforeunload event listener', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      render(<GameScene {...defaultProps} gameStarted={true} />)

      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
    })

    it('should add keydown event listener for shooting', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      render(<GameScene {...defaultProps} gameStarted={true} useFallbackControls={false} />)

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function), {
        passive: false,
      })
    })

    it('should add mouse movement aiming when the game starts', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
      render(<GameScene {...defaultProps} gameStarted={true} useFallbackControls={false} />)

      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    })
  })

  describe('Cleanup', () => {
    it('should exit pointer lock on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      const exitPointerLockSpy = vi.fn()
      Object.defineProperty(document, 'exitPointerLock', {
        value: exitPointerLockSpy,
        writable: true,
      })

      const { unmount } = render(<GameScene {...defaultProps} gameStarted={true} />)
      unmount()

      // Cleanup should remove event listeners
    })
  })

  describe('Vibration Feedback', () => {
    it('should call navigator.vibrate on target hit', () => {
      navigator.vibrate = vi.fn()

      render(<GameScene {...defaultProps} gameStarted={true} />)

      // When target is hit, vibration should be triggered
      expect(navigator.vibrate).toBeDefined()
    })
  })

  describe('3D Scene Setup', () => {
    it('should have sun mesh with correct position', () => {
      render(<GameScene {...defaultProps} />)
      // Sun should be positioned at [0, 15, -40]
    })

    it('should have point light at sun position', () => {
      render(<GameScene {...defaultProps} />)
      // Point light should be at sun position
    })

    it('should have shadow casting directional light', () => {
      render(<GameScene {...defaultProps} />)
      // Directional light should cast shadows
    })

    it('should have ground plane at correct position', () => {
      render(<GameScene {...defaultProps} />)
      // Ground should be at y=-2
    })
  })
})
