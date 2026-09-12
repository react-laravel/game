import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3002'
const OUT_DIR = process.env.OUT_DIR ?? '/opt/cursor/artifacts/shooting-range-iteration'

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
  await page.waitForSelector('canvas', { timeout: 15000 })
  const startBtn = page.getByRole('button', { name: /锁定鼠标并开始|点击开始/ })
  if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await startBtn.click()
  }
  const fallback = page.getByRole('button', { name: '点击目标模式' })
  if (await fallback.isVisible({ timeout: 2000 }).catch(() => false)) {
    await fallback.click()
  }
  await page.waitForFunction(() => {
    const state = window.render_game_to_text?.()
    return state && JSON.parse(state).mode === 'playing'
  }, { timeout: 15000 })
  await page.waitForTimeout(2000)
}

async function captureSetup(page, filePath) {
  await page.goto(`${BASE_URL}/shooting-range`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=选择训练项目')
  await page.screenshot({ path: filePath, fullPage: true })
}

async function captureQuickStart(page, drillName, filePath) {
  await page.goto(`${BASE_URL}/shooting-range`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=选择训练项目')
  await page.getByRole('button', { name: new RegExp(drillName) }).first().click()
  await enterFallbackPlay(page)
  await page.locator('canvas').first().screenshot({ path: filePath })
}

async function captureCustomMap(page, mapLabel, filePath) {
  await page.goto(`${BASE_URL}/shooting-range`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=选择训练项目')
  await page.getByRole('button', { name: /自定义场景与难度/ }).click()
  await page.locator('button', { hasText: mapLabel }).first().click()
  await page.getByRole('button', { name: /按当前设置开始/ }).click()
  await enterFallbackPlay(page)
  await page.locator('canvas').first().screenshot({ path: filePath })
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await mockAuth(page)

  await captureSetup(page, path.join(OUT_DIR, 'setup-quick-start.png'))

  for (const map of MAPS) {
    await captureCustomMap(page, map.label, path.join(OUT_DIR, `${map.id}.png`))
  }

  await captureQuickStart(page, '甩枪反应', path.join(OUT_DIR, 'drill-flick.png'))
  await captureQuickStart(page, '网格速点', path.join(OUT_DIR, 'drill-precision.png'))

  await browser.close()
  console.log(`Saved screenshots to ${OUT_DIR}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
