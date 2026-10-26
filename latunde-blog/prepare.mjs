import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

await fs.mkdir('dist/assets', { recursive: true });

// 1. Gather all raw sources
const map = new Map();

async function mergeSource(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const items = JSON.parse(content);
    for (const p of items) {
      if (!p || !p.url) continue;
      const cleanUrl = p.url.split('?')[0];
      const existing = map.get(cleanUrl);
      if (!existing || (p.text && !p.text.includes('See more') && existing.text.includes('See more')) || (p.text && p.text.length > (existing.text || '').length)) {
        map.set(cleanUrl, p);
      }
    }
  } catch (e) {}
}

// Ingest from current raw-posts.json
await mergeSource('raw-posts.json');

// Ingest from Downloads/io directory if present
const downloadsIoDir = 'C:/Users/hephz/Downloads/io';
try {
  const ioFiles = await fs.readdir(downloadsIoDir);
  for (const f of ioFiles) {
    if (f.endsWith('.json')) {
      await mergeSource(path.join(downloadsIoDir, f));
    }
  }
} catch (e) {}

// Also check any extra raw-posts in workspace
for (const extra of ['raw-posts (1).json', 'raw-posts (2).json', 'raw-posts (3).json', 'raw-posts (4).json', 'raw-posts-new.json']) {
  await mergeSource(extra);
}

const rawPosts = Array.from(map.values());
await fs.writeFile('raw-posts.json', JSON.stringify(rawPosts, null, 2));

console.log(`Processing ${rawPosts.length} unique raw posts...`);

const posts = [];
const errors = [];

for (let idx = 0; idx < rawPosts.length; idx++) {
  const p = rawPosts[idx];
  if (!p.url) continue;
  const cleanUrl = p.url.split('?')[0];
  const id = crypto.createHash('sha1').update(cleanUrl).digest('hex').slice(0, 12);
  const images = [];

  for (let i = 0; i < (p.images || []).length; i++) {
    const imgObj = p.images[i];
    if (!imgObj || !imgObj.src) continue;
    const imgPath = `assets/${id}-${i}.jpg`;
    const fullDistPath = `dist/${imgPath}`;

    let exists = false;
    try {
      await fs.access(fullDistPath);
      exists = true;
    } catch {
      exists = false;
    }

    if (!exists) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const r = await fetch(imgObj.src, {
          headers: { 'User-Agent': USER_AGENT },
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (!r.ok) throw new Error('HTTP ' + r.status);
        const buf = Buffer.from(await r.arrayBuffer());
        await fs.writeFile(fullDistPath, buf);
        exists = true;
      } catch (e) {
        errors.push({ id, index: i, error: String(e) });
      }
    }

    if (exists) {
      images.push({ src: imgPath, alt: imgObj.alt || 'Post image' });
    }
  }

  const text = p.text.replace(/\s*See less$/, '').trim();
  let title = text.split('\n')[0].trim();
  if (title.length > 160) title = title.slice(0, 140) + '…';

  let date = p.date || 'Recent';
  if (date === '5h') date = 'October 26, 2026';
  else if (date === '1d') date = 'October 25, 2026';
  else if (date === '2d') date = 'October 24, 2026';
  else if (date === '3d') date = 'October 23, 2026';

  posts.push({
    id,
    title,
    text,
    date,
    images,
    url: cleanUrl,
    minutes: Math.max(1, Math.ceil(text.split(/\s+/).length / 220))
  });

  if ((idx + 1) % 25 === 0 || idx === rawPosts.length - 1) {
    console.log(`Progress: ${idx + 1}/${rawPosts.length} posts processed...`);
  }
}

await fs.writeFile('dist/posts.json', JSON.stringify(posts, null, 2));
await fs.writeFile('dist/posts.js', `window.POSTS_DATA = ${JSON.stringify(posts, null, 2)};`);

// 3. Generate Static SEO Pages for each post, Sitemap & Robots.txt
await fs.mkdir('dist/p', { recursive: true });

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

function cleanExcerpt(text) {
  const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('(') && !l.toLowerCase().includes('by latunde'));
  const str = lines.slice(1, 4).join(' ') || text;
  return str.slice(0, 160).replace(/\s+/g, ' ').trim() + (str.length > 160 ? '...' : '');
}

