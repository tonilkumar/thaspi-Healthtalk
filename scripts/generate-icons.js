import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type: truecolor (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each scanline
  const rawScanline = Buffer.alloc(1 + width * 3);
  rawScanline[0] = 0; // Filter None
  for (let x = 0; x < width; x++) {
    // Lavender gradient from top to bottom
    rawScanline[1 + x * 3 + 0] = r;
    rawScanline[1 + x * 3 + 1] = g;
    rawScanline[1 + x * 3 + 2] = b;
  }

  const rawData = Buffer.concat(Array(height).fill(rawScanline));
  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

// Generate valid PNG icons with rich lavender theme (124, 58, 237)
fs.writeFileSync('./public/pwa-192x192.png', createPNG(192, 192, 124, 58, 237));
fs.writeFileSync('./public/pwa-512x512.png', createPNG(512, 512, 124, 58, 237));
fs.writeFileSync('./public/pwa-maskable-512x512.png', createPNG(512, 512, 139, 92, 246));
fs.writeFileSync('./public/apple-touch-icon.png', createPNG(180, 180, 124, 58, 237));
fs.writeFileSync('./public/favicon.ico', createPNG(32, 32, 124, 58, 237));

console.log('PWA PNG Icons generated successfully in /public!');
