# Shooting range visual contract — 2026-09-19

## Direction

A quiet, purpose-built training facility: warm white concrete, graphite/olive structure,
painted orange identification, matte targets and a bevelled compact carbine. UI uses
one type hierarchy, restrained borders and an unobstructed central aiming region.

The three environments share a floor at -2m and a camera at 1.6m. The indoor ceiling
is above the existing target limit. All pillars, containers and fences stay outside
the playable target corridor. No transparent wall or support enters the firing lane.
No network textures or fonts are required for the new scenes. A material family of
architectural boxes uses one instanced draw call; the outdoor forest is instanced.

## Components

- `ShootingSetup`: responsive training catalogue, local history/settings entry points.
- `RangeEnvironment`: explicit indoor, outdoor and warehouse placement plans.
- `RangePrimitives`: shared instanced structure and local canvas-rendered signage.
- `RangeLandscape`: seeded low-frequency ground texture, mountain silhouette and forest.
- `GunModel`: dimensioned bevelled profiles, open trigger guard, receiver and sight.
- `RangeDiagnostics`: development-only material and camera inspection.

The image has no bloom, screen-space effects or shadow-map passes. The final view is
also the no-post baseline. DPR remains bounded at 1–1.5. The retained compromise is
stylized lighting without dynamic contact shadows, keeping the hit path inexpensive.

## Reproduction

Run `npm run dev`, then `node scripts/verify-range-design.mjs`.
The script mocks only authentication, uses seeds 20260919 and 819, records viewport,
renderer/device information, frame intervals, object budgets and gameplay state.
It captures all three maps, outdoor night, humanoids, a real raycast hit and results;
also normals/wireframe, camera Z = -5 / 0 / 4 and 390px/820px responsive layouts.

For hardware rendering on macOS:

```sh
HEADED=1 BROWSER_CHANNEL=chrome OUT_DIR=output/range-redesign-gpu node scripts/verify-range-design.mjs
```

Do not force a fake FPS value. The existing screenshot helper can inject 60 FPS;
the new verifier deliberately does not. Frame cadence is not GPU execution time.
GPU query time and VRAM consumption are not measured. Shader compilation is excluded
by warming up before the 90-frame sample. Visually inspect the PNGs as well as JSON.

The validated preview set is in `shooting-range-redesign/`. At 1440×900 / DPR 1 on
Chrome's Apple M3 Pro Metal backend, median frame cadence was 8.3ms and P95 was
8.5–9.2ms. Circle scenes used 138–150 draws and 6.6–7.8k triangles; twelve humanoids
used 273 draws and 12.4k triangles. These are local-device observations, not a guarantee
for other hardware. Full validation passed 752 tests, lint, TypeScript and Next build.

Browser pointer-lock acceptance still needs a real user gesture. Fallback raycasts
and UI transitions are automated; simulated lock events can exercise mouse movement
and pause/resume behavior without pretending the browser granted native lock.

## Weapon controls — 2026-09-20

`1` selects the pistol, `2` the sniper; the mouse wheel cycles between them. Hold the
right mouse button to aim and release it to return. Base vertical FOV is 62°, pistol
aim is 44° (~1.5×), sniper aim is 16° (~4.3×). Scoped view has a black exterior mask,
centered horizontal/vertical tick marks and no weapon/normal HUD. Scoring still uses
the actual camera-center ray, including during zoom transitions.

`WeaponAimCamera` owns projection and restores it on disposal. Zoom follows a
frame-independent exponential transition; pointer sensitivity follows the actual FOV.
`useWeaponControls` gates input to active gameplay and clears held aim on switch,
pause, pointer release, blur and visibility changes. The pistol retains the existing
132ms cooldown; the sniper uses 700ms. Both models remain mounted and only their
visibility changes; the view light stays mounted even inside the scope.

Run `BROWSER_CHANNEL=chrome node scripts/verify-range-weapons.mjs` for the input,
projection, scope visibility, center-hit and pause/restore regression sequence.
