# Latunde Akin — Blog & Writings Archive

An elegant, responsive static publication and archive of writings, devotionals, and ministry teachings by **Latunde Akin** (*Have Compassion on Them Missions - HCTM*).

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
│   │   ├── index.html          # Modern, responsive blog application
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

### Option 1: Direct File
Simply open `latunde-blog/dist/index.html` in any browser.

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
