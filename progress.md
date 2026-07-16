Original prompt: 开始实现前端，工作目录只限新目录 /Users/sam/Code/DogeOW/game，避免改 central。以 /Users/sam/Code/DogeOW/rpg 的 standalone Next/SSO/部署骨架为基础，迁移 /Users/sam/Code/DogeOW/dogeow/app/game 除 rpg 外的 12 个游戏、48 个测试、共享依赖/组件/资源；路由改为根路径（/2048、/monopoly 等），首页为游戏中心；moon dice 独立为 /moon-dice 并迁测试；认证沿用中央一次性 SSO，app id 改 game，API 指向 game-api。保留 develop-web-game 的 progress.md 要求。不要创建 GitHub repo、不要提交/推送、不要改服务器。

Current prompt (2026-07-15): 修复 `https://game.dogeow.com/monopoly` 浅色、深色表现不对应的问题，并为 Monopoly 增加自己的顶部导航栏。

Current prompt (2026-07-15): 修复 `/tetris` 空格硬降触底后仍能左右移动的问题，并增加游戏音效。

Current prompt (2026-07-15): 修复 `/shooting-range` 因 `venice_sunset_1k.hdr` 加载失败而无法进入的问题。

Current prompt (2026-07-16): 改善 `/shooting-range` 的 UI 和枪支外观，并修复击中目标时的画面卡顿。

Current prompt (2026-07-16): 统一游戏中心卡片高度和页面背景；以一个可拖动、可展开的全局悬浮按钮统一浅色/深色切换与返回首页，并移除各游戏自己的面包屑和全局返回控件。

Current prompt (2026-07-16): 修复 `/shooting-range` 选择难度进入训练后，3D 画布和准备遮罩没有撑满训练区域的高度问题。

## Current work

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

- Shooting Range height regression validation at a 2038x591 viewport confirms the page is 591px with no document scrolling, while the training wrapper, Three.js canvas, and ready overlay all match at 559px; the standard web-game client screenshot also shows the scene filling the complete game panel with a valid `ready` text state and no browser errors.
- Browser validation covers all 13 game routes: each shows exactly one quick-menu trigger with no game-center breadcrumb or duplicate return-home link; representative Monopoly, Moon Dice, Shooting Range, and Tic-Tac-Toe screenshots were inspected.
- The quick menu was exercised end to end in light and dark modes, dragged to a saved position, reopened, and used to return home without console or page errors.
- The game-center screenshot and computed layout confirm all visible cards are exactly 224px high and the page/root backgrounds match in dark mode.
- Shooting Range's focused suite passes: 6/6 files and 68/68 tests; its type-check and lint checks pass.
- The `develop-web-game` browser client and a two-stage Playwright pointer-lock fallback run both render the redesigned settings/gameplay screens with complete text state and no console/page errors.
- A projected-target browser smoke test exercises hit -> score -> accuracy -> respawn in fallback mode; score updates to 10 with one recorded shot and the browser observed the update in about 23 ms.
- `npm run type-check` passes.
- `npm run lint` passes with no warnings.
- `npm test` passes: 53/53 test files and 484/484 tests.
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
