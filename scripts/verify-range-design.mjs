import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'

const base = process.env.BASE_URL ?? 'http://localhost:3002'
const out = process.env.OUT_DIR ?? 'output/range-redesign'
await mkdir(out, { recursive: true })
const browser = await chromium.launch({
  headless: process.env.HEADED !== '1',
  channel: process.env.BROWSER_CHANNEL || undefined,
})
const results = []
const errors = []

async function createPage(config, seed = 20260919, viewport = { width: 1440, height: 900 }) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 })
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.route('**/api/user', (route) =>
    route.fulfill({ json: { id: 1, name: 'QA', permissions: [] } })
  )
  await page.addInitScript(
    ({ config, seed }) => {
      let state = seed
      Math.random = () => {
        state = (state * 1664525 + 1013904223) >>> 0
        return state / 4294967296
      }
      window.__SHOOTING_FORCE_FALLBACK__ = true
      localStorage.setItem('shooting-range-last-config', JSON.stringify(config))
    },
    { config, seed }
  )
  await page.goto(`${base}/shooting-range`)
  await page.getByRole('heading', { name: '选择训练项目' }).waitFor()
  await page.addStyleTag({ content: 'nextjs-portal { display:none !important }' })
  return page
}

const defaults = {
  difficulty: 'medium',
  mapId: 'indoor',
  modeId: 'static',
  targetShape: 'circle',
  outdoorTimeOfDay: 'day',
  recoilEnabled: false,
  sfxMuted: true,
}
for (const [mapId, time, shape, seed] of [
  ['indoor', 'day', 'circle', 20260919],
  ['warehouse', 'day', 'circle', 20260919],
  ['outdoor', 'day', 'circle', 20260919],
  ['outdoor', 'night', 'circle', 20260919],
  ['indoor', 'day', 'humanoid', 819],
]) {
  const config = { ...defaults, mapId, outdoorTimeOfDay: time, targetShape: shape }
  const page = await createPage(config, seed)
  if (mapId === 'indoor' && shape === 'circle')
    await page.screenshot({ path: `${out}/setup.png`, fullPage: true })
  await page.getByRole('button', { name: /按当前设置开始/ }).click()
  await page.getByRole('button', { name: /锁定鼠标并开始/ }).click()
  const fallback = page.getByRole('button', { name: '点击目标模式' })
  if (await fallback.isVisible().catch(() => false)) await fallback.click()
  await page.waitForFunction(
    () => JSON.parse(window.render_game_to_text?.() ?? '{}').mode === 'playing'
  )
  const dismissTip = page.getByRole('button', { name: '知道了' })
  if (await dismissTip.isVisible()) await dismissTip.click()
  await page.waitForTimeout(1800)
  const name = `${mapId}-${time}-${shape}`
  await page.screenshot({ path: `${out}/${name}.png` })
  const metrics = await page.evaluate(async () => {
    const intervals = []
    let last = performance.now()
    await new Promise((resolve) => {
      function frame(now) {
        intervals.push(now - last)
        last = now
        if (intervals.length < 90) requestAnimationFrame(frame)
        else resolve()
      }
      requestAnimationFrame(frame)
    })
    intervals.sort((a, b) => a - b)
    const gl = document.querySelector('canvas').getContext('webgl2')
    const driver = gl?.getExtension('WEBGL_debug_renderer_info')
    return {
      renderer: window.inspectShootingRange(),
      gpu: driver ? gl.getParameter(driver.UNMASKED_RENDERER_WEBGL) : 'unavailable',
      frameMedianMs: intervals[45],
      frameP95Ms: intervals[85],
      state: JSON.parse(window.render_game_to_text()),
    }
  })
  if (mapId === 'indoor' && shape === 'circle') {
    for (const [mode, z] of [
      ['normals', 0],
      ['wireframe', 0],
      ['final', -5],
      ['final', 4],
    ]) {
      await page.evaluate(([mode, z]) => window.inspectShootingRange(mode, z), [mode, z])
      await page.waitForTimeout(200)
      await page.locator('canvas').screenshot({ path: `${out}/inspection-${mode}-${z}.png` })
    }
    await page.evaluate(() => window.inspectShootingRange())
    // Exercise actual click-to-hit projection, rather than injecting a score.
    const point = await page.evaluate(() => {
      const state = JSON.parse(window.render_game_to_text())
      const target = state.targets.find((t) => !t.hit && Math.abs(t.x) < 5)
      const bounds = document.querySelector('canvas').getBoundingClientRect()
      const f = Math.tan((62 * Math.PI) / 360)
      return {
        x: bounds.x + bounds.width / 2 + ((target.x / -target.z / f) * bounds.height) / 2,
        y: bounds.y + bounds.height / 2 - (((target.y - 1.6) / -target.z / f) * bounds.height) / 2,
      }
    })
    await page.mouse.click(point.x, point.y)
    await page.waitForTimeout(200)
    metrics.afterShot = await page.evaluate(() => JSON.parse(window.render_game_to_text()))
    await page.evaluate(() => window.endShootingSession())
    await page.getByText('训练完成').waitFor()
    await page.screenshot({ path: `${out}/results.png` })
  }
  results.push({ name, seed, viewport: { width: 1440, height: 900 }, ...metrics })
  await page.close()
}
for (const width of [390, 820]) {
  const page = await createPage(defaults, 20260919, { width, height: 844 })
  await page.screenshot({ path: `${out}/setup-${width}.png`, fullPage: true })
  results.push({
    name: `responsive-${width}`,
    overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
  })
  await page.close()
}
await writeFile(`${out}/report.json`, JSON.stringify({ results, errors }, null, 2))
console.log(
  JSON.stringify(
    {
      results: results.map(
        ({ name, renderer, gpu, frameMedianMs, frameP95Ms, afterShot, overflow }) => ({
          name,
          renderer,
          gpu,
          frameMedianMs,
          frameP95Ms,
          hit: afterShot?.hits,
          overflow,
        })
      ),
      errors,
    },
    null,
    2
  )
)
await browser.close()
if (errors.length) process.exitCode = 1
