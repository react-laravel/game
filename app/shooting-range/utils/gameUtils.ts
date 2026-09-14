import type { ShootingMapId, SpawnPattern } from '../types'
import { INDOOR_TARGET_MAX_Y, WAREHOUSE_TARGET_MAX_Y } from './indoorCeiling'

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

/** Uniform plate size so a static wall reads as one range rack. */
export const WALL_TARGET_SCALE = 0.62
/** Local-space radius of the circular plate mesh (before scale). */
export const WALL_PLATE_RADIUS = 1.05

const WALL_COLS = 4
const WALL_BASE_Y = 2.25
const WALL_Z = -14.2

export const TARGET_OPEN_MAX_Y = 9

export function roofMaxYForMap(mapId: ShootingMapId): number {
  if (mapId === 'indoor') return INDOOR_TARGET_MAX_Y
  if (mapId === 'warehouse') return WAREHOUSE_TARGET_MAX_Y
  return Number.POSITIVE_INFINITY
}

export function targetTravelMaxY(gameAreaSize: number, roofMaxY = TARGET_OPEN_MAX_Y): number {
  return Math.min(TARGET_OPEN_MAX_Y, gameAreaSize * 0.42 + 2, roofMaxY)
}

/**
 * Static precision wall — one depth so a closer lower plate cannot eat a shot
 * aimed at the row above it.
 */
export function generateWallPosition(
  id: number,
  gameAreaSize: number,
  maxY = TARGET_OPEN_MAX_Y
): [number, number, number] {
  const row = Math.floor(id / WALL_COLS)
  const col = id % WALL_COLS
  const xSpread = gameAreaSize * 0.5
  const x = (col / Math.max(1, WALL_COLS - 1) - 0.5) * xSpread
  const topY = Math.max(WALL_BASE_Y, maxY)
  const rowSpan = Math.max(0.9, (topY - WALL_BASE_Y) / 3)
  const y = WALL_BASE_Y + row * rowSpan
  return [x, y, WALL_Z]
}

export function nextGridPosition(maxY = TARGET_OPEN_MAX_Y): [number, number, number] {
  const position = GRID_POSITIONS[gridSpawnIndex % GRID_POSITIONS.length]
  gridSpawnIndex += 1
  return [position[0], Math.min(position[1], maxY), position[2]]
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
export const generateRandomPosition = (
  gameAreaSize: number,
  maxY = targetTravelMaxY(gameAreaSize)
): [number, number, number] => {
  const minY = 0.8
  return [
    (Math.random() - 0.5) * gameAreaSize * 0.78,
    minY + Math.random() * Math.max(0.1, maxY - minY),
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
  spawnPattern: SpawnPattern = 'random',
  targetId?: number,
  maxY = targetTravelMaxY(gameAreaSize)
) {
  const [x, y, z] =
    spawnPattern === 'grid'
      ? nextGridPosition(maxY)
      : spawnPattern === 'wall' && typeof targetId === 'number'
        ? generateWallPosition(targetId, gameAreaSize, maxY)
        : generateRandomPosition(gameAreaSize, maxY)
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
