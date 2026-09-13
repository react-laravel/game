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

async function installQaFallback(page, options = {}) {
  const { forceFallback = true, forcePause = false } = options
  await page.addInitScript(
    ({ forceFallback: useFallback, forcePause: usePause }) => {
      if (useFallback) window.__SHOOTING_FORCE_FALLBACK__ = true
      if (usePause) window.__SHOOTING_QA_FORCE_PAUSE__ = true
      window.__SHOOTING_QA_FPS__ = 60
    },
    { forceFallback, forcePause }
  )
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

async function waitForSceneReady(page, options = {}) {
  const { requireHumanoid = false, timeout = 30000 } = options

  await page.getByText('无法锁定鼠标').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {})
  await page.locator('canvas[data-engine]').first().waitFor({ state: 'visible', timeout: 10000 })

  await page.waitForFunction(
    () => {
      const state = window.render_game_to_text?.()
      if (!state) return false
      const parsed = JSON.parse(state)
      if (parsed.mode !== 'playing') return false
      if (!Array.isArray(parsed.targets) || parsed.targets.length === 0) return false
      return true
    },
    { timeout }
  )

  await page.waitForFunction(
    requireHumanoidShape => {
      const canvas = document.querySelector('canvas[data-engine]')
      if (!canvas || canvas.width < 8 || canvas.height < 8) return false

      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2')
      if (gl) {
        const sampleW = Math.min(120, canvas.width)
        const sampleH = Math.min(120, canvas.height)
        const originX = Math.max(0, Math.floor(canvas.width / 2 - sampleW / 2))
        const originY = Math.max(0, Math.floor(canvas.height / 2 - sampleH / 2))
        const pixels = new Uint8Array(sampleW * sampleH * 4)
        gl.readPixels(originX, originY, sampleW, sampleH, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
        let bright = 0
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i] + pixels[i + 1] + pixels[i + 2] > 36) bright += 1
        }
        if (bright / (sampleW * sampleH) < 0.02) return false
      }

      if (requireHumanoidShape) {
        const state = window.render_game_to_text?.()
        if (!state) return false
        const parsed = JSON.parse(state)
        return parsed.targetShape === 'humanoid'
      }

      return true
    },
    requireHumanoid,
    { timeout }
  )

  await page.evaluate(async () => {
    if (typeof window.advanceTime === 'function') {
      await window.advanceTime(1200)
    }
  }).catch(() => {})
  await page.waitForTimeout(600)
}

async function captureTrainingHud(page, filePath, options = {}) {
  const fallback = page.getByRole('button', { name: '点击目标模式' })
  if (await fallback.isVisible({ timeout: 1500 }).catch(() => false)) {
    await fallback.click({ force: true, noWaitAfter: true, timeout: 5000 }).catch(() => {})
    await page.waitForTimeout(1200)
  }
  await waitForSceneReady(page, options)
  if (options.requireHumanoid) {
    const canvas = page.locator('canvas').first()
    const box = await canvas.boundingBox()
    if (box) {
      await canvas
        .click({
          position: { x: box.width * 0.5, y: box.height * 0.34 },
          force: true,
          noWaitAfter: true,
          timeout: 5000,
        })
        .catch(() => {})
      await page.waitForTimeout(320)
    }
  }
  await page.screenshot({ path: filePath, fullPage: false })
}

