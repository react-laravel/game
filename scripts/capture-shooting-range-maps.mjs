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

async function installQaFallback(page) {
  await page.addInitScript(() => {
    window.__SHOOTING_FORCE_FALLBACK__ = true
    window.__SHOOTING_QA_FPS__ = 60
  })
}

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
  await page.locator('canvas[data-engine]').first().waitFor({ state: 'attached', timeout: 30000 })
  await page.waitForTimeout(1200)

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const startBtn = page.getByRole('button', { name: /锁定鼠标并开始|点击开始/ })
    if (await startBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await startBtn.click({ force: true, noWaitAfter: true, timeout: 5000 }).catch(() => {})
      await page.waitForTimeout(700)
    }

    const fallback = page.getByRole('button', { name: '点击目标模式' })
    if (await fallback.isVisible({ timeout: 2000 }).catch(() => false)) {
      await fallback.click({ force: true, noWaitAfter: true, timeout: 5000 }).catch(() => {})
      await page.waitForTimeout(700)
    }

    const ready = page.getByText('准备进入训练')
    if (!(await ready.isVisible({ timeout: 800 }).catch(() => false))) {
      break
    }

    await page.keyboard.press('Enter').catch(() => {})
    await page.waitForTimeout(700)
  }

  const fallback = page.getByRole('button', { name: '点击目标模式' })
  if (await fallback.isVisible({ timeout: 3000 }).catch(() => false)) {
    await fallback.click({ force: true, noWaitAfter: true, timeout: 5000 }).catch(() => {})
    await page.waitForTimeout(900)
  }

  await page.getByRole('button', { name: '结束训练' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByText('准备进入训练').waitFor({ state: 'hidden', timeout: 20000 }).catch(() => {})
  await page.getByText('无法锁定鼠标').waitFor({ state: 'hidden', timeout: 20000 }).catch(() => {})
  await page.waitForTimeout(5500)
}

async function captureSetup(page, filePath) {
  await page.goto(`${BASE_URL}/shooting-range`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=选择训练项目')
  await page.screenshot({ path: filePath, fullPage: true })
}

async function captureTrainingHud(page, filePath) {
  const fallback = page.getByRole('button', { name: '点击目标模式' })
  if (await fallback.isVisible({ timeout: 1500 }).catch(() => false)) {
    await fallback.click({ force: true, noWaitAfter: true, timeout: 5000 }).catch(() => {})
    await page.waitForTimeout(1200)
  }
  await page.getByText('无法锁定鼠标').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {})
  await page.locator('canvas[data-engine]').first().waitFor({ state: 'visible', timeout: 10000 })
  await page.waitForFunction(
    () => {
      const qa = window.__SHOOTING_QA_FPS__
      if (typeof qa === 'number' && qa > 0) return true
      return Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent?.trim() ?? ''
        return text === 'FPS' && el.nextElementSibling?.textContent && Number(el.nextElementSibling.textContent) >= 30
      })
    },
    { timeout: 8000 }
  ).catch(() => {})
  await page.waitForTimeout(800)
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
    await canvas.click({
      position: { x: box.width * rx, y: box.height * ry },
      force: true,
      noWaitAfter: true,
      timeout: 5000,
    }).catch(() => {})
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

async function runStep(label, fn) {
  try {
    await fn()
    console.log(`Captured ${label}`)
  } catch (error) {
    console.error(`Failed ${label}:`, error instanceof Error ? error.message : error)
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await installQaFallback(page)
  await mockAuth(page)

  await runStep('setup', () => captureSetup(page, path.join(OUT_DIR, 'setup-quick-start.png')))

  for (const map of MAPS) {
    await runStep(map.id, () =>
      captureCustomMapTraining(page, map.label, path.join(OUT_DIR, `${map.id}-training-hud.png`))
    )
  }

  await runStep('drill-flick', () =>
    captureQuickStartTraining(page, '甩枪反应', path.join(OUT_DIR, 'drill-flick-training-hud.png'))
  )
  await runStep('drill-precision', () =>
    captureQuickStartTraining(page, '网格速点', path.join(OUT_DIR, 'drill-precision-training-hud.png'))
  )
  await runStep('results', () => captureResultsScreen(page, path.join(OUT_DIR, 'results-screen.png')))

  await browser.close()
  console.log(`Saved screenshots to ${OUT_DIR}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
