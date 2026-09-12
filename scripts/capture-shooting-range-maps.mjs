import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3002'
const OUT_DIR =
  process.env.OUT_DIR ?? path.join(process.cwd(), 'docs/shooting-range-screenshots')

const MAPS = [
  { label: '室内靶场', id: 'indoor' },
  { label: '户外靶场', id: 'outdoor' },
  { label: '工业仓库', id: 'warehouse' },
]

async function mockAuth(page) {
  await page.route('**/api/user', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { id: 1, name: 'Test', email: 't@t.com', is_admin: false, permissions: [] },
      }),
    })
  })
  await page.route('**/api/auth/csrf', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { token: 'test' } }),
    })
  })
}

async function enterFallbackPlay(page) {
  await page.locator('canvas').first().waitFor({ state: 'attached', timeout: 20000 })
  await page.waitForTimeout(800)
  const startBtn = page.getByRole('button', { name: /锁定鼠标并开始|点击开始/ })
  if (await startBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    await startBtn.click()
    await page.waitForTimeout(800)
  }
  const fallback = page.getByRole('button', { name: '点击目标模式' })
  if (await fallback.isVisible({ timeout: 4000 }).catch(() => false)) {
    await fallback.click()
    await page.waitForTimeout(500)
  }
  await page.waitForTimeout(5000)
}

async function captureSetup(page, filePath) {
  await page.goto(`${BASE_URL}/shooting-range`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=选择训练项目')
  await page.screenshot({ path: filePath, fullPage: true })
}

async function captureTrainingHud(page, filePath) {
  await page.screenshot({ path: filePath, fullPage: false })
}

async function captureCustomMapTraining(page, mapLabel, filePath) {
  await page.goto(`${BASE_URL}/shooting-range`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=选择训练项目')
  await page.getByRole('button', { name: /自定义场景与难度/ }).click()
  await page.locator('button', { hasText: mapLabel }).first().click()
  await page.getByRole('button', { name: /按当前设置开始/ }).click()
  await enterFallbackPlay(page)
  await captureTrainingHud(page, filePath)
}

async function captureQuickStartTraining(page, drillName, filePath) {
  await page.goto(`${BASE_URL}/shooting-range`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=选择训练项目')
  await page.getByRole('button', { name: new RegExp(drillName) }).first().click()
  await enterFallbackPlay(page)
  await captureTrainingHud(page, filePath)
}

async function scoreFallbackHits(page, attempts = 8) {
  const canvas = page.locator('canvas').first()
  const box = await canvas.boundingBox()
  if (!box) return

  const grid = [
    [0.5, 0.42],
    [0.46, 0.38],
    [0.54, 0.38],
    [0.5, 0.36],
    [0.44, 0.44],
    [0.56, 0.44],
    [0.48, 0.4],
    [0.52, 0.4],
  ]

  for (let i = 0; i < Math.min(attempts, grid.length); i += 1) {
    const [rx, ry] = grid[i]
    await canvas.click({ position: { x: box.width * rx, y: box.height * ry }, force: true })
    await page.waitForTimeout(220)
  }
}

async function injectQaSessionStats(page) {
  await page.evaluate(() => {
    window.debugShootingSession?.({
      score: 40,
      hits: 4,
      misses: 1,
      shots: 5,
      bestStreak: 3,
      avgReactionMs: 285,
    })
  })
}

async function captureResultsScreen(page, filePath) {
  await page.goto(`${BASE_URL}/shooting-range`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=选择训练项目')
  await page.getByRole('button', { name: /甩枪反应/ }).first().click()
  await enterFallbackPlay(page)
  await scoreFallbackHits(page, 6)
  await injectQaSessionStats(page)
  await page.waitForTimeout(200)
  await page.evaluate(() => window.endShootingSession?.())
  await page.getByText('训练完成', { exact: false }).first().waitFor({ state: 'visible', timeout: 15000 })
  await page.waitForTimeout(500)
  await page.screenshot({ path: filePath, fullPage: false })
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await mockAuth(page)

  await captureSetup(page, path.join(OUT_DIR, 'setup-quick-start.png'))

  for (const map of MAPS) {
    await captureCustomMapTraining(
      page,
      map.label,
      path.join(OUT_DIR, `${map.id}-training-hud.png`)
    )
  }

  await captureQuickStartTraining(
    page,
    '甩枪反应',
    path.join(OUT_DIR, 'drill-flick-training-hud.png')
  )
  await captureQuickStartTraining(
    page,
    '网格速点',
    path.join(OUT_DIR, 'drill-precision-training-hud.png')
  )
  await captureResultsScreen(page, path.join(OUT_DIR, 'results-screen.png'))

  await browser.close()
  console.log(`Saved screenshots to ${OUT_DIR}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
