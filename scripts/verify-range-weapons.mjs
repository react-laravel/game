import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

const out = process.env.OUT_DIR ?? '/tmp/range-weapons-qa'
await mkdir(out, { recursive: true })
const browser = await chromium.launch({
  headless: process.env.HEADED !== '1',
  channel: process.env.BROWSER_CHANNEL || undefined,
})
const errors = []
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.route('**/api/user', (route) => route.fulfill({ json: { id: 1, name: 'QA' } }))
  await page.addInitScript(() => {
    localStorage.setItem(
      'shooting-range-last-config',
      JSON.stringify({
        difficulty: 'easy',
        mapId: 'indoor',
        modeId: 'static',
        targetShape: 'circle',
        lookSensitivity: 1,
        sfxMuted: true,
        recoilEnabled: false,
      })
    )
  })
  await page.goto(process.env.BASE_URL ?? 'http://localhost:3002/shooting-range')
  await page.getByRole('button', { name: /按当前设置开始/ }).click()
  await page.getByRole('button', { name: '锁定鼠标并开始' }).waitFor()
  // Chromium automation may deny native capture. Simulate only that platform boundary.
  // Keyboard, mouse, wheel, camera projection, raycasts and scoring remain the actual game.
  await page.evaluate(() => {
    let locked = null
    const canvas = document.querySelector('canvas')
    Object.defineProperty(document, 'pointerLockElement', { configurable: true, get: () => locked })
    canvas.requestPointerLock = () => {
      locked = canvas
      document.dispatchEvent(new Event('pointerlockchange'))
      return Promise.resolve()
    }
    document.exitPointerLock = () => {
      locked = null
      document.dispatchEvent(new Event('pointerlockchange'))
    }
  })
  await page.getByRole('button', { name: '锁定鼠标并开始' }).click()
  await page.addStyleTag({ content: 'nextjs-portal {display:none!important}' })
  const state = () => page.evaluate(() => JSON.parse(window.render_game_to_text()))
  const waitFov = (fov) =>
    page.waitForFunction(
      (fov) => Math.abs(JSON.parse(window.render_game_to_text()).camera.fov - fov) < 0.02,
      fov
    )
  await waitFov(62)
  assert.equal((await state()).weaponId, 'pistol')
  await page.screenshot({ path: `${out}/pistol.png` })
  await page.mouse.down({ button: 'right' })
  await waitFov(44)
  assert.equal((await state()).isAiming, true)
  assert.equal(await page.getByTestId('sniper-scope').count(), 0)
  await page.screenshot({ path: `${out}/pistol-aim.png` })
  await page.mouse.up({ button: 'right' })
  await waitFov(62)
  await page.keyboard.press('2')
  assert.equal((await state()).weaponId, 'sniper')
  await page.screenshot({ path: `${out}/sniper.png` })
  await page.mouse.down({ button: 'right' })
  await waitFov(16)
  assert.equal(await page.getByTestId('sniper-scope').count(), 1)
  assert.equal(await page.getByTestId('game-quick-menu').isVisible(), false)
  assert.equal(await page.evaluate(() => window.inspectShootingRange().weaponVisible), false)
  await page.screenshot({ path: `${out}/sniper-scope.png` })

  await page.evaluate(() =>
    document
      .querySelector('canvas')
      .dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true }))
  )
  await waitFov(62)
  assert.equal((await state()).weaponId, 'pistol')
  assert.equal((await state()).isAiming, false)
  assert.equal(await page.getByTestId('sniper-scope').count(), 0)
  assert.equal(await page.getByTestId('game-quick-menu').isVisible(), true)
  await page.mouse.up({ button: 'right' })
  await page.keyboard.press('2')
  // Aim at an existing static target using mouse delta, then test the scoped center ray.
  await page.evaluate(() => {
    const state = JSON.parse(window.render_game_to_text())
    const target = state.targets.find((target) => !target.hit && Math.abs(target.x) < 5)
    const yaw = -Math.atan2(target.x, -target.z)
    const pitch = Math.atan2(target.y - 1.6, Math.hypot(target.x, target.z))
    const event = new MouseEvent('mousemove', { bubbles: true })
    Object.defineProperty(event, 'movementX', { value: -(yaw - state.camera.yaw) / 0.002 })
    Object.defineProperty(event, 'movementY', { value: -(pitch - state.camera.pitch) / 0.002 })
    document.dispatchEvent(event)
  })
  await page.mouse.down({ button: 'right' })
  await waitFov(16)
  await page.mouse.down({ button: 'left' })
  await page.mouse.up({ button: 'left' })
  await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).shots === 1)
  const hit = await state()
  await page.screenshot({ path: `${out}/scoped-hit.png` })
  await writeFile(`${out}/hit-state.json`, JSON.stringify(hit, null, 2))
  assert.equal(hit.hits, 1, 'Scoped center must raycast to the visually centered target')
  await page.mouse.down({ button: 'left' })
  await page.mouse.up({ button: 'left' })
  assert.equal((await state()).shots, 1, 'Sniper cooldown must prevent immediate second shot')
  await page.evaluate(() => document.exitPointerLock())
  await waitFov(62)
  assert.equal(await page.getByTestId('sniper-scope').count(), 0)
  await page.mouse.up({ button: 'right' })
  await page.getByRole('button', { name: '设置', exact: true }).click()
  await page.keyboard.press('1')
  assert.equal((await state()).weaponId, 'sniper', 'Settings must not receive weapon hotkeys')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: '回到游戏', exact: true }).click()
  assert.equal((await state()).isAiming, false)
  await page.keyboard.press('1')
  assert.equal((await state()).weaponId, 'pistol')
  await page.evaluate(() => document.exitPointerLock())
  await page.getByRole('button', { name: '退出游戏', exact: true }).click()
  await page.getByRole('heading', { name: '选择训练项目' }).waitFor()
  assert.deepEqual(errors, [])
  const report = {
    pointerLock: 'simulated platform boundary',
    pistolFov: 44,
    sniperFov: 16,
    normalFov: 62,
    scopedHit: hit.hits,
    wheelSwitch: true,
    pauseResetsAim: true,
    settingsIgnoreWeaponInput: true,
    errors,
  }
  await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
} finally {
  await browser.close()
}
