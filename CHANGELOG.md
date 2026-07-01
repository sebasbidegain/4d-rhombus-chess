# 4D Rhombus Chess — Android Changelog

---

## v2.0 — 2026-06-27
**File:** `rhombuschess-v2.0-debug.apk`

### Premium Graphics Upgrade (PBR)
- **Cinematic render pipeline** — added sRGB output encoding + ACES Filmic tone mapping (exposure 1.15) and soft (PCF) shadows. Colours now render in the correct colour space with filmic highlight roll-off instead of clipping to flat white.
- **Real-time studio reflections** — a soft studio-gradient environment map is generated in-browser at startup (via `PMREMGenerator`, no external files, fully offline / `file://`-safe) and applied as `scene.environment`. Every metallic and glossy surface now shows realistic reflections.
- **Reflective materials** — added `envMapIntensity` to all piece and board materials (pieces 1.4, crowns/orbs 1.6, board tiles 0.7–0.8) and gave crowns/queen-orbs proper metalness. Gold reads as polished brass, marble/ceramic pieces gain soft realistic shading, glass/crystal themes catch light.
- Applies to **both** the desktop (`index-game.js`) and mobile (`easier-game.js`) games; all 7 themes benefit. No gameplay changes.
- Verified in-browser on both builds (Trooper, Greek, Robot) with no new console errors.
- **Board look preserved** — after tuning, the studio reflections are applied to the *pieces only*; the board tiles keep their original dark, high-contrast appearance (the global tone-mapping/sRGB grade was reverted because it washed out the board).

### Bug Fix — shadows bleeding through the board
- Piece shadows from the single directional light were passing through the gapped, stacked board and darkening every level below. Replaced the real directional shadow (`sun.castShadow=false`) with a **fake contact shadow** — a soft radial-gradient disc parented under each piece — so every piece is grounded on its *own* level with zero bleed to lower boards. Applies to both games.

### Bug Fix — dead inline buttons (CSP regression)
- The v1.8 security hardening removed `'unsafe-inline'` from the `script-src` CSP, which also silently disabled every inline `onclick="…"` handler in the HTML. This broke the tutorial **GOT IT** button, the puzzle **RETRY / NEXT / EXIT** buttons (both games), and all the sign-in/auth-modal buttons (desktop). Fixed by removing all 15 inline handlers and wiring the buttons via `addEventListener`/`onclick` in the external JS instead — CSP-compliant and functional. Verified GOT IT closes the tutorial on a real click.

---

## v1.9 — 2026-06-13
**File:** `rhombuschess-v1.9-debug.apk`

### Bug Fixes (from full frontend beta test)
- **Tutorial modal could trap the user (both games):** The first-run tutorial opened as a full-screen modal that intercepted all pointer events, so a player who didn't notice the GOT IT button was effectively stuck — no game buttons were clickable. Added the two standard dismiss patterns: **clicking the backdrop** (with an `e.target` guard so clicks inside the content don't close it) and **pressing Escape**. Verified 6/6 with Playwright.
- **Deprecated vertical-slider CSS (both games):** The level slider used soon-to-be-removed CSS — `appearance:slider-vertical` in easier.html (Chrome deprecation warning) and `writing-mode:bt-lr` in index.html (legacy syntax already removed from modern browsers, so the desktop slider was rendering incorrectly). Replaced both with the WHATWG-standard `writing-mode:vertical-lr; direction:rtl`, so the high value (all levels) sits at the top. Verified: slider renders vertical, value drives level visibility correctly, deprecation warning gone.

### Project / Repository
- Added **LICENSE** (MIT) and **PRIVACY.md** (privacy policy) — required for app-store submission.
- Beta test completed on both desktop (`index.html`) and mobile (`easier.html`): all 7 themes render, full move + AI loop works, save/load works, camera and menu controls work.

---

## v1.8 — 2026-06-08
**File:** `rhombuschess-v1.8-debug.apk`

### Security Fixes (second pass — completing full audit remediation)

- **HIGH — `unsafe-inline` CSP eliminated:** All game JavaScript extracted from inline `<script>` blocks to external files (`js/easier-game.js` for Android/mobile, `js/index-game.js` for desktop). `script-src` CSP now reads `'self'` only — no `unsafe-inline`. The iOS single-file build re-inlines both Three.js and the game script at build time so it remains self-contained.
- **HIGH — admin.html innerHTML XSS sinks removed:** `renderUsersTable()` and `renderActivity()` fully rewritten using DOM API (`createElement`, `textContent`). No user data ever touches `innerHTML`. Eliminates the structural XSS risk identified in the audit.
- **HIGH — Firebase CDN SRI hashes added (index.html):** All three Firebase 10.12.0 CDN scripts now carry `integrity="sha256-..."` and `crossorigin="anonymous"` — browser will block execution if CDN delivers a tampered file.
- **MEDIUM — Admin localStorage fallback removed:** `loadLocalData()` no longer reads `rc_users` from localStorage or passes untrusted data to the table renderer. Shows a "Firebase not configured" error state instead, preventing poisoned localStorage data from reaching the DOM.
- **LOW — Android network_security_config.xml added:** Explicitly sets `cleartextTrafficPermitted="false"` at the OS level, referenced from `AndroidManifest.xml`. Blocks any future plugin or code from accidentally making HTTP connections.
- **Validation hardening:** `loadGame()` now also whitelists `data.theme` against `TKEYS`, coerces `data.vsAI` to strict boolean, and clamps `data.aiDepth` to integer 1–3. Prevents crafted save files from passing unexpected values into game logic.
- **Admin session improvements:** Named activity listeners (`_onActivity`) properly removed on logout; added 8-hour absolute session ceiling so no session can stay open indefinitely regardless of mouse movement.

