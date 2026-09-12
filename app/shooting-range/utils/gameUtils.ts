import type { SpawnPattern } from '../types'

/**
 * 游戏工具函数
 */

const GRID_POSITIONS: Array<[number, number, number]> = [
  [-7, 4.5, -16], [0, 5.5, -18], [7, 4.5, -16],
  [-5, 7.5, -22], [5, 7.5, -22],
  [-8, 3.2, -24], [8, 3.2, -24],
  [0, 8.5, -26], [-4, 6, -20], [4, 6, -20],
]

let gridSpawnIndex = 0

export function nextGridPosition(): [number, number, number] {
  const position = GRID_POSITIONS[gridSpawnIndex % GRID_POSITIONS.length]
  gridSpawnIndex += 1
  return position
}

export function resetGridSpawnIndex() {
  gridSpawnIndex = 0
}

/**
 * 检查游戏是否结束
 */
export const isGameOver = (): boolean => {
  // 游戏结束逻辑（如果需要）
  return false
}

/**
 * 生成随机位置
 */
export const generateRandomPosition = (gameAreaSize: number): [number, number, number] => {
  return [
    (Math.random() - 0.5) * gameAreaSize * 0.78,
    Math.random() * Math.max(0.1, gameAreaSize / 4 + 1.2) + 0.8,
    -(Math.random() * gameAreaSize + 8),
  ]
}

/**
 * 生成随机方向并归一化
 */
export const generateRandomDirection = (): [number, number, number] => {
  const direction: [number, number, number] = [
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2,
  ]

  const length = Math.sqrt(direction[0] ** 2 + direction[1] ** 2 + direction[2] ** 2)
  return [direction[0] / length, direction[1] / length, direction[2] / length]
}

interface MutableVec3 {
  x: number
  y: number
  z: number
  set: (x: number, y: number, z: number) => unknown
}

export interface TargetRuntime {
  userData: {
    hit?: boolean
    direction?: MutableVec3
    spawnedAt?: number
    orbitAnchor?: MutableVec3
  }
  position: MutableVec3
}

export function markTargetSpawned(target: TargetRuntime) {
  target.userData.spawnedAt = performance.now()
}

export function applyTargetHit(target: TargetRuntime) {
  target.userData.hit = true
}

export function respawnTarget(
  target: TargetRuntime,
  gameAreaSize: number,
  spawnPattern: SpawnPattern = 'random'
) {
  const [x, y, z] =
    spawnPattern === 'grid' ? nextGridPosition() : generateRandomPosition(gameAreaSize)
  target.position.set(x, y, z)
  target.userData.orbitAnchor?.set(x, y, z)
  target.userData.hit = false
  markTargetSpawned(target)
  const direction = target.userData.direction
  if (!direction) return
  const [dx, dy, dz] = generateRandomDirection()
  direction.set(dx, dy, dz)
}

/**
 * 难度设置配置
 */
export const difficultySettings = {
  easy: { targetCount: 8, targetSpeed: 0.01, gameAreaSize: 20 },
  medium: { targetCount: 12, targetSpeed: 0.02, gameAreaSize: 25 },
  hard: { targetCount: 16, targetSpeed: 0.05, gameAreaSize: 30 },
}
