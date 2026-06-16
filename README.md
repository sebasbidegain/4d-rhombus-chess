# 4D Rhombus Chess

> A 3D multi-level chess game built with Three.js — playable on Android, iOS, and desktop browsers.

The board is a **rhombus-shaped stack of levels**. Pieces move in all three dimensions: across ranks and files on each level, and up or down between levels. The middle level is the widest (8 squares); levels above and below narrow progressively, forming the rhombus silhouette.

---

## Platforms

| Platform | Entry point | Build |
|----------|------------|-------|
| **Desktop** (browser) | `www/index.html` | Open directly — no build step |
| **Android** | Capacitor wrapper | `android/gradlew assembleDebug` |
| **iOS** | Expo / React Native WebView | `eas build --platform ios` |

---

## Features

- **3D rhombus board** — 7 levels (mobile) or 15 levels (desktop), rendered in Three.js with orbit controls, zoom, and camera presets (TOP, SIDE, W.POV, B.POV)
- **Full chess rules** — castling, en passant, promotion, check/checkmate detection, stalemate
- **VS AI** — minimax engine with Easy / Medium / Hard difficulty
- **2-player local** — pass-and-play on one device
- **Puzzle mode** — preset tactical puzzles across all levels
- **Save / Load / Export** — persist games to localStorage, export as PGN-like text
- **Chess clock** — per-player countdown timer
- **Move log + captured pieces** panel
- **7 piece themes** — each with fully custom 3D geometry:

| Theme | Icon | Pieces |
|-------|------|--------|
| Trooper | 🪖 | Sci-fi soldiers with glowing visors |
| Robots | 🤖 | Metallic androids |
| Crystals | 💎 | Translucent gem-like forms |
| Medieval | ⚔️ | Classic carved stone look |
| Aliens | 👾 | Bioluminescent extraterrestrials |
| **Popeye** | 🫒 | Spinach Can · Bulldog · Wimpy · Bluto · Olive Oyl · Popeye |
| **Greek** | ⚡ | Hoplite · Pegasus · Artemis · Poseidon · Athena · Zeus |

---

## Project Structure

```
www/
  index.html          # Desktop game (15-level board)
  easier.html         # Mobile game (7-level board)
  admin.html          # Firebase admin panel (optional)
  js/
    three.min.js      # Three.js r128
    index-game.js     # Desktop game code (extracted from index.html)
    easier-game.js    # Mobile game code (extracted from easier.html)

android/              # Capacitor Android wrapper
scripts/
  build-ios.js        # Generates self-contained easier-ios.html for Expo
  puzzle-generator.js
CHANGELOG.md          # Full version history with per-release notes
```

---

## Building

### Desktop
Open `www/index.html` directly in any modern browser. No build step needed.

### Android (debug APK)
```bash
# Sync web assets
cp www/easier.html android/app/src/main/assets/public/easier.html
cp www/js/easier-game.js android/app/src/main/assets/public/js/easier-game.js

# Build
cd android
./gradlew assembleDebug

# APK output
android/app/build/outputs/apk/debug/rhombuschess-vX.X-debug.apk
```

### iOS (Expo / EAS)
```bash
# Generate self-contained HTML (inlines Three.js + game code for file:// WebView)
node scripts/build-ios.js

# Copy to Expo project and build
cp www/easier-ios.html ../RhombusChessIOS/assets/game/easier-ios.html
cd ../RhombusChessIOS
eas build --platform ios --profile simulator
```

---

## Releases

All APK releases are attached to [GitHub Releases](https://github.com/sebasbidegain/4d-rhombus-chess/releases). See [CHANGELOG.md](CHANGELOG.md) for detailed notes on every version.

| Version | Highlights |
|---------|-----------|
| v1.8 | Security hardening — CSP, XSS, Firebase SRI, admin fixes |
| v1.7 | Security patch — save file validation, admin auth hardening |
| v1.6 | ⚡ Greek Mythology theme (Zeus, Athena, Poseidon, Pegasus…) |
| v1.5 | 🫒 Popeye theme (Spinach Can pawns, Olive Oyl queen…) |
| v1.4 | UI overhaul — submenu, panel repositioning |
| v1.3 | Button layout fix for mobile |

---

## Tech Stack

- **Three.js r128** — 3D rendering, OrbitControls, MeshStandardMaterial
- **Capacitor 6** — Android WebView wrapper
- **Expo / React Native WebView** — iOS wrapper
- **Firebase** (optional) — Auth + Firestore for the admin analytics panel
- **EAS Build** — Cloud builds for iOS

---

## Security

The codebase has been through a full security audit. Key measures:

- `script-src 'self'` CSP (no `unsafe-inline`) — all game JS in external files
- `loadGame()` validates all save-file fields against strict whitelists before use
- Admin panel uses Firebase UID allowlist; empty list hard-blocks access
- Android `network_security_config.xml` blocks cleartext traffic at OS level
- iOS WebView `originWhitelist: ['file://']`

See [CHANGELOG.md](CHANGELOG.md) v1.7–v1.8 for full details.

---

## License & Privacy

- **License:** [MIT](LICENSE) — do whatever you want with it.
- **Privacy:** see [PRIVACY.md](PRIVACY.md). The game collects no personal data; all saves and preferences stay in local device storage.

## Store submission

The latest [release](https://github.com/sebasbidegain/4d-rhombus-chess/releases) ships **signed, store-ready Android builds**:
- `rhombuschess-vX.X-release.aab` — upload to **Google Play Console**
- `rhombuschess-vX.X-release.apk` — signed APK for direct install/sideload

Release signing uses `android/rhombus-release.keystore` with credentials in `android/keystore.properties` (both gitignored). **Back these up** — the same key must sign every future Play Store update.

iOS still needs an Apple Developer account ($99/yr) for a real-device/TestFlight build; only simulator builds exist so far.
