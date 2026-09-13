Original prompt: 开始实现前端，工作目录只限新目录 /Users/sam/Code/DogeOW/game，避免改 central。以 /Users/sam/Code/DogeOW/rpg 的 standalone Next/SSO/部署骨架为基础，迁移 /Users/sam/Code/DogeOW/dogeow/app/game 除 rpg 外的 12 个游戏、48 个测试、共享依赖/组件/资源；路由改为根路径（/2048、/monopoly 等），首页为游戏中心；moon dice 独立为 /moon-dice 并迁测试；认证沿用中央一次性 SSO，app id 改 game，API 指向 game-api。保留 develop-web-game 的 progress.md 要求。不要创建 GitHub repo、不要提交/推送、不要改服务器。

Current prompt (2026-07-15): 修复 `https://game.dogeow.com/monopoly` 浅色、深色表现不对应的问题，并为 Monopoly 增加自己的顶部导航栏。

Current prompt (2026-07-15): 修复 `/tetris` 空格硬降触底后仍能左右移动的问题，并增加游戏音效。

Current prompt (2026-07-15): 修复 `/shooting-range` 因 `venice_sunset_1k.hdr` 加载失败而无法进入的问题。

Current prompt (2026-07-16): 改善 `/shooting-range` 的 UI 和枪支外观，并修复击中目标时的画面卡顿。

Current prompt (2026-07-16): 统一游戏中心卡片高度和页面背景；以一个可拖动、可展开的全局悬浮按钮统一浅色/深色切换与返回首页，并移除各游戏自己的面包屑和全局返回控件。

Current prompt (2026-07-16): 修复 `/shooting-range` 选择难度进入训练后，3D 画布和准备遮罩没有撑满训练区域的高度问题。

Current prompt (2026-07-16): 修复 `/shooting-range` 开始训练后鼠标移动无法带动相机、准星和枪械的问题。

Current prompt (2026-07-31): 改进代码并进行真实组件化提取；在保持现有游戏行为和技术栈稳定的前提下，清理重复实现与不再需要的依赖。

Current prompt (2026-09-12): 迷宫，之前有难度选择，现在界面上没看到了，你恢复，可以滑动调整大小，最主要加上打印机打印，我会用打印机打印出来玩的

Current prompt (2026-09-12): 迷宫，怎么一条路可以走到底？应该偶尔碰到死胡同，重新设计

Current prompt (2026-09-12): 可以切换为正方形和适合A4纸的长方形尺寸

Current prompt (2026-09-13): /bowling，地板和背景都是空的

Current prompt (2026-09-13): 月饼，骰子背景没透明

Current prompt (2026-09-13): 贪吃蛇，奇怪，而且没有跟随角度

Current prompt (2026-09-13): shooting-range 射击到球时，会掉帧

Current prompt (2026-09-12): Improve Shooting Range — FPS HUD, richer stats, map/mode variety, local history charts, hit smoothness.

Current prompt (2026-09-13): 射击音效不好，重新设计

Current prompt (2026-09-12): 修复 `/bowling` 穿模（球/瓶/边沟/助跑区物理碰撞体与网格对齐）

Current prompt (2026-09-12): 贪吃蛇，除了按开始，wasd 或者方向键都需要能直接开始

Current prompt (2026-09-12): Blackjack `/blackjack` 玩家座位筹码应显示在最上方（高于名字与余额）。

## Current work

