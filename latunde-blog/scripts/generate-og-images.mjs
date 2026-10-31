import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const assetsDir = path.join(root, 'assets');

// Helper to get base64 data URI
function getDataUri(relPath, mimeType) {
  const fullPath = path.join(assetsDir, relPath);
  const data = fs.readFileSync(fullPath);
  return `data:${mimeType};base64,${data.toString('base64')}`;
}

const heroDataUri = getDataUri('hero-enhanced.png', 'image/png');
const fieldDataUri = getDataUri('field-1.jpeg', 'image/jpeg');
const markDataUri = getDataUri('hctm-mark.svg', 'image/svg+xml');

// 1. Primary Site OG Image HTML
const siteOgHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>OG Image</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Lora:ital,wght@0,500;0,600;1,400&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px;
    height: 630px;
    overflow: hidden;
    background: #050e18;
    color: #fdfbf7;
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    position: relative;
    -webkit-font-smoothing: antialiased;
  }

  /* Deep layered sacred gradients */
  .canvas {
    width: 1200px;
    height: 630px;
    position: relative;
    background: 
      radial-gradient(ellipse 900px 550px at 78% 45%, rgba(24, 61, 95, 0.95) 0%, rgba(12, 35, 60, 0.92) 45%, #06111d 100%),
      radial-gradient(circle at 15% 20%, rgba(194, 65, 12, 0.15) 0%, transparent 50%),
      #050e18;
    display: flex;
    padding: 42px 48px;
    gap: 40px;
  }

  /* Refined Gold Border & Accents */
  .gold-frame {
    position: absolute;
    inset: 18px;
    border: 1px solid rgba(212, 175, 55, 0.35);
    border-radius: 12px;
    pointer-events: none;
  }
  .gold-frame::before {
    content: '';
    position: absolute;
    inset: 5px;
    border: 1px solid rgba(212, 175, 55, 0.15);
    border-radius: 8px;
  }
  .corner-cross {
    position: absolute;
    width: 14px;
    height: 14px;
    color: #d4af37;
  }
  .corner-tl { top: 12px; left: 12px; }
  .corner-tr { top: 12px; right: 12px; }
  .corner-bl { bottom: 12px; left: 12px; }
  .corner-br { bottom: 12px; right: 12px; }

  /* Left Column: Branding, Typography, Mission */
  .left-col {
    flex: 1 1 640px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 2;
  }

  .pill-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(16, 47, 75, 0.85);
    border: 1px solid rgba(212, 175, 55, 0.45);
    padding: 6px 14px;
    border-radius: 30px;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #f3cf7a;
    width: fit-content;
    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  }
  .pill-mark {
    width: 14px;
    height: 14px;
  }

  .title-group {
    margin-top: 10px;
  }
  h1.main-title {
    font-family: 'Cinzel', 'Lora', Georgia, serif;
    font-size: 46px;
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.01em;
    color: #ffffff;
    text-shadow: 0 2px 14px rgba(0,0,0,0.4);
  }
  .title-gold {
    background: linear-gradient(135deg, #fff3d1 0%, #e8bc54 45%, #ca9025 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: block;
  }

  .sub-minister {
    font-size: 19px;
    font-weight: 500;
    color: #e5ded3;
    margin-top: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .sub-minister strong {
    color: #ffffff;
    font-weight: 700;
    letter-spacing: 0.02em;
  }
  .sub-tag {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    background: rgba(194, 65, 12, 0.35);
    border: 1px solid rgba(234, 88, 12, 0.5);
    color: #fdba74;
    padding: 2px 8px;
    border-radius: 4px;
  }

  /* Pillars */
  .pillars {
    display: flex;
    gap: 10px;
    margin-top: 14px;
  }
  .pillar-item {
    font-size: 12px;
    font-weight: 600;
    color: #f3ebd9;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    padding: 5px 12px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .pillar-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #eab308;
    box-shadow: 0 0 6px #eab308;
  }

  /* Scripture Card */
  .scripture-card {
    background: rgba(10, 27, 46, 0.78);
    border-left: 3.5px solid #d4af37;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 12px 18px;
    border-radius: 0 10px 10px 0;
    margin-top: 14px;
    backdrop-filter: blur(8px);
  }
  .scripture-verse {
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-size: 14.5px;
    line-height: 1.45;
    color: #f3efe6;
  }
  .scripture-ref {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: #e5be59;
    margin-top: 5px;
    text-transform: uppercase;
  }

  /* Footer Meta */
  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 14px;
    border-top: 1px solid rgba(212, 175, 55, 0.2);
    font-size: 13px;
    color: #9cb1c5;
  }
  .site-url {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .url-dot {
    width: 8px;
    height: 8px;
    background: #22c55e;
    border-radius: 50%;
    box-shadow: 0 0 8px #22c55e;
  }

  /* Right Column: Visual Composition */
  .right-col {
    flex: 0 0 430px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }

  /* Portrait Medallion */
  .portrait-wrapper {
    position: relative;
    width: 330px;
    height: 440px;
  }
  .portrait-frame {
    width: 100%;
    height: 100%;
    border-radius: 180px 180px 24px 24px;
    border: 2px solid rgba(212, 175, 55, 0.6);
    overflow: hidden;
    position: relative;
    box-shadow: 
      0 16px 40px -8px rgba(0, 0, 0, 0.7),
      0 0 45px rgba(212, 175, 55, 0.2);
    background: #0d2742;
  }
  .portrait-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    display: block;
    transform: scale(1.02);
  }
  .portrait-vignette {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 65%, rgba(6, 17, 29, 0.85) 100%);
    pointer-events: none;
  }

  /* Emblem floating badge */
  .emblem-badge {
    position: absolute;
    top: -12px;
    right: -14px;
    width: 88px;
    height: 88px;
    border-radius: 24px;
    background: #091c30;
    border: 2px solid #d4af37;
    padding: 6px;
    box-shadow: 
      0 8px 24px rgba(0,0,0,0.6),
      0 0 24px rgba(212, 175, 55, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .emblem-badge img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  /* Inset field card */
  .field-inset {
    position: absolute;
    bottom: -10px;
    left: -32px;
    width: 165px;
    height: 110px;
    border-radius: 12px;
    overflow: hidden;
    border: 2px solid rgba(212, 175, 55, 0.5);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.65);
    background: #000;
  }
  .field-inset img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .field-tag {
    position: absolute;
    bottom: 0;
    inset-inline: 0;
    background: rgba(5, 14, 24, 0.88);
    font-size: 9.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #f3cf7a;
    padding: 3px 6px;
    text-align: center;
  }
</style>
</head>
<body>
<div class="canvas">
  <div class="gold-frame"></div>
  
  <div class="left-col">
    <div>
      <div class="pill-badge">
        <img class="pill-mark" src="${markDataUri}" alt="">
        Have Compassion on Them Missions • HCTM
      </div>

      <div class="title-group">
        <h1 class="main-title">
          Have Compassion
          <span class="title-gold">on Them Missions</span>
        </h1>
        <div class="sub-minister">
          <span>Official Writings &amp; Ministry Archive of</span>
          <strong>Latunde Akin</strong>
          <span class="sub-tag">Archive</span>
        </div>
      </div>

      <div class="pillars">
        <div class="pillar-item"><span class="pillar-dot"></span> Frontline Soul Winning</div>
        <div class="pillar-item"><span class="pillar-dot"></span> Grassroots Discipleship</div>
        <div class="pillar-item"><span class="pillar-dot"></span> Missionary Succour</div>
      </div>
    </div>

    <div class="scripture-card">
      <p class="scripture-verse">“And of some have compassion, making a difference: and others save with fear, pulling them out of the fire.”</p>
      <div class="scripture-ref">Jude 1:22, 23 (KJV)</div>
    </div>

    <div class="card-footer">
      <div class="site-url">
        <span class="url-dot"></span>
        havecompassion.org
      </div>
      <div>Writings • Field Reports • Daily Manna • Intercession</div>
    </div>
  </div>

  <div class="right-col">
    <div class="portrait-wrapper">
      <div class="portrait-frame">
        <img class="portrait-img" src="${heroDataUri}" alt="Latunde Akin">
        <div class="portrait-vignette"></div>
      </div>
      <div class="emblem-badge">
        <img src="${markDataUri}" alt="HCTM Emblem">
      </div>
      <div class="field-inset">
        <img src="${fieldDataUri}" alt="Mission Field">
        <div class="field-tag">Frontline Outreach</div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

// 2. Article / Blog OG Image HTML
const articleOgHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Article OG Image</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Lora:ital,wght@0,500;0,600;1,400&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px;
    height: 630px;
    overflow: hidden;
    background: #050e18;
    color: #fdfbf7;
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    position: relative;
    -webkit-font-smoothing: antialiased;
  }
  .canvas {
    width: 1200px;
    height: 630px;
    position: relative;
    background: 
      radial-gradient(ellipse 950px 600px at 80% 40%, rgba(20, 52, 82, 0.96) 0%, rgba(10, 28, 48, 0.92) 50%, #06101c 100%),
      radial-gradient(circle at 10% 25%, rgba(194, 65, 12, 0.16) 0%, transparent 45%),
      #050e18;
    display: flex;
    padding: 44px 50px;
    gap: 40px;
  }
  .gold-frame {
    position: absolute;
    inset: 18px;
    border: 1px solid rgba(212, 175, 55, 0.35);
    border-radius: 12px;
    pointer-events: none;
  }
  .left-col {
    flex: 1 1 650px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 2;
  }
  .pill-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(16, 47, 75, 0.85);
    border: 1px solid rgba(212, 175, 55, 0.45);
    padding: 6px 14px;
    border-radius: 30px;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #f3cf7a;
    width: fit-content;
  }
  .pill-mark { width: 14px; height: 14px; }
  h1.main-title {
    font-family: 'Cinzel', 'Lora', Georgia, serif;
    font-size: 42px;
    font-weight: 700;
    line-height: 1.15;
    color: #ffffff;
    margin-top: 12px;
  }
  .title-gold {
    background: linear-gradient(135deg, #fff3d1 0%, #e8bc54 45%, #ca9025 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: block;
  }
  .lead-desc {
    font-family: 'Lora', Georgia, serif;
    font-size: 17px;
    line-height: 1.5;
    color: #e5ded3;
    margin-top: 12px;
  }
  .scripture-card {
    background: rgba(10, 27, 46, 0.78);
    border-left: 3.5px solid #d4af37;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 12px 18px;
    border-radius: 0 10px 10px 0;
    margin-top: 14px;
  }
  .scripture-verse {
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-size: 14px;
    line-height: 1.45;
    color: #f3efe6;
  }
  .scripture-ref {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: #e5be59;
    margin-top: 5px;
    text-transform: uppercase;
  }
  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 14px;
    border-top: 1px solid rgba(212, 175, 55, 0.2);
    font-size: 13px;
    color: #9cb1c5;
  }
  .site-url {
    font-size: 15px;
    font-weight: 700;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .url-dot {
    width: 8px;
    height: 8px;
    background: #eab308;
    border-radius: 50%;
    box-shadow: 0 0 8px #eab308;
  }
  .right-col {
    flex: 0 0 420px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
  }
  .author-card {
    background: rgba(14, 39, 64, 0.9);
    border: 1.5px solid rgba(212, 175, 55, 0.5);
    border-radius: 20px;
    padding: 24px;
    text-align: center;
    width: 340px;
    box-shadow: 0 20px 45px rgba(0,0,0,0.6);
  }
  .author-avatar {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    margin: 0 auto 16px;
    border: 3px solid #d4af37;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  }
  .author-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
  }
  .author-name {
    font-size: 22px;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 4px;
  }
  .author-title {
    font-size: 13px;
    font-weight: 600;
    color: #f3cf7a;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .author-ministry {
    font-size: 12.5px;
    color: #c0d1e3;
    margin-top: 8px;
    line-height: 1.4;
  }
  .author-badge {
    margin-top: 14px;
    display: inline-block;
    background: rgba(194, 65, 12, 0.35);
    border: 1px solid rgba(234, 88, 12, 0.6);
    color: #fed7aa;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    padding: 4px 12px;
    border-radius: 20px;
  }
</style>
</head>
<body>
<div class="canvas">
  <div class="gold-frame"></div>
  
  <div class="left-col">
    <div>
      <div class="pill-badge">
        <img class="pill-mark" src="${markDataUri}" alt="">
        Writings &amp; Teachings Archive • 160+ Articles
      </div>

      <h1 class="main-title">
        Biblical Discipleship,
        <span class="title-gold">Prayer &amp; Missions</span>
      </h1>

      <p class="lead-desc">
        Deep insights on soul winning, personal holiness, spiritual warfare, missionary succour, and restoring authentic Christian discipleship.
      </p>
    </div>

    <div class="scripture-card">
      <p class="scripture-verse">“Preach the word; be instant in season, out of season; reprove, rebuke, exhort with all longsuffering and doctrine.”</p>
      <div class="scripture-ref">2 Timothy 4:2 (KJV)</div>
    </div>

    <div class="card-footer">
      <div class="site-url">
        <span class="url-dot"></span>
        havecompassion.org/blog/
      </div>
      <div>Have Compassion on Them Missions (HCTM)</div>
    </div>
  </div>

  <div class="right-col">
    <div class="author-card">
      <div class="author-avatar">
        <img src="${heroDataUri}" alt="Latunde Akin">
      </div>
      <div class="author-name">Latunde Akin</div>
      <div class="author-title">Missionary &amp; Teacher</div>
      <div class="author-ministry">Have Compassion on Them Missions (HCTM)</div>
      <div class="author-badge">Complete Writings Archive</div>
    </div>
  </div>
</div>
</body>
</html>`;

// Render using MS Edge
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function renderHtmlToImage(htmlContent, tempHtmlName, outPngName, width = 1200, height = 630) {
  const tempHtmlPath = path.join(root, tempHtmlName);
  const outPngPath = path.join(assetsDir, outPngName);
  fs.writeFileSync(tempHtmlPath, htmlContent);

  const fileUrl = 'file:///' + tempHtmlPath.replace(/\\/g, '/');
  console.log(`Rendering ${outPngName} (${width}x${height})...`);
  
  execFileSync(edgePath, [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    `--window-size=${width},${height}`,
    `--screenshot=${outPngPath}`,
    fileUrl
  ]);

  if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
  console.log(`Rendered ${outPngName} (${fs.statSync(outPngPath).size} bytes)`);
}

renderHtmlToImage(siteOgHtml, 'temp-og-site.html', 'og-image.png', 1200, 630);
renderHtmlToImage(articleOgHtml, 'temp-og-article.html', 'og-article-default.png', 1200, 630);

// Render Icons
const markSvgRaw = fs.readFileSync(path.join(assetsDir, 'hctm-mark.svg'), 'utf8');
const iconHtml = (size) => `<!DOCTYPE html><html><body style="margin:0;padding:0;width:${size}px;height:${size}px;overflow:hidden;background:#0c233c;display:flex;align-items:center;justify-content:center;">${markSvgRaw.replace(/width="80" height="80"/, `width="${size}" height="${size}"`)}</body></html>`;

renderHtmlToImage(iconHtml(180), 'temp-icon-180.html', 'apple-touch-icon.png', 180, 180);
renderHtmlToImage(iconHtml(192), 'temp-icon-192.html', 'icon-192.png', 192, 192);

// Generate optimized JPEGs using python Pillow
try {
  execFileSync('python', [
    '-c',
    `
from PIL import Image
for name in ['og-image', 'og-article-default']:
    png = f'latunde-blog/assets/{name}.png'
    jpg = f'latunde-blog/assets/{name}.jpg'
    Image.open(png).convert('RGB').save(jpg, 'JPEG', quality=90, optimize=True)
`
  ]);
  console.log('Optimized OG JPEGs generated successfully.');
} catch (e) {
  console.warn('Note: Python Pillow JPEG optimization skipped:', e.message);
}

console.log('OG Images and icons successfully generated in assets/');