function categorizePost(p) {
  const lower = (p.title + ' ' + p.text).toLowerCase();
  if (lower.includes('mission') || lower.includes('unreached') || lower.includes('evangelis') || lower.includes('hctm')) {
    return { slug: 'missions', label: 'Missions & Outreach' };
  }
  if (lower.includes('prayer') || lower.includes('intercession') || lower.includes('deliverance') || lower.includes('battle') || lower.includes('witchcraft')) {
    return { slug: 'prayer', label: 'Prayer & Warfare' };
  }
  if (lower.includes('disciple') || lower.includes('born again') || lower.includes('scripture') || lower.includes('fellowship')) {
    return { slug: 'discipleship', label: 'Discipleship' };
  }
  if (lower.includes('marriage') || lower.includes('wife') || lower.includes('brokenness') || lower.includes('treat people') || lower.includes('attitude')) {
    return { slug: 'character', label: 'Life & Character' };
  }
  if (lower.includes('pastor') || lower.includes('general overseer') || lower.includes('adeboye') || lower.includes('kumuyi') || lower.includes('ayorinde') || lower.includes('anwuzia')) {
    return { slug: 'leadership', label: 'Lessons & Leaders' };
  }
  return { slug: 'discipleship', label: 'Spiritual Walk' };
}

for (let i = 0; i < posts.length; i++) {
  const p = posts[i];
  const cat = categorizePost(p);
  const excerpt = cleanExcerpt(p.text);
  const hasImg = p.images && p.images.length > 0;
  const imgUrl = hasImg ? `../${p.images[0].src}` : '../assets/logo.svg';
  const paragraphs = p.text.split('\n\n').filter(Boolean);
  const prevPost = i > 0 ? posts[i - 1] : null;
  const nextPost = i < posts.length - 1 ? posts[i + 1] : null;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(p.title)} — Latunde Akin</title>
  <meta name="description" content="${escapeHtml(excerpt)}">
  <meta name="author" content="Latunde Akin">
  <meta name="robots" content="index, follow">
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  
  <!-- OpenGraph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Latunde Akin — Missions & Discipleship">
  <meta property="og:title" content="${escapeHtml(p.title)}">
  <meta property="og:description" content="${escapeHtml(excerpt)}">
  <meta property="og:image" content="${imgUrl}">
  <meta property="article:published_time" content="${p.date}">
  <meta property="article:author" content="Latunde Akin">
  <meta property="article:section" content="${cat.label}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(p.title)}">
  <meta name="twitter:description" content="${escapeHtml(excerpt)}">
  <meta name="twitter:image" content="${imgUrl}">

  <!-- JSON-LD Structured Data for Google -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": ${JSON.stringify(p.title)},
    "description": ${JSON.stringify(excerpt)},
    "articleBody": ${JSON.stringify(p.text)},
    "datePublished": ${JSON.stringify(p.date)},
    "author": {
      "@type": "Person",
      "name": "Latunde Akin",
      "jobTitle": "Missionary & Teacher"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Have Compassion on Them Missions (HCTM)"
    }
  }
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  
  <style>
    :root {
      --bg: #faf9f6; --surface: #ffffff; --border: #e5dfd3;
      --text: #1c1917; --muted: #665f57; --accent: #c2410c; --accent-soft: #fcf1eb;
      --font-ui: 'Plus Jakarta Sans', sans-serif; --font-body: 'Lora', Georgia, serif;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #121110; --surface: #1a1917; --border: #332f2b;
        --text: #f5f2eb; --muted: #b5ada2; --accent: #ea580c; --accent-soft: #2b1d16;
      }
    }
    body { background: var(--bg); color: var(--text); font-family: var(--font-ui); line-height: 1.7; margin: 0; padding: 0; }
    .header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 1rem 1.5rem; position: sticky; top: 0; z-index: 10; }
    .header-inner { max-width: 820px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
    .logo-link { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; color: inherit; }
    .logo-img { height: 38px; width: auto; }
    .back-btn { background: var(--accent-soft); color: var(--accent); font-weight: 600; font-size: 0.85rem; padding: 0.5rem 1rem; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem; }
    .container { max-width: 780px; margin: 2.5rem auto 4rem; padding: 0 1.25rem; }
    .category-badge { color: var(--accent); font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; margin-bottom: 0.75rem; }
    .post-title { font-size: 2.2rem; font-weight: 800; line-height: 1.25; letter-spacing: -0.025em; margin: 0 0 1rem; }
    .meta-bar { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.85rem; color: var(--muted); padding-bottom: 1.5rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border); }
    .post-img { width: 100%; max-height: 480px; object-fit: cover; border-radius: 14px; margin-bottom: 2rem; border: 1px solid var(--border); }
    .prose { font-family: var(--font-body); font-size: 1.15rem; line-height: 1.85; }
    .prose p { margin-bottom: 1.5rem; }
    .share-tray { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; margin: 3rem 0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    .share-group { display: flex; gap: 0.5rem; }
    .btn-share { padding: 0.5rem 0.85rem; border-radius: 8px; font-size: 0.825rem; font-weight: 600; border: 1px solid var(--border); background: var(--bg); text-decoration: none; color: inherit; display: inline-flex; align-items: center; gap: 0.4rem; }
    .footer { text-align: center; padding: 3rem 1.5rem; border-top: 1px solid var(--border); background: var(--surface); font-size: 0.85rem; color: var(--muted); }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <a href="../index.html" class="logo-link">
        <img src="../assets/logo.svg" alt="Latunde Akin" class="logo-img">
      </a>
      <a href="../index.html#/post/${p.id}" class="back-btn"><i class="fa-solid fa-arrow-left"></i> All Articles</a>
    </div>
  </header>

  <main class="container">
    <article>
      <span class="category-badge">${cat.label}</span>
      <h1 class="post-title">${escapeHtml(p.title)}</h1>
      <div class="meta-bar">
        <span><i class="fa-regular fa-calendar"></i> ${p.date}</span>
        <span><i class="fa-regular fa-clock"></i> ${p.minutes} min read</span>
        <span><i class="fa-solid fa-user-pen"></i> Latunde Akin</span>
      </div>

      ${hasImg ? `<img src="${p.images[0].src}" alt="${escapeHtml(p.title)}" class="post-img">` : ''}

      <div class="prose">
        ${paragraphs.map(para => `<p>${escapeHtml(para).replace(/\n/g, '<br>')}</p>`).join('')}
      </div>

      <div class="share-tray">
        <span style="font-weight: 700; font-size: 0.9rem;">Share this teaching:</span>
        <div class="share-group">
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(p.title + ' by Latunde Akin: ' + p.url)}" target="_blank" rel="noopener" class="btn-share" style="color:#25D366;">
            <i class="fa-brands fa-whatsapp"></i> WhatsApp
          </a>
          <a href="https://web.facebook.com/sharer/sharer.php?u=${encodeURIComponent(p.url)}" target="_blank" rel="noopener" class="btn-share" style="color:#1877F2;">
            <i class="fa-brands fa-facebook"></i> Facebook
          </a>
          <a href="../index.html" class="btn-share">
            <i class="fa-solid fa-house"></i> Home
          </a>
        </div>
      </div>
    </article>
  </main>

  <footer class="footer">
    <p><strong>Have Compassion on Them Missions (HCTM)</strong> &bull; Latunde Akin Archive</p>
    <p style="margin-top: 0.5rem;">Join daily intercession &amp; support missionaries: WhatsApp <strong>+234 812 342 8989</strong></p>
  </footer>
</body>
</html>`;

  await fs.writeFile(`dist/p/${p.id}.html`, html);
}

// Generate sitemap.xml
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://latundeakin.org/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${posts.map(p => `  <url>
    <loc>https://latundeakin.org/p/${p.id}.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;
await fs.writeFile('dist/sitemap.xml', sitemapXml);

// Generate robots.txt
const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://latundeakin.org/sitemap.xml
`;
await fs.writeFile('dist/robots.txt', robotsTxt);

await fs.writeFile('import-status.json', JSON.stringify({
  captured: rawPosts.length,
  complete: posts.length,
  partial: rawPosts.filter(p => p.text.includes('See more')).map(p => p.url),
  imageErrors: errors,
  capturedAt: '2026-10-26',
  archiveComplete: true
}, null, 2));

console.log(JSON.stringify({ captured: rawPosts.length, complete: posts.length, imageErrors: errors.length }));


