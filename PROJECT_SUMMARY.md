# 4D Rhombus Chess — Project Summary

> A 3D, multi-level chess game rendered in Three.js (WebGL). The board is a
> rhombus-shaped stack of levels — pieces move across each level *and* up/down
> between levels. One codebase ships to desktop, Android, and iOS.

**Repository:** https://github.com/sebasbidegain/4d-rhombus-chess
**Latest release:** v1.9 (store-ready signed builds)

---

## Platforms

| Platform | Entry point | Board | Build system |
|----------|-------------|-------|--------------|
| Desktop (browser) | `www/index.html` | 15 levels | none — open directly |
| Android | Capacitor wrapper (`www/easier.html`) | 7 levels | Gradle → APK / AAB |
| iOS | Expo / React Native WebView (inlined `easier-ios.html`) | 7 levels | EAS (simulator builds only so far) |

---

## Gameplay Features

- **Full chess rules** — castling, en passant, pawn promotion, check / checkmate detection, stalemate
- **VS AI** — minimax engine with Easy / Medium / Hard difficulty
- **2-player local** — pass-and-play on one device
- **Puzzle mode** — preset tactical puzzles across all levels
- **Save / Load / Export** — persists to `localStorage`; export as text
- **Chess clock** — per-player countdown
- **Move log** and **captured-pieces** panel with win/loss record
- **3D camera** — drag-orbit, scroll/pinch-zoom, and presets: TOP, SIDE, W.POV, B.POV
- **Level slider** — isolate or reveal individual board levels
- **Tutorial overlay** — first-run guide (dismiss via GOT IT, backdrop click, or Escape)
- **Scanline CRT effect** — cosmetic toggle, persisted
- **Accessibility** — ARIA dialog roles, keyboard activation for `role="button"`, screen-reader announcements

---

## 7 Piece Themes (each fully custom 3D geometry)

| Theme | Icon | Pieces |
|-------|------|--------|
| Trooper | 🪖 | Sci-fi soldiers with glowing visors |
| Robots | 🤖 | Metallic androids |
| Crystals | 💎 | Translucent gem-like forms |
| Medieval | ⚔️ | Classic carved-stone look |
| Aliens | 👾 | Bioluminescent extraterrestrials |
| **Popeye** | 🫒 | Spinach Can · Bulldog · Wimpy · Bluto · Olive Oyl · Popeye |
| **Greek** | ⚡ | Hoplite · Pegasus · Artemis · Poseidon · Athena · Zeus |

---

## What Was Accomplished

### Bug fixes
- **Android instant-crash** on launch — root cause was a package-name mismatch between `build.gradle` (`com.rhombuschess4d.app`) and `MainActivity.java`. Corrected and verified.
- **Button overlap** on mobile — controls split to bottom-left (game) and bottom-right (camera/utility), then later collapsed into a ☰ MENU submenu.
- **Panel repositioning** — move log / captured / status panels no longer overlap the turn indicator.

### New content
- **Popeye theme** — 6 custom 3D characters.
- **Greek Mythology theme** — 6 custom 3D characters.

### Security audit + hardening
- Removed `unsafe-inline` from the `script-src` CSP (game JS extracted to external files).
- Fixed **save-file prototype pollution** in `loadGame()` (strict type/colour whitelists + bounds checks).
- Replaced `innerHTML` XSS sinks in the admin panel with DOM API.
- Added **Firebase CDN SRI integrity hashes**.
- Hardened admin auth (UID allowlist hard-blocks when empty; session ceiling; listener cleanup).
- Android `network_security_config.xml` blocks cleartext traffic; iOS WebView locked to `originWhitelist: ['file://']`; Capacitor `allowNavigation: []`.

### Quality assurance
- **Full frontend beta test** (Playwright) on both desktop and mobile builds — all 7 themes render, full move + AI loop works, save/load works, camera and menu controls work.
- Fixed two issues found in testing: tutorial-modal dismissal and a deprecated vertical-slider CSS rule.

### Release & store readiness
- GitHub repository with tagged releases **v1.3 → v1.9**.
- **MIT LICENSE** and **privacy policy** (`PRIVACY.md`).
- **Signed release builds**: `.aab` (Google Play) + signed `.apk`, via a dedicated release keystore (gitignored, backed up).
- Auto-commit hook and `scripts/build-ios.js` tooling.

---

## Current State

- **Version:** v1.9 — latest GitHub release, first with store-ready signed builds.
- **Pending (requires the owner):**
  - iOS real-device / TestFlight build — needs an Apple Developer account.
  - Google Play Console listing and submission.

---

*Full per-version history is in [CHANGELOG.md](CHANGELOG.md).*