---

## v1.7 — 2026-06-03
**File:** `rhombuschess-v1.7-debug.apk`

### Security Fixes (from full security audit)
- **CRITICAL — Save file prototype pollution (easier.html + index.html):** `loadGame()` now validates every field from `localStorage` before using it. Piece type must be in `{king,queen,rook,bishop,knight,pawn}`, colour in `{white,black}`, and all board indices are bounds-checked against the board dimensions. Previously a crafted save could inject `__proto__` as a piece type, pollute the prototype chain, or crash the game with out-of-bounds array access.
- **CRITICAL — Admin empty UID allowlist (admin.html):** When `ADMIN_UIDS` is empty the admin panel now hard-blocks with "Admin access not configured" instead of silently falling through to the local password fallback. Prevents accidental open-door deployment.
- **MEDIUM — Capacitor navigation allowlist:** Added `"allowNavigation": []` to `capacitor.config.json`. The WebView can no longer navigate to any external URL, eliminating the risk of a privileged WebView being redirected to an attacker-controlled page.
- **MEDIUM — Admin session listener leak (admin.html):** Activity listeners (`mousemove`, `keydown`) are now named functions and are properly removed on logout. Also added an **8-hour absolute session ceiling** — continuous mouse movement can no longer keep an admin session open indefinitely.
- **LOW — iOS originWhitelist (App.js):** Changed from `['*']` to `['file://']`. Prevents the WebView from following `javascript:`, `intent://`, or other non-file-scheme navigations in the local game context.

---

## v1.6 — 2026-06-03
**File:** `rhombuschess-v1.6-debug.apk`

### New Feature — GREEK MYTHOLOGY Theme
- **6 fully custom 3D characters** selectable via ⚡ GREEK on the start screen:
  - **Pawn → Greek Hoplite** — armoured soldier with bronze cuirass, Corinthian helmet with crest, round shield with gold boss, and spear
  - **Knight → Pegasus** — rearing winged horse with spread wings, raised front legs, and flowing tail
  - **Bishop → Artemis** — slender goddess with curved bow, arrow quiver on back, gold laurel wreath
  - **Rook → Poseidon** — massive muscular figure seated on marble rock, trident with 3 golden prongs, wild white beard and hair
  - **Queen → Athena** — tall warrior goddess in green robe, full Corinthian helmet with red plume, spear, bronze shield with Medusa face
  - **King → Zeus** — seated on marble throne, white robe, wild beard, gold crown with spikes, and iconic golden lightning bolt
- Board uses warm marble tones (cream & dark stone) for the Greek aesthetic
- White team: cream/marble bases; black team: dark obsidian bases

---

## v1.5 — 2026-06-03
**File:** `rhombuschess-v1.5-debug.apk`

### New Feature — POPEYE Theme
- **6 fully custom 3D characters** built in Three.js procedural geometry, selectable from the CHOOSE YOUR ARMY screen (🫒 POPEYE card):
  - **Pawn → Spinach Can** — iconic silver can with white label, green stars, and spinach dome on top
  - **Knight → The Bulldog** — sitting bulldog with floppy brown ears, jowls, collar, and grumpy expression
  - **Bishop → Wimpy** — round fat body, black bowler hat, red tie, and a hamburger in hand
  - **Rook → Bluto/Brutus** — massive wide torso, thick black beard, yellow pants, navy cap
  - **Queen → Olive Oyl** — tall thin figure, black flared dress, red blouse, white collar, hair bun
  - **King → Popeye** — stocky sailor with crossed forearms, anchor tattoo, pipe, and sailor hat
- Board uses an olive-green / dark forest colour scheme to match the cartoon aesthetic
- White team gets cream-coloured bases; black team gets navy bases — all characters retain their own colours
- All 5 existing themes (Trooper, Robot, Crystal, Medieval, Alien) are completely unaffected

---

## v1.4 — 2026-06-01
**File:** `rhombuschess-v1.4-debug.apk`

