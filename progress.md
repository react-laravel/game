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

## TODOs / suggestions for the next agent

- Shooting Range pointer-lock aiming hitch should still be felt in a real browser; headless Chromium cannot lock the pointer, so hit smoothness was verified via click-target fallback.
- Bowling still logs some scene-reset console messages from the original physics loop.
- The throw button sits over the ball; a dedicated run-up animation or side throw pad could free the view.
- Physical printer output was verified via print-media emulation, not a real printer.
- Maze still auto-starts on mount and logs verbose console output from the original store.
