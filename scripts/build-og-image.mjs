import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from '../node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const logoRaw = readFileSync(resolve(root, 'src/assets/full_logo.svg'), 'utf8');
const innerMatch = logoRaw.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
if (!innerMatch) throw new Error('Could not parse logo SVG');
const logoInner = innerMatch[1];

const W = 1200;
const H = 630;

// Logo carries the headline weight, so it goes bigger.
const LOGO_NATIVE_W = 1644;
const LOGO_W = 560;
const LOGO_X = (W - LOGO_W) / 2;
const LOGO_Y = 40;
const LOGO_SCALE = LOGO_W / LOGO_NATIVE_W;

const CREAM = '#F5F0DF';
const MUTED = '#8e8b88';
const RED = '#c73e3a';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${CREAM}"/>

  <!-- Lockup logo, raised -->
  <g transform="translate(${LOGO_X} ${LOGO_Y}) scale(${LOGO_SCALE})">
    ${logoInner}
  </g>

  <!-- Tagline: muted lead-in + red italic emphasis -->
  <text x="${W / 2}" y="248"
        text-anchor="middle"
        font-family="'Source Serif 4', 'Source Serif Pro', Georgia, serif"
        font-size="34"
        fill="${MUTED}">A free local-first notes app. <tspan font-style="italic" fill="${RED}">Your words, your machine.</tspan></text>

  <!-- Horizontal metadata strip directly above the app peek -->
  <!-- MIT license chip (outlined) -->
  <rect x="456" y="294" width="118" height="32" rx="16" ry="16"
        fill="none" stroke="${RED}" stroke-width="1.5"/>
  <text x="515" y="315"
        text-anchor="middle"
        font-family="'Inter Tight', 'Inter', -apple-system, 'Helvetica Neue', sans-serif"
        font-size="14"
        font-weight="600"
        letter-spacing="1.2"
        fill="${RED}">MIT LICENSE</text>

  <!-- Apple circle (outlined) -->
  <circle cx="624" cy="310" r="20" fill="none" stroke="${RED}" stroke-width="1.5"/>
  <g transform="translate(612, 298) scale(1)">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="${RED}"/>
  </g>

  <!-- Windows circle (outlined) -->
  <circle cx="674" cy="310" r="20" fill="none" stroke="${RED}" stroke-width="1.5"/>
  <g transform="translate(662, 298) scale(1)">
    <rect x="2.5" y="2.5" width="8.5" height="8.5" fill="${RED}"/>
    <rect x="13" y="2.5" width="8.5" height="8.5" fill="${RED}"/>
    <rect x="2.5" y="13" width="8.5" height="8.5" fill="${RED}"/>
    <rect x="13" y="13" width="8.5" height="8.5" fill="${RED}"/>
  </g>

  <!-- Linux circle (outlined): red Tux silhouette with cream belly -->
  <circle cx="724" cy="310" r="20" fill="none" stroke="${RED}" stroke-width="1.5"/>
  <g transform="translate(712, 298) scale(1)">
    <path d="M12 1.5 C 8.5 1.5 7 3.8 7 6.2 C 7 7.6 7.4 8.8 8 9.6 C 5.5 10.4 4 12.8 4 16 C 4 19.6 6 22.5 8.5 22.5 L 15.5 22.5 C 18 22.5 20 19.6 20 16 C 20 12.8 18.5 10.4 16 9.6 C 16.6 8.8 17 7.6 17 6.2 C 17 3.8 15.5 1.5 12 1.5 Z" fill="${RED}"/>
    <ellipse cx="12" cy="15.5" rx="3.2" ry="5" fill="${CREAM}"/>
    <circle cx="10.5" cy="5.5" r="0.55" fill="${CREAM}"/>
    <circle cx="13.5" cy="5.5" r="0.55" fill="${CREAM}"/>
    <polygon points="11,7.5 13,7.5 12,8.8" fill="${CREAM}"/>
  </g>
</svg>`;

// 1. Render the base (cream bg + logo + text).
const base = await sharp(Buffer.from(svg)).png().toBuffer();

// 2. Prepare the app screenshot as a peek: resize wide, crop top slice.
// Peek height extends below the image bottom so it bleeds off — only top corners curve.
const PEEK_W = 1040;
const PEEK_H = 320;
const PEEK_X = Math.round((W - PEEK_W) / 2);
const PEEK_Y = 360;
const RADIUS = 20;

const screenshotRaw = await sharp(resolve(root, 'src/assets/base_app_color_padding.png'))
  .resize({ width: PEEK_W })
  .extract({ left: 0, top: 0, width: PEEK_W, height: PEEK_H })
  .png()
  .toBuffer();

// Round only the top corners (bottom bleeds off the image edge).
const cornerMask = `<svg xmlns="http://www.w3.org/2000/svg" width="${PEEK_W}" height="${PEEK_H}">
  <path d="M 0 ${RADIUS}
           A ${RADIUS} ${RADIUS} 0 0 1 ${RADIUS} 0
           L ${PEEK_W - RADIUS} 0
           A ${RADIUS} ${RADIUS} 0 0 1 ${PEEK_W} ${RADIUS}
           L ${PEEK_W} ${PEEK_H}
           L 0 ${PEEK_H} Z" fill="white"/>
</svg>`;
const screenshot = await sharp(screenshotRaw)
  .composite([{ input: Buffer.from(cornerMask), blend: 'dest-in' }])
  .png()
  .toBuffer();

// Build a soft drop shadow: a blurred dark rounded rect, slightly offset.
const SHADOW_BLUR = 22;
const SHADOW_OFFSET_Y = 18;
const SHADOW_PAD = SHADOW_BLUR * 2;
const shadowCanvasW = PEEK_W + SHADOW_PAD * 2;
const shadowCanvasH = PEEK_H + SHADOW_PAD * 2;
const shadowSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${shadowCanvasW}" height="${shadowCanvasH}">
  <path d="M ${SHADOW_PAD} ${SHADOW_PAD + RADIUS}
           A ${RADIUS} ${RADIUS} 0 0 1 ${SHADOW_PAD + RADIUS} ${SHADOW_PAD}
           L ${SHADOW_PAD + PEEK_W - RADIUS} ${SHADOW_PAD}
           A ${RADIUS} ${RADIUS} 0 0 1 ${SHADOW_PAD + PEEK_W} ${SHADOW_PAD + RADIUS}
           L ${SHADOW_PAD + PEEK_W} ${SHADOW_PAD + PEEK_H}
           L ${SHADOW_PAD} ${SHADOW_PAD + PEEK_H} Z"
        fill="rgba(57,55,55,0.75)"/>
</svg>`;
const shadow = await sharp(Buffer.from(shadowSvg))
  .blur(SHADOW_BLUR)
  .png()
  .toBuffer();

// 3. Composite: base ← shadow ← screenshot.
const outPath = resolve(root, 'public/og-image.png');
await sharp(base)
  .composite([
    { input: shadow, top: PEEK_Y - SHADOW_PAD + SHADOW_OFFSET_Y, left: PEEK_X - SHADOW_PAD },
    { input: screenshot, top: PEEK_Y, left: PEEK_X },
  ])
  .png({ compressionLevel: 9 })
  .toFile(outPath);

const meta = await sharp(outPath).metadata();
console.log(`wrote ${outPath} — ${meta.width}x${meta.height}`);
