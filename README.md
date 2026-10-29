# DogeOW Game Center

Standalone Next.js game hub for `game.dogeow.com`.

## Included games

- 2048, Blackjack, Bowling, Jigsaw Puzzle, Maze, Minesweeper and Monopoly
- Moon Dice, Picture Puzzle, Shooting Range and Sliding Puzzle
- Snake, Tetris and Tic-Tac-Toe

All routes live at the domain root, for example `/2048`, `/monopoly` and
`/moon-dice`. The former `/game/:path*` URLs redirect to their root-route
equivalents.

The hub supports category filters, Chinese/English search, favorites, recent
visits and light/dark themes. Favorites and visits stay in browser storage;
catalog links load games on demand. Shooting Range requires a desktop mouse
and keyboard. Arcade games pause or suspend autoplay when the tab is hidden.

## Boundaries

- Login uses a short-lived one-time ticket from `next.dogeow.com`.
- Browser API requests remain same-origin and Next proxies them to `game-api`.
- Only Monopoly has server-side state; the other games remain client-side.
- The existing 2.5D game remains available at `/moba` after production cutover.

## Local verification

```bash
npm ci
npm run type-check
npm run lint
npm test
npm run build
```
