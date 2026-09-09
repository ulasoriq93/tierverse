# Tierverse V1.3.2 QA Notes

## Typography hotfix
- Fixed Rounded and Tech resolving to the same font on Windows when Arial Rounded/Avenir Rounded were unavailable.
- Rounded keeps the softer Trebuchet-based offline fallback.
- Tech now prefers Bahnschrift / DIN-style condensed faces, with distinct fallbacks.
- Modern remains the default.
- Service-worker cache bumped so the CSS fix is not masked by an old cached stylesheet.

## Previous V1.3.1 QA Notes

## Added in 1.3.1 — Bulk Editing Update
- Tier order is locked in the editor. Existing tiers can still be renamed/recolored/deleted, but cannot be moved up/down.
- New tiers can be inserted at a chosen position (top or below any existing tier).
- Multi-select mode for ranking items.
- Select a whole tier or all currently visible/search-matching items.
- Bulk Move Up / Move Down / Move To Tier / Delete actions.
- Quick per-item up/down controls for one-step adjustments without opening the item modal.
- Bulk tier moves update every item's movement history, move count and net movement while creating one grouped activity event and one undo step.
- Batch Add now offers Keep All or Skip Duplicate Names.
- Autosave health indicator in the editor header.
- Font choices are now Modern / Rounded / Tech. Modern remains the default; legacy `system` font settings normalize to Modern.
- Locked-tier indicator added to the board and editor metadata.

## Automated checks run for this build
- Classic browser bundle rebuilt from module sources.
- Bundle scan confirms no executable ES-module `import`/`export` syntax leaked into the classic script.
- `node --check js/app.bundle.js` passed.
- Classic bundle executed in a DOM-stub runtime and confirmed to render the Library shell.
- Bulk move logic tested with five selected items: B → A and then A → D; tier IDs, moveCount and netMovement were verified.
- Rounded font setting persistence tested; legacy `system` font normalization to Modern verified.
- Service-worker cache version bumped to 1.3.1.
- ZIP integrity test performed after packaging.

## Manual checks recommended
- Select mode with 50–100 items on desktop and mobile.
- Select Tier and Select Visible while an editor search is active.
- Bulk move with a mixed selection from several different tiers.
- Undo/redo immediately after a bulk move or bulk delete.
- Add a custom tier at several positions and confirm existing tier order never changes unexpectedly.
- Rounded font appearance on your Windows/browser setup (the stack is offline-safe and falls back gracefully).
- GitHub Pages PWA install/offline behavior.

## v1.3.3
- Added repeatable local build pipeline (`build.cjs`, `npm run build`, and Windows `build.bat`).
- Build now syntax-checks the classic bundle and rejects leftover ESM module syntax.
- Build automatically bumps the service-worker cache key and verifies required PWA assets.
- Sidebar brand mark now uses the Tierverse app icon instead of the temporary “TV” text mark.


## V1.3.4 source-loading hotfix
- Removed the generated app bundle/build step.
- `index.html` now loads the existing source files directly, in dependency order.
- Editing `data/config.js` or any file under `js/` only requires Save + browser refresh.
- Service-worker precache now targets the source files instead of `app.bundle.js`.
- No product features or UI behavior were intentionally changed in this release.
