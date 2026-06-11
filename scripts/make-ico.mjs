import { Jimp } from 'jimp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

function createIco(images) {
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = headerSize + dirEntrySize * images.length;
  let totalSize = dirSize;
  images.forEach(img => totalSize += img.data.length);

  const buf = Buffer.alloc(totalSize);
  let offset = 0;

  // ICONDIR
  buf.writeUInt16LE(0, offset); offset += 2;
  buf.writeUInt16LE(1, offset); offset += 2;
  buf.writeUInt16LE(images.length, offset); offset += 2;

  // Directory
  let dataOffset = dirSize;
  images.forEach(img => {
    buf.writeUInt8(img.size >= 256 ? 0 : img.size, offset++);
    buf.writeUInt8(img.size >= 256 ? 0 : img.size, offset++);
    buf.writeUInt8(0, offset++);
    buf.writeUInt8(0, offset++);
    buf.writeUInt16LE(1, offset); offset += 2;
    buf.writeUInt16LE(32, offset); offset += 2;
    buf.writeUInt32LE(img.data.length, offset); offset += 4;
    buf.writeUInt32LE(dataOffset, offset); offset += 4;
    dataOffset += img.data.length;
  });

  // Data
  images.forEach(img => { img.data.copy(buf, offset); offset += img.data.length; });
  return buf;
}

const sizes = [256, 128, 64, 48, 32, 16];
const images = [];

for (const size of sizes) {
  const img = await Jimp.read('android/playstore-icon.png');
  img.resize({ w: size, h: size });
  const pngBuf = await img.getBuffer('image/png');
  images.push({ size, data: pngBuf });
  console.log(`  ${size}x${size} — ${pngBuf.length} bytes`);
}

if (!existsSync('build')) mkdirSync('build');
const ico = createIco(images);
writeFileSync('build/icon.ico', ico);
console.log(`\n✓ build/icon.ico — ${ico.length} bytes`);
