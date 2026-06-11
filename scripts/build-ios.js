/**
 * build-ios.js — Generates the self-contained easier-ios.html for the Expo iOS app.
 *
 * The iOS WebView loads via file:// so it cannot reference external scripts.
 * This script inlines both Three.js and the game code into a single HTML file.
 *
 * Usage:  node scripts/build-ios.js
 * Output: www/easier-ios.html  (copy this to RhombusChessIOS/assets/game/)
 */
const fs   = require('fs');
const path = require('path');

const root      = path.join(__dirname, '..');
const htmlPath  = path.join(root, 'www', 'easier.html');
const threePath = path.join(root, 'www', 'js', 'three.min.js');
const gamePath  = path.join(root, 'www', 'js', 'easier-game.js');
const outPath   = path.join(root, 'www', 'easier-ios.html');
const iosPath   = path.join(root, '..', 'RhombusChessIOS', 'assets', 'game', 'easier-ios.html');

let html      = fs.readFileSync(htmlPath,  'utf8');
const threejs = fs.readFileSync(threePath, 'utf8');
const gamejs  = fs.readFileSync(gamePath,  'utf8');

if (!html.includes('<script src="js/three.min.js"></script>'))
  throw new Error('three.min.js script tag not found in easier.html');
if (!html.includes('<script src="js/easier-game.js"></script>'))
  throw new Error('easier-game.js script tag not found in easier.html');

html = html.replace('<script src="js/three.min.js"></script>',  '<script>' + threejs + '</script>');
html = html.replace('<script src="js/easier-game.js"></script>', '<script>' + gamejs  + '</script>');

fs.writeFileSync(outPath, html, 'utf8');
console.log('✔ www/easier-ios.html written (' + (html.length / 1024).toFixed(1) + ' KB)');

// Also copy to the iOS Expo project if it exists
if (fs.existsSync(path.dirname(iosPath))) {
  fs.writeFileSync(iosPath, html, 'utf8');
  console.log('✔ Copied to RhombusChessIOS/assets/game/easier-ios.html');
} else {
  console.log('ℹ  RhombusChessIOS not found — skipping iOS copy');
}