async function captureCustomMapTraining(page, mapLabel, filePath, options = {}) {
  const { outdoorTimeLabel } = options
  await page.goto(`${BASE_URL}/shooting-range`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=选择训练项目')
  await page.getByRole('button', { name: /自定义场景与难度/ }).click()
  await page.locator('button', { hasText: mapLabel }).first().click()
  if (outdoorTimeLabel) {
    await page.getByRole('button', { name: new RegExp(outdoorTimeLabel) }).click()
  }
  await page.getByRole('button', { name: /按当前设置开始/ }).click()
  await enterFallbackPlay(page)
  await captureTrainingHud(page, filePath)
}

async function captureHumanoidTraining(page, filePath) {
  await page.goto(`${BASE_URL}/shooting-range`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=选择训练项目')
  await page.getByRole('button', { name: /人形靶追踪/ }).first().click()
  await enterFallbackPlay(page)
  await captureTrainingHud(page, filePath, { requireHumanoid: true })
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

async function injectQaSessionStats(page, patch = {}) {
  await page.evaluate(stats => {
    window.debugShootingSession?.({
      score: 40,
      hits: 4,
      misses: 1,
      shots: 5,
      bestStreak: 3,
      avgReactionMs: 285,
      zoneHits: { head: 0, body: 0, limb: 0 },
      ...stats,
    })
  }, patch)
}

async function captureHumanoidHitFeedback(page, filePath) {
  await page.goto(`${BASE_URL}/shooting-range`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=选择训练项目')
  await page.getByRole('button', { name: /人形靶追踪/ }).first().click()
  await enterFallbackPlay(page)
  await waitForSceneReady(page, { requireHumanoid: true })
  await page.evaluate(() => window.debugShootingDemonstrateHit?.('head'))
  await page.waitForTimeout(140)
  await page.screenshot({ path: filePath, fullPage: false })
}

async function captureHumanoidResultsScreen(page, filePath) {
  await page.goto(`${BASE_URL}/shooting-range`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=选择训练项目')
  await page.getByRole('button', { name: /人形靶追踪/ }).first().click()
  await enterFallbackPlay(page)
  await waitForSceneReady(page, { requireHumanoid: true })
  await injectQaSessionStats(page, {
    score: 118,
    hits: 9,
    misses: 2,
    shots: 11,
    bestStreak: 5,
    avgReactionMs: 312,
    zoneHits: { head: 3, body: 4, limb: 2 },
  })
  await page.waitForTimeout(200)
  await page.evaluate(() => window.endShootingSession?.())
  await page.getByText('训练完成', { exact: false }).first().waitFor({ state: 'visible', timeout: 15000 })
  await page.getByText('命中部位').waitFor({ state: 'visible', timeout: 10000 })
  await page.waitForTimeout(400)
  await page.screenshot({ path: filePath, fullPage: false })
}

async function enterPauseOverlay(page) {
  await installQaFallback(page, { forceFallback: true, forcePause: true })
  await page.goto(`${BASE_URL}/shooting-range`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForSelector('text=选择训练项目', { timeout: 30000 })
  await page.getByRole('button', { name: /甩枪反应/ }).first().click({ timeout: 10000 })

  await Promise.race([
    page.locator('canvas[data-engine]').first().waitFor({ state: 'attached', timeout: 25000 }),
    page.getByRole('button', { name: /锁定鼠标并开始/ }).waitFor({ state: 'visible', timeout: 25000 }),
  ]).catch(() => {})

  const startBtn = page.getByRole('button', { name: /锁定鼠标并开始|重新锁定鼠标/ })
  if (await startBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await startBtn.click({ force: true, noWaitAfter: true }).catch(() => {})
    await page.waitForTimeout(600)
  }

  const fallback = page.getByRole('button', { name: '点击目标模式' })
  if (await fallback.isVisible({ timeout: 2000 }).catch(() => false)) {
    await fallback.click({ force: true, noWaitAfter: true }).catch(() => {})
    await page.waitForTimeout(600)
  }

  await page.getByTestId('shooting-pause-dialog').waitFor({ state: 'visible', timeout: 25000 })
  await page.getByRole('button', { name: '回到游戏' }).waitFor({ state: 'visible', timeout: 10000 })
  await page.waitForTimeout(400)
}

async function capturePauseSettingsTabs(page, filePath, tabName = '准星', options = {}) {
  const { openSettings = true } = options
  if (openSettings) {
    const settingsButton = page.getByTestId('shooting-pause-dialog').getByRole('button', { name: '设置' })
    await settingsButton.waitFor({ state: 'visible', timeout: 15000 })
    await settingsButton.click({ force: true, timeout: 15000 })
    await page.getByTestId('shooting-pause-settings').waitFor({ state: 'visible', timeout: 10000 })
  }
  if (tabName !== '准星') {
    await page.getByRole('tab', { name: tabName }).click({ force: true, timeout: 5000 })
  }
  await page.getByRole('tab', { name: tabName }).waitFor({ state: 'visible', timeout: 5000 })
  await page.waitForTimeout(400)
  await page.screenshot({ path: filePath, fullPage: false })
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

  await runStep('outdoor-noon', () =>
    captureCustomMapTraining(page, '户外靶场', path.join(OUT_DIR, 'outdoor-noon-training-hud.png'), {
      outdoorTimeLabel: '中午',
    })
  )
  await runStep('outdoor-dusk', () =>
    captureCustomMapTraining(page, '户外靶场', path.join(OUT_DIR, 'outdoor-dusk-training-hud.png'), {
      outdoorTimeLabel: '傍晚',
    })
  )
  await runStep('outdoor-night', () =>
    captureCustomMapTraining(page, '户外靶场', path.join(OUT_DIR, 'outdoor-night-training-hud.png'), {
      outdoorTimeLabel: '晚上',
    })
  )

  await runStep('drill-flick', () =>
    captureQuickStartTraining(page, '甩枪反应', path.join(OUT_DIR, 'drill-flick-training-hud.png'))
  )
  await runStep('drill-precision', () =>
    captureQuickStartTraining(page, '网格速点', path.join(OUT_DIR, 'drill-precision-training-hud.png'))
  )
  await runStep('humanoid-hud', () =>
    captureHumanoidTraining(page, path.join(OUT_DIR, 'humanoid-training-hud.png'))
  )
  await runStep('humanoid-hit-feedback', () =>
    captureHumanoidHitFeedback(page, path.join(OUT_DIR, 'humanoid-hit-feedback.png'))
  )
  await runStep('results', () => captureResultsScreen(page, path.join(OUT_DIR, 'results-screen.png')))
  await runStep('humanoid-results', () =>
    captureHumanoidResultsScreen(page, path.join(OUT_DIR, 'humanoid-results-screen.png'))
  )

  await runStep('pause-overlay', async () => {
    await enterPauseOverlay(page)
    await page.screenshot({ path: path.join(OUT_DIR, 'pause-overlay.png'), fullPage: false })
    await capturePauseSettingsTabs(page, path.join(OUT_DIR, 'pause-settings-tabs.png'), '准星')
    await capturePauseSettingsTabs(
      page,
      path.join(OUT_DIR, 'pause-settings-sensitivity.png'),
      '灵敏度',
      { openSettings: false }
    )
  })

  await browser.close()
  console.log(`Saved screenshots to ${OUT_DIR}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
