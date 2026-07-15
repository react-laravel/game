Original prompt: 开始实现前端，工作目录只限新目录 /Users/sam/Code/DogeOW/game，避免改 central。以 /Users/sam/Code/DogeOW/rpg 的 standalone Next/SSO/部署骨架为基础，迁移 /Users/sam/Code/DogeOW/dogeow/app/game 除 rpg 外的 12 个游戏、48 个测试、共享依赖/组件/资源；路由改为根路径（/2048、/monopoly 等），首页为游戏中心；moon dice 独立为 /moon-dice 并迁测试；认证沿用中央一次性 SSO，app id 改 game，API 指向 game-api。保留 develop-web-game 的 progress.md 要求。不要创建 GitHub repo、不要提交/推送、不要改服务器。

Current prompt (2026-07-15): 修复 `https://game.dogeow.com/monopoly` 浅色、深色表现不对应的问题，并为 Monopoly 增加自己的顶部导航栏。

Current prompt (2026-07-15): 修复 `/tetris` 空格硬降触底后仍能左右移动的问题，并增加游戏音效。

Current prompt (2026-07-15): 修复 `/shooting-range` 因 `venice_sunset_1k.hdr` 加载失败而无法进入的问题。

## Current work

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
