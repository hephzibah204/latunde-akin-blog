import http from 'node:http';
import fs from 'node:fs/promises';
import { existsSync, createReadStream } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogDir = path.resolve(__dirname, '..');
const distDir = path.join(blogDir, 'dist');
const publicDir = path.join(__dirname, 'public');

const PORT = process.env.PORT || 4000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'hctm2026';
const sessions = new Set();

// Helper: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

// Helper: Clean excerpt
function cleanExcerpt(text) {
  const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('(') && !l.toLowerCase().includes('by latunde'));
  const str = lines.slice(1, 4).join(' ') || text;
  return str.slice(0, 160).replace(/\s+/g, ' ').trim() + (str.length > 160 ? '...' : '');
}

// Helper: Categorize Post
function categorizePost(p) {
  const lower = ((p.title || '') + ' ' + (p.text || '')).toLowerCase();
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

// Helper: Generate Article HTML matching existing live posts and passing check-website.mjs
function generateArticleHtml(p) {
  const cat = categorizePost(p);
  const excerpt = cleanExcerpt(p.text);
  const hasImg = p.images && p.images.length > 0;
  const rawSrc = hasImg ? p.images[0].src : 'assets/hctm-mark.svg';
  const imgUrl = rawSrc.startsWith('http') ? rawSrc : `../${rawSrc.replace(/^\//, '')}`;
  const paragraphs = p.text.split('\n\n').filter(Boolean);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(p.title)} — Latunde Akin</title>
  <meta name="description" content="${escapeHtml(excerpt)}">
  <meta name="author" content="Latunde Akin">
  <meta name="robots" content="index, follow">
  <link rel="icon" type="image/svg+xml" href="../assets/hctm-mark.svg">
  
  <!-- OpenGraph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Latunde Akin — Missions & Discipleship">
  <meta property="og:title" content="${escapeHtml(p.title)}">
  <meta property="og:description" content="${escapeHtml(excerpt)}">
  <meta property="og:image" content="${imgUrl}">
  <meta property="article:published_time" content="${escapeHtml(p.date)}">
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
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; overflow-wrap: break-word; }
    html, body { overflow-x: hidden; width: 100%; max-width: 100vw; position: relative; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-ui); line-height: 1.7; margin: 0; padding: 0; }
    img { max-width: 100%; height: auto; }
    .header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 1rem 1.5rem; position: sticky; top: 0; z-index: 10; width: 100%; }
    .header-inner { max-width: 820px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
    .logo-link { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; color: inherit; min-width: 0; }
    .logo-img { height: 38px; width: auto; max-width: 200px; }
    .back-btn { background: var(--accent-soft); color: var(--accent); font-weight: 600; font-size: 0.85rem; padding: 0.5rem 1rem; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem; flex-shrink: 0; }
    .container { max-width: 780px; margin: 2.5rem auto 4rem; padding: 0 1.25rem; width: 100%; min-width: 0; }
    .category-badge { color: var(--accent); font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; margin-bottom: 0.75rem; }
    .post-title { font-size: 2.2rem; font-weight: 800; line-height: 1.25; letter-spacing: -0.025em; margin: 0 0 1rem; word-break: break-word; }
    .meta-bar { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.85rem; color: var(--muted); padding-bottom: 1.5rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border); }
    .post-img { width: 100%; max-height: 480px; object-fit: cover; border-radius: 14px; margin-bottom: 2rem; border: 1px solid var(--border); }
    .prose { font-family: var(--font-body); font-size: 1.15rem; line-height: 1.85; word-break: break-word; }
    .prose p { margin-bottom: 1.5rem; }
    .share-tray { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; margin: 3rem 0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; width: 100%; }
    .share-group { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .btn-share { padding: 0.5rem 0.85rem; border-radius: 8px; font-size: 0.825rem; font-weight: 600; border: 1px solid var(--border); background: var(--bg); text-decoration: none; color: inherit; display: inline-flex; align-items: center; gap: 0.4rem; }
    .footer { text-align: center; padding: 3rem 1.5rem; border-top: 1px solid var(--border); background: var(--surface); font-size: 0.85rem; color: var(--muted); }
    @media (max-width: 640px) {
      .header { padding: 0.75rem 1rem; }
      .logo-img { height: 32px; max-width: 150px; }
      .container { margin: 1.5rem auto 3rem; padding: 0 1rem; }
      .post-title { font-size: 1.45rem; line-height: 1.3; }
      .prose { font-size: 1.05rem; line-height: 1.8; }
      .share-tray { padding: 1rem; margin: 2rem 0; flex-direction: column; align-items: flex-start; gap: 0.75rem; }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <a href="/" class="logo-link">
        <img src="../assets/hctm-mark.svg" alt="HCTM" class="logo-img" style="height:38px;width:38px">
        <span style="font-weight:700;color:var(--text);font-size:1.1rem">Latunde Akin</span>
      </a>
      <a href="../blog/" class="back-btn"><i class="fa-solid fa-arrow-left"></i> All Articles</a>
    </div>
  </header>

  <main class="container">
    <article>
      <span class="category-badge">${cat.label}</span>
      <h1 class="post-title">${escapeHtml(p.title)}</h1>
      <div class="meta-bar">
        <span><i class="fa-regular fa-calendar"></i> ${escapeHtml(p.date)}</span>
        <span><i class="fa-regular fa-clock"></i> ${p.minutes} min read</span>
        <span><i class="fa-solid fa-user-pen"></i> Latunde Akin</span>
      </div>

      ${hasImg ? `<img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(p.title)}" class="post-img">` : ''}

      <div class="prose">
        ${paragraphs.map(para => `<p>${escapeHtml(para).replace(/\n/g, '<br>')}</p>`).join('')}
      </div>

      <div class="share-tray">
        <span style="font-weight: 700; font-size: 0.9rem;">Share this teaching:</span>
        <div class="share-group">
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(p.title + ' by Latunde Akin: ' + (p.url || ''))}" target="_blank" rel="noopener" class="btn-share" style="color:#25D366;">
            <i class="fa-brands fa-whatsapp"></i> WhatsApp
          </a>
          <a href="https://web.facebook.com/sharer/sharer.php?u=${encodeURIComponent(p.url || '')}" target="_blank" rel="noopener" class="btn-share" style="color:#1877F2;">
            <i class="fa-brands fa-facebook"></i> Facebook
          </a>
          <button type="button" class="btn-share btn-print-tract" style="cursor:pointer;border:none">
            <i class="fa-solid fa-print"></i> Print Tract
          </button>
          <a href="/salvation/" class="btn-share" style="color:#d4af37">
            <i class="fa-solid fa-cross"></i> Receive Jesus
          </a>
          <a href="/" class="btn-share">
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
  <script src="../assets/ministry.js" defer></script>
</body>
</html>`;
}

// Request Body Parser
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 50 * 1024 * 1024) { // 50MB limit
        reject(new Error('Request entity too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

// Auth Helper
function isAuth(req) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/hctm_session=([a-f0-9]{32})/);
  if (match && sessions.has(match[1])) return true;
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (sessions.has(token)) return true;
  }
  return false;
}

// Send JSON Helper
function sendJson(res, statusCode, data, headers = {}) {
  const json = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...headers
  });
  res.end(json);
}

// MIME Types for Static Serving
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Rebuild helper function
async function triggerSiteRebuild() {
  const buildScript = path.join(blogDir, 'build-website.mjs');
  const checkScript = path.join(blogDir, 'check-website.mjs');
  const res1 = await execAsync(`node "${buildScript}"`, { cwd: blogDir });
  const res2 = await execAsync(`node "${checkScript}"`, { cwd: blogDir });
  return `${res1.stdout}\n${res2.stdout}`;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  try {
    // -------------------------------------------------------------
    // API: AUTHENTICATION
    // -------------------------------------------------------------
    if (pathname === '/api/auth/login' && method === 'POST') {
      const { password } = await parseJsonBody(req);
      if (password === ADMIN_PASSWORD) {
        const token = crypto.randomBytes(16).toString('hex');
        sessions.add(token);
        return sendJson(res, 200, { success: true, token }, {
          'Set-Cookie': `hctm_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
        });
      }
      return sendJson(res, 401, { error: 'Invalid password. Please check and try again.' });
    }

    if (pathname === '/api/auth/logout' && method === 'POST') {
      const cookie = req.headers.cookie || '';
      const match = cookie.match(/hctm_session=([a-f0-9]{32})/);
      if (match) sessions.delete(match[1]);
      return sendJson(res, 200, { success: true }, {
        'Set-Cookie': `hctm_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
      });
    }

    if (pathname === '/api/auth/me' && method === 'GET') {
      return sendJson(res, 200, { authenticated: isAuth(req) });
    }

    // Protect all remaining /api/* routes except login/status
    if (pathname.startsWith('/api/') && pathname !== '/api/status' && !isAuth(req)) {
      return sendJson(res, 401, { error: 'Unauthorized. Please log in.' });
    }

    // -------------------------------------------------------------
    // API: SYSTEM STATUS
    // -------------------------------------------------------------
    if (pathname === '/api/status' && method === 'GET') {
      const postsRaw = await fs.readFile(path.join(distDir, 'posts.json'), 'utf8');
      const posts = JSON.parse(postsRaw);
      let gitInfo = 'Clean';
      try {
        const gitRes = await execAsync('git status -s', { cwd: blogDir });
        gitInfo = gitRes.stdout.trim() || 'Working tree clean';
      } catch {}

      return sendJson(res, 200, {
        totalPosts: posts.length,
        nodeVersion: process.version,
        port: PORT,
        gitStatus: gitInfo,
        authenticated: isAuth(req)
      });
    }

    // -------------------------------------------------------------
    // API: POSTS CRUD
    // -------------------------------------------------------------
    if (pathname === '/api/posts' && method === 'GET') {
      const postsRaw = await fs.readFile(path.join(distDir, 'posts.json'), 'utf8');
      let posts = JSON.parse(postsRaw);

      const q = (parsedUrl.searchParams.get('q') || '').toLowerCase().trim();
      const cat = parsedUrl.searchParams.get('category') || '';
      const page = parseInt(parsedUrl.searchParams.get('page') || '1', 10);
      const limitParam = parsedUrl.searchParams.get('limit') || '20';
      const limit = limitParam === 'all' ? posts.length : parseInt(limitParam, 10);

      if (q) {
        posts = posts.filter(p =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.text || '').toLowerCase().includes(q) ||
          (p.id || '').toLowerCase().includes(q)
        );
      }

      if (cat) {
        posts = posts.filter(p => {
          const c = categorizePost(p);
          return c.slug === cat;
        });
      }

      const total = posts.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const start = (page - 1) * limit;
      const paginated = posts.slice(start, start + limit).map(p => ({
        ...p,
        category: categorizePost(p)
      }));

      return sendJson(res, 200, {
        total,
        page,
        limit,
        totalPages,
        posts: paginated
      });
    }

    if (pathname.match(/^\/api\/posts\/([a-f0-9]{8,32})$/) && method === 'GET') {
      const id = pathname.split('/')[3];
      const postsRaw = await fs.readFile(path.join(distDir, 'posts.json'), 'utf8');
      const posts = JSON.parse(postsRaw);
      const post = posts.find(p => p.id === id);
      if (!post) return sendJson(res, 404, { error: 'Post not found' });
      return sendJson(res, 200, { ...post, category: categorizePost(post) });
    }

    // CREATE POST
    if (pathname === '/api/posts' && method === 'POST') {
      const data = await parseJsonBody(req);
      if (!data.text || !data.text.trim()) {
        return sendJson(res, 400, { error: 'Post text is required' });
      }

      const text = data.text.trim();
      let title = data.title ? data.title.trim() : text.split('\n')[0].trim();
      if (title.length > 160) title = title.slice(0, 150) + '…';

      const cleanDate = data.date && data.date.trim() ? data.date.trim() : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const rawUrl = data.url ? data.url.trim() : `https://latundeakin.org/p/new-${Date.now()}`;
      const id = data.id || crypto.createHash('sha1').update(rawUrl + title + Date.now()).digest('hex').slice(0, 12);
      
      const images = Array.isArray(data.images) ? data.images : [];
      if (data.imageSrc) {
        images.push({ src: data.imageSrc, alt: data.imageAlt || title });
      }

      const minutes = Math.max(1, Math.ceil(text.split(/\s+/).length / 220));

      const newPost = {
        id,
        title,
        text,
        date: cleanDate,
        images,
        url: rawUrl,
        minutes
      };

      // Read and update dist/posts.json
      const distPostsRaw = await fs.readFile(path.join(distDir, 'posts.json'), 'utf8');
      const posts = JSON.parse(distPostsRaw);
      posts.unshift(newPost);
      await fs.writeFile(path.join(distDir, 'posts.json'), JSON.stringify(posts, null, 2));
      await fs.writeFile(path.join(distDir, 'posts.js'), `window.POSTS_DATA = ${JSON.stringify(posts, null, 2)};`);

      // Read and update raw-posts.json
      try {
        const rawPostsPath = path.join(blogDir, 'raw-posts.json');
        const rawContent = await fs.readFile(rawPostsPath, 'utf8');
        const rawPosts = JSON.parse(rawContent);
        rawPosts.unshift({
          date: cleanDate,
          text: text,
          url: rawUrl,
          images: images
        });
        await fs.writeFile(rawPostsPath, JSON.stringify(rawPosts, null, 2));
      } catch (e) {
        console.warn('Could not update raw-posts.json:', e.message);
      }

      // Generate HTML file
      const articleHtml = generateArticleHtml(newPost);
      await fs.writeFile(path.join(distDir, 'p', `${id}.html`), articleHtml);

      // Trigger site rebuild to refresh archive & homepage
      let buildLog = '';
      try {
        buildLog = await triggerSiteRebuild();
      } catch (err) {
        buildLog = err.message;
      }

      return sendJson(res, 201, {
        success: true,
        post: { ...newPost, category: categorizePost(newPost) },
        buildLog
      });
    }

    // UPDATE POST
    if (pathname.match(/^\/api\/posts\/([a-f0-9]{8,32})$/) && method === 'PUT') {
      const id = pathname.split('/')[3];
      const data = await parseJsonBody(req);
      
      const distPostsRaw = await fs.readFile(path.join(distDir, 'posts.json'), 'utf8');
      const posts = JSON.parse(distPostsRaw);
      const index = posts.findIndex(p => p.id === id);
      if (index === -1) return sendJson(res, 404, { error: 'Post not found' });

      const existing = posts[index];
      const text = data.text !== undefined ? data.text.trim() : existing.text;
      const title = data.title !== undefined ? data.title.trim() : existing.title;
      const date = data.date !== undefined ? data.date.trim() : existing.date;
      const minutes = Math.max(1, Math.ceil(text.split(/\s+/).length / 220));
      
      let images = existing.images || [];
      if (data.images && Array.isArray(data.images)) {
        images = data.images;
      } else if (data.imageSrc) {
        images = [{ src: data.imageSrc, alt: data.imageAlt || title }];
      }

      const updated = {
        ...existing,
        title,
        text,
        date,
        images,
        url: data.url !== undefined ? data.url.trim() : existing.url,
        minutes
      };

      posts[index] = updated;
      await fs.writeFile(path.join(distDir, 'posts.json'), JSON.stringify(posts, null, 2));
      await fs.writeFile(path.join(distDir, 'posts.js'), `window.POSTS_DATA = ${JSON.stringify(posts, null, 2)};`);

      // Write updated HTML page
      const articleHtml = generateArticleHtml(updated);
      await fs.writeFile(path.join(distDir, 'p', `${id}.html`), articleHtml);

      // Trigger site rebuild
      let buildLog = '';
      try {
        buildLog = await triggerSiteRebuild();
      } catch (err) {
        buildLog = err.message;
      }

      return sendJson(res, 200, {
        success: true,
        post: { ...updated, category: categorizePost(updated) },
        buildLog
      });
    }

    // DELETE POST
    if (pathname.match(/^\/api\/posts\/([a-f0-9]{8,32})$/) && method === 'DELETE') {
      const id = pathname.split('/')[3];
      const distPostsRaw = await fs.readFile(path.join(distDir, 'posts.json'), 'utf8');
      let posts = JSON.parse(distPostsRaw);
      const postToDelete = posts.find(p => p.id === id);
      if (!postToDelete) return sendJson(res, 404, { error: 'Post not found' });

      posts = posts.filter(p => p.id !== id);
      await fs.writeFile(path.join(distDir, 'posts.json'), JSON.stringify(posts, null, 2));
      await fs.writeFile(path.join(distDir, 'posts.js'), `window.POSTS_DATA = ${JSON.stringify(posts, null, 2)};`);

      // Remove HTML page if present
      try {
        await fs.rm(path.join(distDir, 'p', `${id}.html`), { force: true });
      } catch {}

      // Trigger rebuild
      let buildLog = '';
      try {
        buildLog = await triggerSiteRebuild();
      } catch (err) {
        buildLog = err.message;
      }

      return sendJson(res, 200, { success: true, message: 'Post deleted successfully', buildLog });
    }

    // -------------------------------------------------------------
    // API: SETTINGS CRUD (Daily Manna, Prayer Burdens, Contact)
    // -------------------------------------------------------------
    if (pathname === '/api/settings' && method === 'GET') {
      const settingsPath = path.join(blogDir, 'content-settings.json');
      let settings = {};
      if (existsSync(settingsPath)) {
        settings = JSON.parse(await fs.readFile(settingsPath, 'utf8'));
      }
      return sendJson(res, 200, settings);
    }

    if (pathname === '/api/settings' && method === 'PUT') {
      const newSettings = await parseJsonBody(req);
      const settingsPath = path.join(blogDir, 'content-settings.json');
      await fs.writeFile(settingsPath, JSON.stringify(newSettings, null, 2));

      let buildLog = '';
      try {
        buildLog = await triggerSiteRebuild();
      } catch (err) {
        buildLog = err.message;
      }

      return sendJson(res, 200, { success: true, settings: newSettings, buildLog });
    }

    // -------------------------------------------------------------
    // API: IMAGE UPLOAD
    // -------------------------------------------------------------
    if (pathname === '/api/upload' && method === 'POST') {
      const { name, data } = await parseJsonBody(req);
      if (!data || !name) {
        return sendJson(res, 400, { error: 'Image name and base64 data are required' });
      }

      const ext = path.extname(name).toLowerCase() || '.jpg';
      const cleanBase = path.basename(name, ext).replace(/[^a-zA-Z0-9_-]/g, '-');
      const filename = `upload-${cleanBase}-${Date.now().toString(36)}${ext}`;
      
      const buffer = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      
      const distAssetPath = path.join(distDir, 'assets', filename);
      const rootAssetPath = path.join(blogDir, 'assets', filename);

      await fs.writeFile(distAssetPath, buffer);
      try {
        await fs.writeFile(rootAssetPath, buffer);
      } catch {}

      return sendJson(res, 200, {
        success: true,
        url: `assets/${filename}`,
        fullUrl: `/assets/${filename}`
      });
    }

    // -------------------------------------------------------------
    // API: REBUILD & VERIFY SITE
    // -------------------------------------------------------------
    if (pathname === '/api/build' && method === 'POST') {
      const output = await triggerSiteRebuild();
      return sendJson(res, 200, { success: true, output });
    }

    // -------------------------------------------------------------
    // API: GIT DEPLOY TO VERCEL
    // -------------------------------------------------------------
    if (pathname === '/api/deploy' && method === 'POST') {
      const { message } = await parseJsonBody(req);
      const commitMsg = message && message.trim() ? message.trim() : 'Update content via HCTM Admin Dashboard';
      
      const rootRepoDir = path.resolve(blogDir, '..');
      const commands = [
        'git add .',
        `git commit -m "${commitMsg.replace(/"/g, '\\"')}"`,
        'git push origin main'
      ].join(' && ');

      const { stdout, stderr } = await execAsync(commands, { cwd: rootRepoDir });
      return sendJson(res, 200, {
        success: true,
        output: stdout + (stderr ? '\n' + stderr : '')
      });
    }

    // -------------------------------------------------------------
    // STATIC FILE SERVING FOR ADMIN DASHBOARD
    // -------------------------------------------------------------
    let filePath = path.join(publicDir, pathname === '/' || pathname === '/admin' || pathname === '/admin/' ? 'index.html' : pathname);
    
    // Fallback to index.html for client SPA routes
    if (!existsSync(filePath) || (await fs.stat(filePath)).isDirectory()) {
      filePath = path.join(publicDir, 'index.html');
    }

    if (existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      createReadStream(filePath).pipe(res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');

  } catch (error) {
    console.error('Server error:', error);
    sendJson(res, 500, { error: error.message || 'Internal Server Error' });
  }
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`✨ HCTM Content Management Backend running on:`);
  console.log(`   http://localhost:${PORT}/`);
  console.log(`======================================================\n`);
});
