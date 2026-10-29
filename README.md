# Have Compassion on Them Missions — Website

A responsive HCTM ministry website with the complete **Latunde Akin** writings archive under `/blog/`. The homepage introduces the ministry; the existing 160 article URLs remain at `/p/<id>.html`.

## Ministry website

Pages: Home, About, Missions, Blog, Mission Field Gallery, Prayer, Submit a Prayer Request, Training, Support, Contact, and Privacy.

The prayer community page includes the supplied WhatsApp group and Telegram channel. The prayer-request page drafts a message locally and opens WhatsApp for the visitor to review and send. It does not send messages automatically or store prayer requests in a database. A direct WhatsApp link remains available without JavaScript. The gallery includes three collected photographs with full-size viewing; seven additional photographs remain to collect.

`latunde-blog/build-website.mjs` generates the ministry pages and relocates the archive interface from `templates/blog.html` to `/blog/`. `prepare.mjs` runs the original import pipeline and then this website build. The original post text and source data are preserved. Old root hash links (`/#/post/<id>`) redirect to the matching static article.

Set `SITE_ORIGIN` to the actual deployed origin when building to generate the complete sitemap. Without it, the build omits the sitemap rather than advertising an unconfirmed domain. Existing historical article metadata remains part of the archive.

Build the website from the existing archive data, without downloading images again:

```bash
cd latunde-blog
npm run build:site
npm run check
```

The checker verifies all 171 HTML pages, local links and images, archive text preservation, JavaScript syntax, and the prayer-message handoff without sending a message.

---

## 🌟 Highlights & Features

- **160 Curated Articles & Reflections**: Complete with reading times, dates, and topics.
- **Categorization & Topic Filtering**:
  - Missions & Outreach
  - Prayer & Spiritual Warfare (Night prayers, marathon intercession)
  - Discipleship & Spiritual Walk
  - Life, Marriage & Character Transformation
  - Lessons & Leaders
- **Instant Search**: Real-time filtering across titles, body text, and keywords.
- **Clean Devotional Reader**:
  - Modal overlay with deep-linking (`#/post/:id`) so individual articles can be directly linked and shared.
  - Arrow key navigation (`←` previous, `→` next).
  - WhatsApp share and copy link actions.
  - Direct links back to original Facebook posts.
- **Dark & Light Mode**: Built-in toggle with automatic system theme detection and local persistence.
- **HCTM Ministry Links**: One-click WhatsApp link to join the intercessory team (`+234 812 342 8989`) and night prayer watch info.
- **Zero-Dependency Architecture**: Standalone static build ready for OpenAI app hosting, GitHub Pages, Vercel, Netlify, or local offline viewing.

---

## 📁 Directory Structure

```
LatundeAkin/
├── latunde-blog/
│   ├── .openai/
│   │   └── hosting.json        # Static hosting config (dist directory)
│   ├── dist/                   # Production-ready static site
│   │   ├── assets/             # 85 downloaded high-res post images
│   │   ├── index.html          # HCTM ministry homepage
│   │   ├── blog/index.html     # Existing archive with Facebook Posts filter
│   │   ├── posts.json          # Formatted JSON article data (160 posts)
│   │   └── posts.js            # Standalone JS data for local offline viewing
│   ├── import-status.json      # Archive import & validation summary
│   ├── prepare.mjs             # Pipeline to normalize posts & fetch images
│   ├── raw-posts.json          # Original captured posts
│   └── package.json            # Scripts & project metadata
└── README.md
```

---

## 🚀 How to Run Locally

Use an HTTP server; the website uses routes and cannot be previewed correctly by opening a file directly.

### Option 2: Local HTTP Server
From the `latunde-blog` folder:
```bash
npm run serve
```
or with Python:
```bash
python -m http.server -d dist 8000
```
Then visit `http://localhost:8000`.

---

## 🔄 Re-running Data Pipeline

To re-process raw posts or refresh images:
```bash
node prepare.mjs
```