- Shooting Range cycle 34 (2026-09-13, window ending ~10:30 Asia/Shanghai): **outdoor night clarity + matte targets + all-grass lawn** — night fog pushed past play space (`fog.near` 118 / `far` 228, no horizon wash); practical lamp intensity up, emissive bloom down on fixtures; circular + humanoid targets use `meshStandard` matte cardboard/painted-metal (no neon rings / LED cyan head); removed outdoor center gravel lane, chalk line, firing strip, and dirt patches — continuous grass with subtle patch variation only. Focused 166/166; eslint 0.
- Shooting Range cycle 33 (2026-09-13, window ending ~10:30 Asia/Shanghai): **outdoor time-of-day environments** — selectable **白天 / 中午 / 傍晚 / 晚上** (`outdoorTimeOfDay` persisted in `lastConfigStorage`); setup custom + pause「其他」tab control; sky/fog/sun/ground tint + night solid range pole lights via `outdoorTimeOfDay.ts`; outdoor solid-detail pass retained (post-and-rail fence, berm tiers, distance plaques — no glass in lane). Focused tests green; eslint 0; `outdoor-*-training-hud.png` screenshots refreshed.
- Shooting Range cycle 32 (2026-09-13, window ending ~10:30 Asia/Shanghai): **warehouse depth pass** — solid meshBasic only (ceiling cross-trusses, side pillars, conduit runs, accent distance plaques, transverse aisle bands, layered backstop boxes, deep crate + side-rack silhouettes, lane curb posts); **no glass/translucent planes in firing lane**. ESC compact pause + humanoid systems (#34) preserved. Focused 159/159; full 718/718; eslint 0 errors; `warehouse-training-hud.png` + screenshots refreshed.
- Shooting Range cycle 31 (2026-09-13, window ending ~10:30 Asia/Shanghai): **humanoid headshot feedback polish** — prominent rose-gold **爆头!** pill + larger score pop with `headshot-pop` animation; head hits stay visible 680ms (body/limb 520ms); `aria-live` announces headshots; body/limb zone labels unchanged. Warehouse depth deferred (no glass in lane). Indoor ceiling fixture thinning from #33 preserved. Focused 159/159; full 718/718; eslint 0 errors; `humanoid-training-hud.png` captures headshot toast.
- Shooting Range cycle 30 (2026-09-13, window ending ~10:30 Asia/Shanghai): **configurable humanoid targets** — setup custom + pause「其他」tab **圆形靶 / 人形靶** (`targetShape` persisted in `lastConfigStorage`); original low-poly training-bot silhouette with **头 2× / 躯干 1× / 四肢 0.5×** zone scoring, HUD float「命中部位」label, results **命中部位** breakdown; mode-tied bot motion (strafe / advance / retreat / jump / crouch / hover) via `humanoidMotion.ts`. Circle drills unchanged. ESC compact pause + tabbed settings (#26–#28) preserved. Focused 152/152; full 711/711; eslint 0 errors; `humanoid-training-hud.png` + screenshots refreshed.
- Shooting Range cycle 29 (2026-09-13, window ending ~10:30 Asia/Shanghai): **training feel / maps** — mode-specific target accents (flick orange / track green / strafe magenta / grid cyan), spawn flash rings, corner brackets for single-target modes, orbit path hint for tracking; indoor meshBasic depth (ceiling beams, lane guides, distance plaques, backstop layers). Pause/settings (#26–#28) unchanged. Focused 141/141; full 700/700; eslint 0 errors; map/drill HUD screenshots refreshed.
- Shooting Range cycle 28 (2026-09-13, window ending ~10:30 Asia/Shanghai): pause settings **灵敏度 / 音量 / 其他** tab content parity with crosshair (live previews, preset hints, framed cards); lighter home **准星设置** sheet (sticky footer, bottom-sheet mobile); results hit/miss legend dots; `pause-settings-sensitivity.png` added. Focused 138/138; full 697/697; eslint 0 errors.
- Shooting Range cycle 27 (2026-09-13): pause settings tabs stronger active contrast (amber ring 4-col grid); ESC → 设置 → back arrow or Escape returns to compact pause dialog with resume focus; Enter/Space resume only from pause menu; history recent table grade badges; `pause-settings-tabs.png` screenshot. Focused 137/137; full 696/696; eslint 0 errors.
- Shooting Range cycle 26 (2026-09-13): **ESC pause = compact centered popup** (回到游戏 / 设置 / 退出游戏 + 重新开始 secondary); **tabbed settings panel** (准星 / 灵敏度 / 音量 / 其他) opened from 设置 — removed left-drawer `shooting-pause-menu`. `CrosshairSettingsSheet` apply/cancel + dual-background preview on setup. Outdoor berm target frames. Focused 133/133; full 692/692; eslint 0 errors; `pause-overlay.png` refreshed.
- Shooting Range cycle 25 (2026-09-13): **deploy CI lint fix** (seeded PRNG textures, no setState-in-effect); **Overwatch left pause menu** with 结束训练/准星/设置 on left rail; setup **准星设置** behind `CrosshairSettingsSheet` menu. Focused 129/129; full 688/688; eslint 0 errors; screenshots `setup-quick-start.png` + `pause-overlay.png`.
- Shooting Range cycle 24 (2026-09-13, overnight window ending ~10:45 Asia/Shanghai): ESC pause overlay scrolls on short viewports with tighter spacing so SFX / reduced-motion controls stay reachable; results「查看进步」lands on history with a subtle highlight on the latest session row; zero-shot sessions persist `accuracy: 0` (not 100) for chart averages; Enter/Space no longer re-locks pointer while crosshair settings are open. Focused tests 123/123; full suite 682/682; screenshots refreshed.
- Shooting Range cycle 23 (2026-09-13): compact Chinese help sheet (`?` HUD + pause「操作说明」); `prefers-reduced-motion` + pause「动态效果」toggle for score pop / combo toast / muzzle flash / impact particles; target hit ring-burst on despawn; outdoor lane gravel shoulders + fence concrete footings. Focused tests 119/119; screenshots refreshed (pause-overlay retained).
- Shooting Range cycle 22 (2026-09-13): master SFX volume + mute toggle on setup custom panel and ESC pause overlay, persisted via `lastConfigStorage`; shot/hit/miss Web Audio respects volume + mute. Crosshair settings: dot/circle/cross quick presets, Chinese color/size labels, live preview retained. Added `pause-overlay.png` to `docs/shooting-range-screenshots/`. Focused tests 113/113; screenshots overwritten.
- Shooting Range cycle 21 (2026-09-13): ESC pause overlay with 继续 / 重新开始 / 换训练项 / 准星 / 灵敏度 (no dead ends); setup custom panel highlights difficulty + look sensitivity with `lastConfig` persistence; indoor side/back wall poster blocks + meshBasic wash planes; first-hit tutorial tip fades after first hit. Focused tests 107/107; screenshots overwritten.
- Shooting Range cycle 20 (2026-09-13): history chart period/metric toggles + hover tooltips; in-session score pop + streak milestone toasts; outdoor umbrella/sparse tree canopy variety. Focused tests 101/101; full suite 660/660.
- Shooting Range gun feel pass (2026-09-13): frame-based muzzle flash curve (no setTimeout), readable camera/weapon recoil kick with smooth decay, Aimlabs-inspired hit marker (gap shrink + X + ring), brighter metallic hit SFX + soft miss thud, shorter pooled impact particles. Outdoor tree silhouettes and warehouse back-wall window depth added. Focused tests 99/99; full suite 658/658.
- Shooting Range setup now offers 3 scenes (indoor / outdoor / warehouse), 5 training modes (static / moving / flick / tracking / timed), and a local history view with daily + monthly SVG charts.
- In-game HUD shows live FPS (250ms throttled), hits/misses, accuracy, shots/min, streak, and reaction time; sessions persist to `localStorage` and surface in the end-of-run summary.
- Hit path keeps pooled ImpactFX, cached raycast object lists, ref-stable callbacks, and in-place respawns to avoid render-loop allocations and light churn.
- Bowling clipping fix: added shared `layout.ts` + `colliders.ts`, approach/gutter/back-wall physics, ball/pin rest heights on the lane surface, taller side walls, and lower default restitution.
- Snake idle/game-over screens now start a run on WASD or arrow keys (same as Start, plus first direction when valid). Key repeats are ignored before play; opposite first moves still follow existing snake rules.
- Blackjack `PlayerSeat` 布局调整：筹码堆（`ChipStack`）移至座位列最顶部，名字与余额在其下方；牌面与点数不变，分牌时仍用 `seatTotalBet` 汇总显示。
- Blackjack 当前玩家高亮：移除 `HandBlock` 内层黄色 `ring`，仅保留座位外层单一高亮框，避免双层黄边。
- Shooting Range gun and hit sounds are now synthesized with Web Audio (crack/thump vs metallic ping) instead of pitching the same `shot.mp3`.
- Shooting Range hits no longer mount lights or particle geometries: one pooled ImpactFX, persistent muzzle meshes, and in-place target respawns keep the Three.js light count stable.
- Snake body is now a round-join SVG path so corners follow the turn, and the head faces away from the next segment instead of toward the body.

- Moon-dice dice faces read white again: removed `mix-blend-multiply` (it tinted faces green on the felt) and crop JPG padding with a scaled, overflow-hidden frame instead of opaque cards.

- Bowling alley now has a patterned carpet floor, side walls, ceiling lights, seating, and a pinsetter behind the pins so the follow-cam no longer looks into a black void.
- Maze size can switch between a square and an A4-portrait rectangle (slider width × taller paper height, e.g. 15×21) so on-screen play and print both match the paper.
- Replaced maze generation so it grows from a random cell with mixed branching: more dead ends and shorter unique solutions, instead of one DFS river from the start corner.
- Restyled remaining games (except maze/bowling) onto a shared fullscreen `GameStage` HUD: arcade cabinets, felt tables, puzzle overlays, Monopoly lobby glass cards, and shooting-range true-fullscreen canvas.
- Redesigned `/bowling` into a fullscreen 3D alley with a ten-frame scoresheet, charge-to-throw HUD, and working strike/spare scoring.
- Restored maze difficulty as a 5–40 size slider, added a print-ready black-and-white maze sheet, and wired 「打印迷宫」 to the browser print dialog for paper play.


- Refactored Shooting Range into a thin page/game orchestrator plus focused setup, Canvas, overlay, session-state, pointer-lock, and debug-bridge modules while preserving the route and gameplay contracts.
- Removed the unused alternate ShootingGame, legacy Gun/Bullet implementations, obsolete `three-stdlib` declaration, and the no-longer-needed direct dependency; added focused coverage for the extracted session, pointer-lock, and setup boundaries.
- Replaced Shooting Range's mismatched third-party pointer-lock binding with direct Canvas-locked mouse movement handling, so camera/reticle/weapon rotation follows `movementX/Y` from the exact element acquired during the start gesture.
- Made Shooting Range's active-training page height explicit and replaced the unresolved minimum-height chain, allowing the Three.js canvas and overlays to fill the complete viewport training area.
- Unified the game-center grid around fixed-height cards and one root background token, eliminating the uneven rows and dark-mode color seam.
- Added one global draggable quick menu on game routes; it expands to light mode, dark mode, and return-home actions, and persists its position locally.
- Removed the scattered game-center breadcrumbs, return-home links, and Monopoly-only top navigation while keeping game-specific titles, rules, and controls.
- Redesigned Shooting Range's setup screen, in-game HUD, crosshair feedback, indoor range, moving drone targets, and first-person weapon.
- Removed Shooting Range's render-loop React state updates: targets now move through Three.js refs, shooting uses immediate raycasts, and the unused animated bullet path is no longer mounted.
- Replaced per-particle React state/geometries with one mutable points geometry per impact and added reusable prewarmed audio pools, eliminating the main hit-time allocation spikes.
- Added shooting accuracy/shot counters plus a `render_game_to_text` state bridge; fallback target clicks now count as shots and use the same score/feedback path.
- Removed Shooting Range's remote Drei `sunset` HDR environment dependency; the scene now relies on its existing local lights, fog, sun, and canvas background, so an external HDR fetch failure can no longer crash the route.
- Fixed Tetris hard drop so Space locks the landed piece immediately and spawns the next piece before any later horizontal input can run.
- Added synthesized Tetris sound effects for movement, rotation, landing, hard drop, line clear, and game over, with a persisted mute control.
- Added a class-driven game theme bootstrap/provider so the root color tokens and every `dark:` utility switch together, with a persisted light/dark choice and system-theme fallback.
- Added a dedicated Monopoly top navigation with a game-center link and theme toggle; active boards now use the remaining flex height below that navigation instead of a missing central-site header offset.
- Created the standalone game project directory.
- Copied the standalone SSO, same-origin API proxy, PM2, self-hosted deployment, and Vitest skeleton from the RPG project.
- Renamed the integration to SSO client `game`, `game.dogeow.com`, `game-api.dogeow.com`, local API port 8002, Reverb port 8082, dev frontend port 3002, and production frontend port 3011.
- Migrated all 12 non-RPG game directories and their 48 tests to root routes.
- Added the standalone `/moon-dice` route and copied its rules test.
- Added a static game-center homepage and a central-SSO auth gate.
- Installed the expanded dependency set from a fresh `npm install`.
- Fixed migrated root-route assertions, declared the direct `react-icons`/`three-stdlib` dependencies, and isolated two React lint findings in copied game code.
- Removed the invalid HTML file masquerading as `explode.mp3`; explosion and hit effects now temporarily reuse the validated `shot.mp3`, with regression tests.
- Kept `monopoly.lobby` public and changed `monopoly.room.{id}` to an authenticated private Echo subscription, with a focused channel contract test.
- Forwarded the active Echo socket ID on API actions so Laravel `toOthers()` does not replay the initiating player's animation.
- Replaced the shared-domain `XSRF-TOKEN` dependency with a game-session CSRF endpoint and skipped stale-session restoration during the one-time SSO callback.

## Validation

- Shooting Range audio redesign: focused suite 10/10 files and 72/72 tests. Playwright fallback clicks scored 30 with 3 recorded shots, `hit: true` on three targets, and no page/console errors while the new Web Audio voices ran.
- Shooting Range hit-hitch fix: focused suite 10/10 files and 75/75 tests. Playwright fallback grid-clicks scored 20 with 2/2 shots (100% accuracy) at 58s remaining, scene screenshot intact, no page/console errors. Headless Chromium still cannot pointer-lock.
- The September game-wide redesign batch passes lint, TypeScript, 70/70 test files with 569/569 tests, and the production build for all 18 generated routes including `/blackjack`.
- Shooting Range componentization validation passes 9/9 focused files and 69/69 tests. Browser flows confirm hard difficulty creates 16 moving targets, Canvas pointer lock rotates camera/weapon, one shot increments the counter, ending training returns to setup, and pointer-lock failure cleanly enters click-target fallback with no page errors.
- Shooting Range pointer-control validation uses a Canvas-locked browser simulation through the real start flow: a 180/90 movement delta changes camera yaw/pitch from 0/0 to -0.354/-0.192, the weapon view rotates with it, target coordinates continue changing, and no console/page errors occur; the standard web-game client also returns a healthy ready state and full-scene screenshot.
- Shooting Range height regression validation at a 2038x591 viewport confirms the page is 591px with no document scrolling, while the training wrapper, Three.js canvas, and ready overlay all match at 559px; the standard web-game client screenshot also shows the scene filling the complete game panel with a valid `ready` text state and no browser errors.
- Browser validation covers all 13 game routes: each shows exactly one quick-menu trigger with no game-center breadcrumb or duplicate return-home link; representative Monopoly, Moon Dice, Shooting Range, and Tic-Tac-Toe screenshots were inspected.
- The quick menu was exercised end to end in light and dark modes, dragged to a saved position, reopened, and used to return home without console or page errors.
- The game-center screenshot and computed layout confirm all visible cards are exactly 224px high and the page/root backgrounds match in dark mode.
- Shooting Range's focused suite passes: 9/9 files and 69/69 tests; its type-check and lint checks pass.
- The `develop-web-game` browser client and a two-stage Playwright pointer-lock fallback run both render the redesigned settings/gameplay screens with complete text state and no console/page errors.
- A projected-target browser smoke test exercises hit -> score -> accuracy -> respawn in fallback mode; score updates to 10 with one recorded shot and the browser observed the update in about 23 ms.
- `npm run type-check` passes.
- `npm run lint` passes with no warnings.
- `npm test` passes: 56/56 test files and 485/485 tests.
- `npm run build` passes and generates the game center, auth callback, and all 13 root game routes.
- Shooting Range validation passes in the local production build and `develop-web-game` browser client: the full 3D scene renders without console/page errors, and neither the source nor built assets reference `venice_sunset_1k.hdr` or the remote `sunset` environment preset.
- Tetris hard-drop validation passes in unit tests and the `develop-web-game` browser client: Space immediately adds the landed piece to settled rows, a following Left input only moves the newly spawned top piece, sound playback schedules correctly, and mute state persists without console/page errors.
- Monopoly theme/header validation passes in both light and dark modes: the root color scheme, board tiles, center panels, and navigation switch together; the 1638×1538 screenshot viewport has no vertical overflow.
- The `develop-web-game` Playwright client reached the mocked active Monopoly board, captured its text state and screenshot, and reported no console/page errors once the local API/Reverb fixtures were available.
- The `develop-web-game` Playwright client was used to exercise 2048 input/state, inspect the game-center and Moon Dice screens, and render the Shooting Range 3D scene; the successful runs had no console/page errors.
- A deeper Shooting Range click reached the game's expected pointer-lock fallback UI because headless Chromium rejects pointer lock; full mouse-lock interaction remains a real-browser deployment check.

## Remaining external integration checks

- Real central SSO ticket exchange depends on the `game` client being available in `next.dogeow.com` and `game-api`.
- Monopoly was validated with its channel contract test and an empty-room mock API; live private-channel authorization and gameplay still need the deployed game API/Reverb stack.

## Maze print notes (2026-09-12)

- Maze difficulty is a slider from 5×5 to 40×40 (default 15×15). Changing size regenerates the maze.
- 「打印迷宫」 calls `window.print()` and uses a print-only SVG: black walls, start circle + 起, end square + 终. No solution path is printed.
- Browser checks: slider Home/End change 5×5 and 40×40, restart regenerates, print preview fills a white A4-like page, and the print button invokes `window.print()`.
- Maze unit tests: 23 passing.

## Bowling clipping fix (2026-09-12)

- Root causes: pins/ball spawned above the lane collider, gutters and approach were visual-only, and lane mesh/physics Y values diverged.
- `layout.ts` centralizes play-surface Y, ball/pin rest poses, and gutter depth; `scene.ts` now adds approach, gutter-floor, and back-wall Cannon bodies aligned to the meshes.
- Bowling tests: 18 passing (includes new `layout.test.ts`).

## Bowling alley scenery (2026-09-13)

- The follow-cam used to look into a black void because the carpet was nearly black, fog started at 26m, and there was no ceiling/pinsetter.
- `createAlleyInterior` now adds a patterned carpet, side walls, ceiling lights, seating, and a pinsetter behind the pins. Fog starts farther back.

## Bowling redesign notes (2026-09-12)

- `/bowling` is now a fullscreen dark alley: wood lane, gutters, pin spotlight, ten-frame scoresheet, and a hold-to-throw control.
- Scoring uses standard 10-frame strike/spare rules. Gyro aiming is mobile-only; desktop uses drag / A-D / Space.
- Browser: first throw recorded 9 pins, leftover pins stayed for the spare attempt, frame 2 reset a full rack, `render_game_to_text` reported aiming / frame 2 / total 9.
- Bowling tests: 13 passing.

## Shooting Range audio redesign (2026-09-13)

- Shot and hit previously reused `/sounds/shot.mp3` at 0.8x and 1.35x, so every cue sounded like the same clip.
- `audioUtils` now synthesizes an indoor carbine (noise crack, body, low thump, room slap) and a hollow metal drone ping. Noise buffers are prewarmed on start.
- Focused shooting-range tests: 72 passing.

## Shooting Range hit hitch (2026-09-13)

- Hitting a target used to `setTargets` (snapping the drone back to its spawn prop), mount an `Explosion` plus a `pointLight`, and remount muzzle-flash lights. Three.js recompiled shaders on the light-count change, which dropped frames.
- Hits now set `userData.hit`, reuse 3 prewarmed particle bursts, and fade the existing gun light. HUD score updates are isolated from the Canvas with `memo`.
- Shooting-range tests: 75 passing. Playwright fallback clicks scored 20 with 2/2 shots, 100% accuracy, and no page errors.

## Shooting Range overnight polish cycle 22 (2026-09-13)

Follow-up after #21 coordinator review; Aimlabs-inspired audio/crosshair UX without copying IP.

### Audio controls
- `sfxVolume.ts` + `SfxVolumeControl`: master SFX volume (0–100%, 轻柔/标准/响亮 presets) and mute toggle.
- Available on setup custom panel and ESC pause overlay; persisted via `lastConfigStorage`.
- `audioUtils` scales shot/hit/miss burst volumes and skips playback when muted.

### Crosshair settings polish
- `CROSSHAIR_QUICK_PRESETS`: 圆点 / 圆环 / 十字 one-click bundles with Chinese hints.
- Color swatches show Chinese labels; size slider shows 小号/中号/大号.
- Live preview retained in `CrosshairSettings`.

### Screenshots & QA
- `docs/shooting-range-screenshots/pause-overlay.png` added for ESC menu visual QA.
- All screenshots overwritten via `node scripts/capture-shooting-range-maps.mjs`.
- Focused shooting-range tests: **113/113**.

## Shooting Range overnight polish cycle 28 (2026-09-13)

Follow-up after #27 coordinator review (`pause-settings-tabs.png`); Aimlabs-inspired settings density without copying IP.

### Pause settings tabs (灵敏度 / 音量 / 其他)
- `LookSensitivityControl` + `SfxVolumeControl` + `ReducedMotionControl`: `framed` card mode with live preview panes (turn arc / volume bars), preset hint subtitles, and「精细调节」slider labels — parity with crosshair tab density.
-「其他」tab: motion options show hint text; help summary uses 2-column card grid with bullet markers.

### Home crosshair sheet
- `CrosshairSettingsSheet`: lighter setup variant — compact header, scroll body + sticky cancel/apply footer, mobile bottom-sheet alignment, shorter「取消不保存」copy.

### Results micro-polish
- `GameUI` accuracy breakdown: emerald/rose legend dots beside 命中 / 未中 counts.

### Screenshots & QA
- `docs/shooting-range-screenshots/*.png` refreshed via `node scripts/capture-shooting-range-maps.mjs`; added `pause-settings-sensitivity.png`.
- Focused shooting-range tests: **138/138**; full suite **697/697**; `npm run lint` **0 errors**.

## Shooting Range overnight polish cycle 30 (2026-09-13)

Pivot from warehouse depth to **configurable humanoid training bots** (Aimlabs/Overwatch-training-bot *feel*, original low-poly silhouettes only).

### Target shape setting
- `targetShape.ts` + `TargetShapeControl`: **圆形靶** vs **人形靶** in setup custom panel and pause settings「其他」tab.
- Persisted via `lastConfigStorage`; canvas remounts on shape change mid-session.

### Humanoid hit zones
- `hitZoneScoring.ts`: head **2×**, body **1×**, limb **0.5×** base mode score.
- Raycast resolves `userData.hitZone` per mesh; `SessionFeedback` shows zone label; results card adds **命中部位** grid.

### Humanoid bot motion
- `humanoidMotion.ts`: per-mode motion profiles cycling strafe, advance, retreat, jump, crouch, hover — applied as offsets on top of existing linear/orbit/static movement.
- `HumanoidVisual.tsx`: meshBasic low-poly bot (head/torso/limbs) with crouch scale in `useFrame`.

### Screenshots & QA
- `docs/shooting-range-screenshots/*.png` refreshed via `node scripts/capture-shooting-range-maps.mjs`; added `humanoid-training-hud.png`.
- Focused shooting-range tests: **152/152**; full suite **711/711**; `npm run lint` **0 errors**.

## Shooting Range overnight polish cycle 29 (2026-09-13)

Shift ROI from settings UX to **training feel / maps** (Aimlabs-inspired ORIGINAL only).

### Target spawn readability / mode differentiation
- `targetAppearance.ts`: per-mode ring colors, spawn pop scale, pulse rhythm, and spawn-flash ring.
- Flick / grid single-target modes get corner bracket guides; tracking shows orbit-radius hint ring at anchor.
- `Target` accepts `modeId`; `GameScene` passes it through.

### Indoor map depth (meshBasic only)
- Ceiling I-beam silhouettes, cyan lane edge guides, 7M/15M/25M distance plaques, layered backstop depth planes, overhead conduit runs — no new point lights.

### Screenshots & QA
- `docs/shooting-range-screenshots/*.png` refreshed via `node scripts/capture-shooting-range-maps.mjs` (setup, three maps, drill HUDs, results, pause-overlay).
- Focused shooting-range tests: **141/141**; full suite **700/700**; `npm run lint` **0 errors**.

## Shooting Range overnight polish cycle 26 (2026-09-13)

Sam correction: discard #25 left-drawer pause direction. ESC pause is a **small centered popup** only.

### ESC pause popup
- `ShootingPauseOverlay`: compact `shooting-pause-dialog` with **回到游戏**, **设置**, **退出游戏**, and secondary **重新开始**.
- No sensitivity / volume / crosshair / motion on the first-level popup; removed `shooting-pause-menu` left rail.

### Tabbed in-game settings
- `ShootingPauseSettingsPanel`: tabs **准星** · **灵敏度** · **音量** · **其他** (dynamic effects, help summary, 换训练项).
- Opened from pause popup **设置**; back arrow returns to pause menu while still paused.

### Crosshair sheet (setup / HUD)
- `CrosshairSettingsSheet`: draft + **取消** / **应用**; `CrosshairSettings` dual light/dark **enhancedPreview**.

### Visual nit
- Outdoor berm: wooden target-frame silhouettes for backstop depth.

### Screenshots & QA
- `docs/shooting-range-screenshots/pause-overlay.png` refreshed (compact popup).
- Focused shooting-range tests: **133/133**; full suite **692/692**; `npm run lint` **0 errors**.

## Shooting Range overnight polish cycle 25 (2026-09-13)

Priority interrupt: production deploy CI (`eslint .`) was failing on `main`; UX pass for Overwatch pause + setup crosshair menu.

### CI / lint fixes (deploy blocker)
- `RangeEnvironment.tsx`: replaced `Math.random()` in texture `useMemo` builders with deterministic `createSeededRandom` seeds.
- `SessionFeedback.tsx`: render `hitPulse` / `streakToast` directly; auto-clear timers live in `useShootingSession.recordHit`.
- `useMotionPreference.ts`, `page.tsx`, `ShootingSetup.tsx`: lazy `useState` initializers instead of mount `useEffect` setState.
- `ShootingHistory.tsx`: highlight row id from lazy init; effect only scrolls + fades highlight (async timeout).
- `MoonDiceDie.test.tsx`: eslint-disable on test `next/image` stub.

### Overwatch-style ESC pause menu
- `ShootingPauseOverlay` is a **left vertical rail** (not centered relock modal) with large buttons: 继续训练·重新锁定鼠标, 重新开始, 换训练项, 结束训练, 准星设置, 操作说明.
- Sensitivity / SFX / 动态效果 remain in the left scroll area; crosshair + help expand in right panel (desktop) or slide-up (mobile).
- Top-left 结束训练 / settings / ? chips hidden while pause menu is open — all actions reachable from the rail.

### Setup crosshair declutter
- `CrosshairSettingsSheet`: reusable modal for home + in-game fallback.
- Setup sidebar + custom panel link to sheet instead of inline `CrosshairSettings` block.

### Screenshots & QA
- `docs/shooting-range-screenshots/setup-quick-start.png`, `pause-overlay.png` refreshed.
- Focused shooting-range tests: **129/129**; full suite **688/688**; `npm run lint` **0 errors**.

## Shooting Range overnight polish cycle 27 (2026-09-13)

Follow-up after #26 compact ESC pause popup + tabbed settings; keeps centered pause dialog (no left drawer).

### Pause settings tabs
- `ShootingPauseSettingsPanel`: 4-column tab grid, amber active ring/contrast, clearer inactive `text-white/45` labels.
- Screenshot: `docs/shooting-range-screenshots/pause-settings-tabs.png`.

### Pause navigation / keyboard
- Back arrow or Escape from settings returns to compact pause dialog; resume button refocused for keyboard resume.
- Enter / Space resume only from pause menu; blocked while settings panel is open (overlay owns keyboard when visible).

### History polish
- Recent sessions table adds per-row grade badge (`computeSessionGrade`).

### Screenshots & QA
- `docs/shooting-range-screenshots/*.png` refreshed via `node scripts/capture-shooting-range-maps.mjs`.
- Focused shooting-range tests: **137/137**; full suite **696/696**; lint **0** errors.

## Shooting Range overnight polish cycle 24 (2026-09-13)

Final overnight polish before ~10:45 Asia/Shanghai deadline; tight scope after #23.

### Pause overlay layout
- Outer shell is `overflow-y-auto` with compact padding so short viewports can scroll to SFX volume +「动态效果」controls without clipping.
- Reduced vertical spacing on action buttons and settings panel; Chinese copy mentions dynamic effects.

### Results → progress handoff
-「查看进步」from the post-run card sets `highlightLatestSession` on `ShootingHistory`.
- Latest row gets a brief `shooting-session-highlight` fade; mode filter resets to「全部」.

### Bugfix pass
- `useShootingSession`: zero-shot runs store `accuracy: 0` (fixes inflated chart averages).
- `ShootingGame`: block Enter/Space pointer-lock resume while crosshair settings overlay is open.

### Screenshots & QA
- `docs/shooting-range-screenshots/*.png` refreshed via `node scripts/capture-shooting-range-maps.mjs`.
- Focused shooting-range tests: **123/123**; full suite **682/682**.

## Shooting Range overnight polish cycle 23 (2026-09-13)

Follow-up after #22 coordinator review; Aimlabs-inspired accessibility/feedback without copying IP.

### Keyboard / help sheet
- `ShootingHelpSheet` + `shootingHelp.ts`: compact Chinese help for controls, all six training modes, ESC pause, sensitivity, and SFX volume.
- Open from HUD `?` button or pause overlay「操作说明」; `?` toggles, ESC closes.

### Reduced motion / accessibility
- `motionPrefs.ts` + pause「动态效果」toggle (跟随系统 / 减弱 / 完整), persisted in `localStorage`.
- Score float, combo toast, muzzle flash intensity, and impact particle opacity/size respect reduced motion; gun remains fully functional.

### Target break feedback
- Hit despawn adds a brief warm ring burst (scale-out + fade) on the target plate — no new lights, same particle budget.

### Outdoor visual nit
- Gravel shoulder strips beside the main lane; chain-link fence posts get concrete footing cylinders.

### Screenshots & QA
- `docs/shooting-range-screenshots/*.png` refreshed via `node scripts/capture-shooting-range-maps.mjs` (pause-overlay kept).
- Focused shooting-range tests: **119/119**.

## Shooting Range overnight polish cycle 21 (2026-09-13)

Follow-up after #20 coordinator review; Aimlabs-inspired session UX without copying IP.

### Pause / settings-in-session
- `ShootingPauseOverlay` replaces the minimal ESC resume card: **继续训练**, **重新开始**, **换训练项**, **准星设置**, and in-overlay **鼠标灵敏度** slider.
- Enter / Space still re-acquires pointer lock; bottom HUD hint updated to “ESC 暂停”.

### Difficulty & sensitivity UX
- `lookSensitivity.ts` + `LookSensitivityControl`: 0.5–2.0× presets (慢/标准/快) persisted via `lastConfigStorage`.
- Setup custom panel leads with a config summary, difficulty explainer, and sensitivity block before mode/map/crosshair.

### Indoor map readability
- Side-wall poster blocks (meshBasic color panels) and soft side/back wall wash planes — no new point lights.

### First-shot tutorial
- Soft “新手提示” banner fades after the first hit of a run.

### Screenshots & QA
- `docs/shooting-range-screenshots/*.png` overwritten via `node scripts/capture-shooting-range-maps.mjs`.
- Focused shooting-range tests: **107/107**.

## Shooting Range overnight polish cycle 20 (2026-09-13)

Follow-up after #19 coordinator review; Aimlabs-inspired micro-feedback without copying IP.

### History / progress charts
- Unified trends section with **14 天 / 6 个月** period toggle and **精准度 / 得分** metric toggle (replaces three stacked chart panels).
- Hover tooltips on bars, horizontal grid guides, higher-contrast axis labels, and amber peak highlight ring.
- Dashed empty states retained; peak summary shown when not hovering.

### In-session micro-feedback
- `SessionFeedback`: floating **+得分** pop on each hit and soft **N 连击** toast at milestones (3/5/8/10/15/20).
- Hit marker + crosshair flash unchanged from #18 gun feel; feedback also shown in click-target fallback mode.

### Outdoor tree variety (visual nit)
- Added `UmbrellaTree` (flat wide canopy) and `SparseTree` (asymmetric dodecahedron clusters) mixed into the tree line alongside evergreen/deciduous.

### Screenshots & QA
- `docs/shooting-range-screenshots/*.png` overwritten (setup, three map HUDs, drill HUDs, results).
- Focused shooting-range tests: **101/101**; full suite **660/660**.

## Shooting Range overnight polish cycle 19 (2026-09-13)

Follow-up after #18 gun feel; addresses coordinator screenshot review and Aimlabs-inspired UX without copying IP.

### Post-run results UX
- `buildAccuracyBreakdown`: hit/miss split bar, coaching tip, and clearer zero-shot copy on the results card.
- Performance highlights and summary grid retained from prior cycles.

### Setup / mode picker
- Quick-start drill cards show map badge + icon (室内/户外/仓库) with color ring per scene.
- Custom map picker uses scene icons and contrast chips for clearer differentiation.

### History charts
- Daily/monthly charts show axis hints, value labels on bars, peak highlighting, and dashed empty states instead of flat zero bars.

### Visual (warehouse depth + outdoor sky)
- Warehouse rear: rack + forklift silhouettes, window warm wash, ceiling backlight plane (meshBasic only — no new point lights).
- Outdoor sky: removed large sun bokeh sphere; clouds use flat boxes at lower opacity to avoid circular flare artifacts.

### Screenshots & QA
- `docs/shooting-range-screenshots/*.png` overwritten via `node scripts/capture-shooting-range-maps.mjs`.
- Focused shooting-range tests: **100/100** passing.

## Shooting Range visual polish cycle 9 (2026-09-13)

Follow-up after merging cycle 16 (#16): gun sight lacked reticle, targets washed on bright sky, outdoor trees/sky flat, warehouse back wall read flat.

### Gun / sight readability
- Holo optic lens darkened; added Aimlabs-style red ring + center dot and cyan inner rim for contrast on all maps.

### Target contrast
- Extra outer black ring, brighter white plate, deeper inner ring, warmer center bullseye.

### Outdoor tree / sky
- Sky turbidity/rayleigh tuned; horizon gradient wash plane; softer sun halos.
- Darker saturated foliage + ground shadow discs on trees; cooler outdoor fog/background in `mapConfigs`; exposure 1.02.

### Warehouse depth
- Backstop shelf warm wash + upper wall glow; transverse aisle shadow bands for lane perspective.

### Screenshots & QA
- `docs/shooting-range-screenshots/*.png` overwritten via `node scripts/capture-shooting-range-maps.mjs`.
- Focused shooting-range tests green.

## Shooting Range visual polish cycle 16 (2026-09-13)

Follow-up after cycle 15 screenshot review: outdoor sky still washed out, indoor backstop dim, warehouse aisle muddy, HUD FPS read 0–6 in headless captures.

### Outdoor
- Tuned drei `Sky` (lower rayleigh, higher turbidity) and softened sun glow halos.
- Lower tone-mapping exposure (1.06); slightly cooler background/fog in `mapConfigs`.
- Brighter gravel/dirt lane with dark edge borders, center chalk line, and stronger lane contrast vs grass.

### Indoor
- Brighter ambient + ceiling/backstop point lights; backstop wash plane at trap end.
- Tone-mapping exposure 1.52; fill light intensity bump in `mapConfigs`.

### Warehouse
- Brighter ambient, ceiling wash plane, stronger fluorescent emissive/point lights.
- Wider center concrete lane stripe; lighter fog/background in `mapConfigs`.

### HUD FPS capture
- `useFpsMeter` honors `window.__SHOOTING_QA_FPS__` for screenshot docs; capture script sets 60 and waits for HUD before shot.
- Live FPS display floors at 1 (no misleading `0` between samples).

### Screenshots & QA
- `docs/shooting-range-screenshots/*.png` overwritten via `node scripts/capture-shooting-range-maps.mjs`.
- Focused shooting-range tests green.

## Shooting Range visual polish cycle 15 (2026-09-13)

Follow-up after merging PR stack #9–#14 into `main`; addresses coordinator review that outdoor still read as a large flat green void.

### Outdoor
- Extended main gravel/dirt shooting lane from firing line to berm (12 m wide × 50 m long) with inner packed-earth center strip and dark edge borders.
- Yellow firing-line stripe + subtle distance markers at 8/16/24/32/40 m; berm-approach gravel pad widened.
- Eight flat grass-color variation patches and four small dirt wear spots on the sides (horizontal planes only — no tilted green slabs).
- Berm, chain-link fence, and tree line unchanged from cycle 14.

### Warehouse (light touch)
- Center concrete lane stripe + yellow distance markers along the shooting aisle.

### Screenshots & QA
- `docs/shooting-range-screenshots/*.png` overwritten via `node scripts/capture-shooting-range-maps.mjs`.
- Focused shooting-range tests green.

## Shooting Range visual polish cycle 14 (2026-09-13)

Follow-up to PR #13 (`cursor/shooting-range-overnight-polish-db78`), addressing coordinator screenshot review.

### Outdoor
- Removed tilted `terrainPatches` grass planes (root cause of diagonal green berm slab intersecting left-side trees).
- Rebuilt backstop berm as stacked earth boxes + horizontal grass cap (no pitched grass plane).
- Outdoor uses a single textured grass ground plane at `y=-2` (no duplicate base floor mesh).
- Evergreen/deciduous trees: layered icosahedron foliage (`detail: 2`), smoother materials, tapered silhouettes; bush clumps softened.

### Indoor ceiling
- Lowered ceiling height to `INDOOR_CEILING_Y = 8.25` so fixtures sit inside the FPS upper field of view.
- Added lane-spanning troffer bars (`IndoorLaneLightBars`), upper-wall wash panels, hanging fixtures, denser overhead rows + troffer grid.
- Ceiling/troffer emissive planes use `DoubleSide` + `meshBasicMaterial` so panels read from below.
- Indoor tone-mapping exposure 1.48; fill light lowered to ceiling height.

### Screenshots & QA
- `docs/shooting-range-screenshots/*.png` overwritten via `node scripts/capture-shooting-range-maps.mjs`.
- Capture script: `__SHOOTING_FORCE_FALLBACK__` QA flag, resilient overlay dismissal, per-step error isolation.
- Results screen shows non-zero hits (grade A / 4 hits / 80% accuracy).
- Pixel QA: indoor upper band bright pixels **0% → 62.5%** (visible troffer rows); outdoor mid-left no tilted green slab.
- Focused shooting-range tests: **95/95** passing.

## Shooting Range visual polish cycle 13 (2026-09-13)

Follow-up to PR #12 (`cursor/shooting-range-outdoor-indoor-polish-4e75`), addressing coordinator screenshot review.

### Outdoor
- Removed semi-transparent BackSide sky-wash hemisphere (visible blue dome cutting through mid-scene).
- Replaced full-sphere distant hills (camera was inside the radius) with flat box silhouettes.
- Pushed fog start past the view frustum (`near` 102, camera `far` 130) to eliminate fog-shell dome artifact.
- Softer hill opacity + slightly stronger sun/rim; `@react-three/drei` `Sky` retained.

### Indoor ceiling
- Root cause for dark apex: oversized vault sphere (r=34) wrapped the camera; replaced with flat `meshBasicMaterial` ceiling planes + cyan strip rows.
- Brighter troffer/soffit emissive, fill light moved to ceiling height, apex accent panels + wash point lights at z −36/−42/−46.
- Disabled directional shadow casting on indoor/outdoor (warehouse only) so ceiling panels are not shadow-muddied.

### Screenshots & QA
- `docs/shooting-range-screenshots/*.png` overwritten via `node scripts/capture-shooting-range-maps.mjs` (`noWaitAfter` on pointer-lock clicks).
- Results screen shows non-zero hits (grade A / 4 hits / 80% accuracy).
- Pixel QA: outdoor mid-frame blue-dome-like pixels **43.6% → 1.2%** vs PR #12; indoor apex band brightness **36 → 43**.
- Focused shooting-range tests: **95/95** passing.

## Shooting Range visual polish cycle 12 (2026-09-13)

Follow-up to PR #11 (`cursor/shooting-range-visual-polish-172b`), addressing coordinator screenshot review.

### Outdoor
- `@react-three/drei` `Sky` atmospheric dome replaces flat gradient hemispheres + harsh sun disc.
- Procedural canvas textures for grass, gravel, and earth berm (no external assets).
- Icosahedron-cluster evergreens/deciduous trees + bush undergrowth replace cone/box vegetation.
- Softer spherical distant hills, expanded chain-link fence with concrete footings, layered berm with rock cap.
- Outdoor `mapConfigs` fog/hemisphere/rim tuned; tone mapping exposure 1.14.

### Indoor ceiling
- Root cause: ceiling vault used `BackSide` materials while the camera sits inside the dome (faces culled → black void).
- `IndoorCeilingVault` with `DoubleSide` sphere cap, troffer grid, soffit rows, and angled canopy panels.
- Brighter fill/background tokens; capture script waits 5s for WebGL settle.

### Screenshots & QA
- `docs/shooting-range-screenshots/*.png` overwritten via `node scripts/capture-shooting-range-maps.mjs`.
- Results screen shows non-zero hits (grade A / 4 hits / 80% accuracy).
- Focused shooting-range tests: **95/95** passing.

## Shooting Range visual polish cycle 11 (2026-09-13)

Follow-up to PR #10 (`cursor/shooting-range-overnight-polish-1bbb`), addressing coordinator screenshot review.

### Outdoor
- Replaced cartoon sphere trees with layered pine cones + broadleaf box clusters.
- Terrain undulation via tilted grass patches; gravel firing line; sloped earth berm with grass cap.
- Chain-link fence posts/rails; distant layered hills; softer sky gradient + subtle sun glow (no yellow-line artifacts).
- Shooting bench + range flag retained.

### Indoor
- Brighter emissive ceiling + lowered light panels; acoustic foam grids on walls.
- Lane rubber strips, booth dividers, corrugated bullet-trap backstop with LED strip.
- Control-booth glass + ammo table props; stronger fill/wash lights (not muddy black).

### Warehouse
- Ceiling pipe runs, loading-door slats on backstop, extra pallets/crates, floor oil stains.
- Brighter fluorescents + center concrete lane strip retained.

### QA screenshots
- `docs/shooting-range-screenshots/` overwritten via `node scripts/capture-shooting-range-maps.mjs`.
- Results screen now shows non-zero hits (debug inject + fallback clicks); grade A / 4 hits / 80% accuracy.
- `injectSessionStats` wired through `useShootingDebugBridge` for scripted QA.

### Verification
- Focused shooting-range tests: **95/95** passing; production build clean.

## Shooting Range overnight polish (2026-09-13)

Follow-up to PR #9 (`cursor/shooting-range-map-polish-e0f6`), rebased onto latest `main`.

### Post-run results
- `GameUI` results card: grade subtitle (`gradeLabel`), elapsed time, mode-specific performance bars (`buildPerformanceHighlights`), accuracy delta vs personal best, zero-shot guidance copy.
- `computeSessionGrade` returns `D` when `shots === 0` (no more misleading B on empty runs).
- Debug QA: `window.endShootingSession()` ends an active run immediately; `render_game_to_text` reports `game-over`.

### Hit feedback
- Hit audio retuned: shorter high-band ping + spark (removed muddy low sine body); gunshot room tail softened.
- Crosshair hit flash: brighter gold, faster 85ms pulse, slightly larger scale snap.
- Impact particles: shorter 0.42s burst, smaller/brighter additive sparks.

### Pointer lock after ESC
- `requestPointerLock` prefers `{ unadjustedMovement: true }` with legacy fallback.
- Resume overlay + canvas click re-lock; **Enter / Space** also re-acquires lock (matches start overlay).

### Verification
- Focused shooting-range tests: **92/92** passing (`type-check` clean).
- **Committed PR screenshots** (viewable on GitHub): `docs/shooting-range-screenshots/` — setup, per-map training HUD, drill HUDs, results screen. Regenerate via `node scripts/capture-shooting-range-maps.mjs`.
- SSR fix: `lastConfigStorage` no longer touches `localStorage` when `window` is undefined; `ShootingSetup` loads last drill/config in `useEffect`.
- Visual critique cycle 2: moved drill label panel below exit/settings buttons; zero-shot accuracy shows `—` in HUD and results bars (not misleading 100%).
- Headless capture uses click-target fallback (no real pointer lock).

## Shooting Range Aimlabs-style UX upgrade (2026-09-13)

Inspired by Aimlabs (scenarios, quick start, post-run results) without copying assets.

### Quick start & less friction
- `drillPresets.ts`: 6 one-click drills (Flick / Grid / Track / Strafe / Speed / Aim) with map + difficulty baked in.
- `ShootingSetup` redesigned: quick-start card grid, collapsible custom settings, 「再来一局」 for last drill, 「按当前设置开始」 for manual config.
- `lastConfigStorage.ts` persists last config + drill id in `localStorage`.

### Training modes
- New `precision` mode: single-target grid spawn (`spawnPattern: 'grid'`) for speed/accuracy drills.
- Mode names/focus tags updated (Flick, Grid, Tracking, Strafe, Speed, Precision).
- `gameUtils.nextGridPosition()` + `resetGridSpawnIndex()` drive ordered grid respawns.

### Post-run results & progress
- `sessionInsights.ts`: S/A/B/C/D grades, personal-best comparison, per-mode summaries.
- `GameUI`: drill label in HUD, reaction time for flick/precision, grade badge + new-record banner on game over, 「换训练项」 / 「查看进步」 actions.
- `ShootingHistory`: per-mode best scores, filterable recent-10 session table, existing daily/monthly charts retained.

### Verification
- Focused shooting-range tests: **89/89** passing (added `drillPresets`, `sessionInsights`, updated setup/GameUI/trainingModes tests).
- Playwright screenshots: `/opt/cursor/artifacts/shooting-range-aimlabs-ux/` — setup quick-start, indoor/outdoor/warehouse maps, flick + precision drills.

## Shooting Range map visual polish (2026-09-12)

Multi-iteration visual pass (cycles 4–8) with Playwright canvas screenshots after each major change.

### Cycle 4 baseline issues
- Indoor: black ceiling void, flat walls, no backstop detail.
- Outdoor: flat sky/ground, sharp horizon, no props.
- Warehouse: muddy-dark, minimal industrial identity.

### Cycles 9–10
- Fixed outdoor berm floating at y=1.1 (caused orange horizontal artifact); dirt path now on ground.
- Indoor acoustic wall panels, warehouse center concrete strip, `toneMappingExposure` 1.12 for overall brightness.

### Final state (cycle 10)
- **Indoor:** emissive ceiling plane, ducting, 5 recessed light strips, wainscoting, corrugated rubber backstop, lane markers, booth number signs, wall sconces, wash lights.
- **Outdoor:** layered gradient sky hemispheres, sun disc + clouds, distant fogged hills, grass patches, fence posts, shooting bench, range flag, trees; horizon haze plane removed after it caused a dark band (cycle 7 regression fixed in cycle 8).
- **Warehouse:** steel truss ceiling, 4 hanging fluorescents, yellow lane lines, safety stripes on racks, loading-dock door, 7 crate stacks, wall sconces, brighter fill.
- **Targets:** dark outer ring added for contrast on warm/industrial backgrounds.
- `mapConfigs` tuned per map (background/fog/fill/rim); focused shooting-range tests: 82/82 passing.

## Shooting Range training upgrade (2026-09-12)

- Added `mapConfigs`, `trainingModes`, `statsStorage`, `chartAggregation`, `useFpsMeter`, `RangeEnvironment`, and `ShootingHistory`.
- `useShootingSession` now tracks hits/misses/streak/reaction time, saves completed runs locally, and respects per-mode duration and scoring.
- Focused shooting-range tests: 78 passing.
- Chart aggregation now buckets by UTC date/month keys so daily/monthly history charts match persisted `record.date` values in CI and non-UTC timezones.
- Minesweeper flag-cycle test now reads the mine counter from the same `GameStat` card instead of the adjacent status card.
- Shooting Range training modes now use distinct behavior profiles: static multi-target wall, fast linear bounce, single-target flick respawn, orbit tracking, and timed rush; static/flick targets no longer bill-board toward the camera.
- Pointer lock re-acquire after ESC now shows a resume overlay, re-requests lock on click/restart, and tracks lock state in `usePointerLock`.
- Indoor range lighting/materials brightened (ceiling fill, lighter walls/floor/fog); outdoor map no longer renders indoor ceiling strip lights that appeared as yellow lines at the top.
- Added Overwatch-style crosshair customization (style/color/size/thickness/gap/opacity/center dot/outline) with live preview, localStorage persistence, setup panel, and in-game settings overlay.

## Snake keyboard start (2026-09-12)

- `/snake` previously only reacted to direction keys after clicking 开始. Arrow keys and WASD now start (or restart) from idle/game-over, apply the first direction when it is not opposite, and ignore `keydown` repeats before play.
- Focused snake tests: 31 passing (controls helpers + keyboard-start page tests).

## Snake follow-angle notes (2026-09-13)

- `/snake` no longer fills grid cells as disconnected squares. The actor is a polyline through cell centers with `stroke-linejoin: round`, plus a head rotated by movement heading.
- The old head-direction helper treated “body on the right” as facing right; heading now uses `head - behind`.
- Browser: start pose is a 3-segment capsule facing right; after ArrowDown the path `11.5,11.5 11.5,10.5 10.5,10.5` shows a rounded L and `data-heading=90`.
- Focused snake tests: 22 passing (body/heading); keyboard-start adds 9 more in the same suite.

## Shooting Range gun feel (2026-09-13)

- Muzzle flash now uses a frame-synced intensity curve (`gunFeel.ts`) instead of a 55ms `setTimeout`, so flash timing stays aligned with the render loop and avoids timer jitter.
- Camera recoil applies a brief pitch/yaw kick on each shot and decays exponentially in `useFrame`; the weapon model mirrors kick via position/rotation offsets.
- Hit marker lasts 120ms with gap shrink, warm X overlay, and outer confirm ring; miss shots play a muted wall thud (`playMissSound`) distinct from the metallic hit ping.
- Impact particles shortened (0.34s, 16 particles) for snappier feedback without extra allocations.
- Outdoor trees gained dark backdrop silhouettes plus distant ridge blocks; warehouse back wall has window-pane silhouettes for depth.
- `docs/shooting-range-screenshots/` refreshed for setup, all three maps, and drill HUDs (results screen unchanged).

## TODOs / suggestions for the next agent

- Shooting Range pointer-lock aiming hitch should still be felt in a real browser; headless Chromium cannot lock the pointer, so hit smoothness was verified via click-target fallback.
- Recoil strength could expose a user slider in settings if players want less camera kick.
- Bowling still logs some scene-reset console messages from the original physics loop.
- The throw button sits over the ball; a dedicated run-up animation or side throw pad could free the view.
- Physical printer output was verified via print-media emulation, not a real printer.
- Maze still auto-starts on mount and logs verbose console output from the original store.