### UI Redesign — Button Layout & Panels
- **Buttons collapsed into submenu** — Tapping ☰ MENU now opens a panel containing all non-essential controls: 2 PLAYER, DIFFICULTY, THEME, NEW GAME, SAVE, LOAD, EXPORT, HELP, SCAN, and MAIN MENU. Only 3 buttons are permanently visible on the left (VS AI, RESIGN, ☰ MENU) and 5 on the right (TOP, SIDE, W.POV, B.POV, UNDO). Submenu closes automatically after any selection or tap outside.
- **MOVE LOG and CAPTURED panels moved down** — Were at `top:55px`, same level as the turn indicator, causing overlap. Moved to `top:112px` so they appear clearly below the turn/move row.
- **YOUR TURN status bar repositioned** — Was at `bottom:50px` (inside the button area). Moved to `top:90px` center (just below the turn indicator box) where it never overlaps buttons.
- **Hint text hidden** — The drag/zoom/tap hint was cluttering the bottom-right corner on mobile. Removed (players learn the controls quickly via tooltips).
- **SCAN explained** — Toggles a CRT scanline visual overlay (cosmetic effect). Now lives inside the ☰ MENU submenu.

---

## v1.3 — 2026-06-01
**File:** `rhombuschess-v1.3-debug.apk`

### Bug Fixes
- **Buttons overlapping in the centre of the screen** — After pressing Start, all game buttons were clustered in the middle of the screen and overlapping each other. Root cause: both button rows shared the same centre-anchored position. Fixed by splitting them to opposite sides of the screen: main game controls (`VS AI`, `2 PLAYER`, `MEDIUM`, `THEME`, `NEW GAME`, `RESIGN`, `MENU`) anchored to the **bottom-left**, and camera/utility controls (`TOP`, `SIDE`, `W.POV`, `B.POV`, `UNDO`, `SAVE`, `LOAD`, `EXPORT`, `HELP`, `SCAN`) anchored to the **bottom-right**. Each group is capped at `max-width: 45vw` so they can never meet in the middle regardless of screen size.

---

All changes to the Android APK are recorded here.
Format: version · date · what changed and why.

---

## v1.2 — 2026-06-01
**File:** `rhombuschess-v1.2-debug.apk`

### Bug Fixes
- **Button rows overlapping on mobile** — `#btns` and `#btns2` were two separate `position:fixed` elements only 34px apart. When buttons wrapped onto multiple lines (small screens), they would grow upward and crash into each other. Fixed by wrapping both rows inside a single `#btn-container` flex column so they always stack cleanly and can never overlap regardless of screen size.

---

## v1.1 — 2026-06-01
**File:** `app-debug.apk` *(not yet versioned at time of build)*

### Bug Fixes
- **App crash on launch (ClassNotFoundException)** — Critical package name mismatch between `build.gradle` (`com.rhombuschess4d.app`) and `MainActivity.java` (`com.rhombuschess.app` — missing `4d`). Android could not find the main activity class at startup, causing an immediate crash on any device. Fixed by creating `MainActivity.java` at the correct path (`com/rhombuschess4d/app/`) with the correct package declaration and deleting the old mismatched file.

### Accessibility & Quality (easier.html)
- **Tutorial dialog** — Added `role="dialog"`, `aria-modal="true"`, `aria-labelledby="tut-title"` for screen reader support.
- **Puzzle result dialog** — Added `role="dialog"`, `aria-modal="true"`, `aria-labelledby="puz-result-msg"`.
- **Keyboard activation** — Added `keydown` delegation handler so all `role="button"` elements respond to Enter and Space keys.
- **Level slider** — Fixed broken vertical orientation: replaced non-standard `writing-mode:bt-lr` with `-webkit-appearance:slider-vertical; appearance:slider-vertical` which is correctly supported on Android WebView.

### Security (admin.html — web only, not in APK)
- **UID allowlist bypass** — Empty `ADMIN_UIDS` array was incorrectly allowing all users through instead of denying them. Fixed logic to deny when list is empty.
- **Firebase error leakage** — Raw Firebase error messages were shown to the user (could expose internal details). Now shows sanitized messages only.
- **setInterval leak** — Session timeout interval was re-created on every login without clearing the previous one. Fixed with guard variables `_sessionInterval` and `_activityBound`.
- **Sign-out accessibility** — Sign-out element changed from `<span>` to `<button>` for proper keyboard and screen reader support.

---

## v1.0 — 2026-05-01 *(approx)*
**File:** `app-debug.apk` *(original build)*

### Initial Release
- 3D Rhombus Chess game wrapped in Android WebView via Capacitor.
- 7-level rhombus board (easier edition).
- VS AI and 2-player modes.
- Piece themes: Trooper, Robot, Crystal, Medieval, Alien.
- Puzzle mode with 7-level puzzles.
- Camera presets: TOP, SIDE, W.POV, B.POV.
- Move log, captured pieces panel, level slider.
- Save / Load / Export game state.
- Scan-line CRT visual effect toggle.

---

## How to bump the version for a new build

1. Open `android/app/build.gradle`
2. Increment `versionCode` by 1
3. Increment `versionName` (e.g. `"1.2"` → `"1.3"`)
4. Add a new entry at the top of this file describing what changed
5. Run the build — the APK will be named `rhombuschess-vX.X-debug.apk` automatically
# test
# test line

