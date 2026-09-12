import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const BASE = process.env.BASE_URL ?? 'http://localhost:3002'
const OUT = process.env.OUT_DIR ?? '/opt/cursor/artifacts/shooting-range-overnight-polish'

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

async function capture(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false })
  const state = await page.evaluate(() => window.render_game_to_text?.() ?? '{}')
  await writeFile(path.join(OUT, `${name}.json`), state, 'utf8')
}

async function enterPlaying(page) {
  await page.waitForSelector('canvas', { timeout: 15000 })
  const startBtn = page.getByRole('button', { name: /锁定鼠标并开始/ })
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
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await mockAuth(page)

  await page.goto(`${BASE}/shooting-range`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=选择训练项目')
  await capture(page, '01-setup')

  await page.getByRole('button', { name: /甩枪反应/ }).first().click()
  await enterPlaying(page)
  await page.waitForTimeout(1500)

  for (let i = 0; i < 4; i += 1) {
    await page.locator('canvas').first().click({ position: { x: 720, y: 450 } })
    await page.waitForTimeout(350)
  }

  await page.locator('canvas').first().screenshot({ path: path.join(OUT, '02-training-canvas.png') })
  await capture(page, '02-training-state')

  await page.evaluate(() => {
    window.endShootingSession?.()
  })
  await page.waitForFunction(() => {
    const state = window.render_game_to_text?.()
    return state && JSON.parse(state).mode === 'game-over'
  })
  await page.waitForTimeout(600)
  await capture(page, '03-results-screen')

  const critique = {
    gameOverVisible: await page.getByText('训练完成').isVisible(),
    gradeBadge: await page.locator('text=/^[SABCD]$/').first().isVisible().catch(() => false),
    performanceBars: await page.locator('.from-emerald-400, .from-cyan-400, .from-amber-400').count(),
    newRecordBanner: await page.getByText('新纪录').isVisible().catch(() => false),
  }
  await writeFile(path.join(OUT, 'critique.json'), JSON.stringify(critique, null, 2))

  await browser.close()
  console.log(JSON.stringify(critique, null, 2))
  console.log(`Saved to ${OUT}`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
