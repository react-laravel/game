Original prompt: 开始实现前端，工作目录只限新目录 /Users/sam/Code/DogeOW/game，避免改 central。以 /Users/sam/Code/DogeOW/rpg 的 standalone Next/SSO/部署骨架为基础，迁移 /Users/sam/Code/DogeOW/dogeow/app/game 除 rpg 外的 12 个游戏、48 个测试、共享依赖/组件/资源；路由改为根路径（/2048、/monopoly 等），首页为游戏中心；moon dice 独立为 /moon-dice 并迁测试；认证沿用中央一次性 SSO，app id 改 game，API 指向 game-api。保留 develop-web-game 的 progress.md 要求。不要创建 GitHub repo、不要提交/推送、不要改服务器。

## Current work

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
- `npm test` passes: 50/50 test files and 477/477 tests.
- `npm run build` passes and generates the game center, auth callback, and all 13 root game routes.
- The `develop-web-game` Playwright client was used to exercise 2048 input/state, inspect the game-center and Moon Dice screens, and render the Shooting Range 3D scene; the successful runs had no console/page errors.
- A deeper Shooting Range click reached the game's expected pointer-lock fallback UI because headless Chromium rejects pointer lock; full mouse-lock interaction remains a real-browser deployment check.

## Remaining external integration checks

- Real central SSO ticket exchange depends on the `game` client being available in `next.dogeow.com` and `game-api`.
- Monopoly was validated with its channel contract test and an empty-room mock API; live private-channel authorization and gameplay still need the deployed game API/Reverb stack.
