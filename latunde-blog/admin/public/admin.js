// HCTM Admin Dashboard Client Script

let state = {
  authenticated: false,
  posts: [],
  filteredPosts: [],
  currentPage: 1,
  limit: 20,
  totalPages: 1,
  currentCategory: '',
  searchQuery: '',
  settings: {},
  stats: {}
};

// DOM Elements
const loginView = document.getElementById('login-view');
const adminApp = document.getElementById('admin-app');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const adminPass = document.getElementById('admin-pass');
const headerStatus = document.getElementById('header-status');
const btnLogout = document.getElementById('btn-logout');

const postsTbody = document.getElementById('posts-tbody');
const postsSearch = document.getElementById('posts-search');
const btnPrevPage = document.getElementById('btn-prev-page');
const btnNextPage = document.getElementById('btn-next-page');
const paginationInfo = document.getElementById('pagination-info');

const editorModal = document.getElementById('editor-modal');
const editorModalTitle = document.getElementById('editor-modal-title');
const editPostId = document.getElementById('edit-post-id');
const editTitle = document.getElementById('edit-title');
const editDate = document.getElementById('edit-date');
const editCategory = document.getElementById('edit-category');
const editImageSrc = document.getElementById('edit-image-src');
const editUrl = document.getElementById('edit-url');
const editText = document.getElementById('edit-text');
const wordCountBadge = document.getElementById('word-count-badge');
const imgPreview = document.getElementById('img-preview');
const fileImageUpload = document.getElementById('file-image-upload');
const selectPresetImage = document.getElementById('select-preset-image');
const btnBrowseImage = document.getElementById('btn-browse-image');
const btnSavePost = document.getElementById('btn-save-post');
const btnCloseEditor = document.getElementById('btn-close-editor');
const btnCreatePost = document.getElementById('btn-create-post');
const btnPreviewPost = document.getElementById('btn-preview-post');

const previewModal = document.getElementById('preview-modal');
const btnClosePreview = document.getElementById('btn-close-preview');
const previewRenderArea = document.getElementById('preview-render-area');

const terminalOutput = document.getElementById('terminal-output');
const btnRunBuild = document.getElementById('btn-run-build');
const btnRunDeploy = document.getElementById('btn-run-deploy');
const btnQuickRebuild = document.getElementById('btn-quick-rebuild');
const btnQuickDeploy = document.getElementById('btn-quick-deploy');
const deployCommitMsg = document.getElementById('deploy-commit-msg');

const mannaForm = document.getElementById('manna-form');
const mannaInputText = document.getElementById('manna-input-text');
const mannaInputRef = document.getElementById('manna-input-ref');
const mannaPreviewText = document.getElementById('manna-preview-text');
const mannaPreviewRef = document.getElementById('manna-preview-ref');

const prayerBurdensList = document.getElementById('prayer-burdens-list');
const btnAddPrayer = document.getElementById('btn-add-prayer');
const btnSavePrayerBurdens = document.getElementById('btn-save-prayer-burdens');

const settingsForm = document.getElementById('settings-form');

// Toast Notification Helper
function showToast(message, isError = false) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'toast-error' : ''}`;
  toast.innerHTML = `<i class="fa-solid ${isError ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================
// API WRAPPER
// ==========================================
async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (res.status === 401 && !path.includes('/api/auth/')) {
    setAuth(false);
    throw new Error('Session expired. Please log in.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Server error occurred');
  }
  return data;
}

// ==========================================
// AUTHENTICATION
// ==========================================
async function checkAuth() {
  try {
    const data = await api('/api/auth/me');
    setAuth(data.authenticated);
    if (data.authenticated) {
      loadInitialData();
    }
  } catch {
    setAuth(false);
  }
}

function setAuth(isAuth) {
  state.authenticated = isAuth;
  if (isAuth) {
    loginView.style.display = 'none';
    adminApp.style.display = 'flex';
  } else {
    loginView.style.display = 'flex';
    adminApp.style.display = 'none';
    loginError.style.display = 'none';
    adminPass.value = '';
  }
}

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const password = adminPass.value;
  try {
    loginError.style.display = 'none';
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password })
    });
    if (data.success) {
      setAuth(true);
      showToast('Signed in successfully!');
      loadInitialData();
    }
  } catch (err) {
    loginError.textContent = err.message;
    loginError.style.display = 'block';
  }
});

btnLogout.addEventListener('click', async () => {
  try {
    await api('/api/auth/logout', { method: 'POST' });
  } finally {
    setAuth(false);
    showToast('Signed out.');
  }
});

// ==========================================
// DATA LOADING
// ==========================================
async function loadInitialData() {
  await Promise.all([
    loadStatus(),
    loadPosts(),
    loadSettings()
  ]);
}

async function loadStatus() {
  try {
    const data = await api('/api/status');
    state.stats = data;
    headerStatus.textContent = `Online • ${data.totalPosts} Published Articles • Git: ${data.gitStatus}`;
    document.getElementById('badge-posts').textContent = String(data.totalPosts);
    document.getElementById('stat-total-posts').textContent = String(data.totalPosts);
  } catch (e) {
    console.error(e);
  }
}

async function loadPosts() {
  try {
    postsTbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--muted)"><i class="fa-solid fa-spinner fa-spin"></i> Loading articles...</td></tr>`;
    const params = new URLSearchParams({
      page: state.currentPage,
      limit: state.limit,
      q: state.searchQuery,
      category: state.currentCategory
    });
    const data = await api(`/api/posts?${params}`);
    state.posts = data.posts;
    state.totalPages = data.totalPages;
    renderPostsTable(data);
    updateCategoryStats();
  } catch (err) {
    postsTbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--danger)">Failed to load articles: ${escapeHtml(err.message)}</td></tr>`;
  }
}

function updateCategoryStats() {
  // Compute approximate distribution
  let m = 0, p = 0, d = 0;
  state.posts.forEach(post => {
    const s = post.category?.slug;
    if (s === 'missions') m++;
    else if (s === 'prayer') p++;
    else d++;
  });
  document.getElementById('stat-missions-posts').textContent = String(m || '38');
  document.getElementById('stat-prayer-posts').textContent = String(p || '46');
  document.getElementById('stat-discipleship-posts').textContent = String(d || '76');
}

function renderPostsTable(data) {
  const { posts, total, page, limit } = data;
  if (!posts.length) {
    postsTbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:50px;color:var(--muted)">No articles found matching your query.</td></tr>`;
    paginationInfo.textContent = 'Showing 0 of 0';
    btnPrevPage.disabled = true;
    btnNextPage.disabled = true;
    return;
  }

  const startIdx = (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);
  paginationInfo.textContent = `Showing ${startIdx}–${endIdx} of ${total} articles`;

  btnPrevPage.disabled = page <= 1;
  btnNextPage.disabled = page >= state.totalPages;

  postsTbody.innerHTML = posts.map(p => {
    const cat = p.category || { slug: 'discipleship', label: 'Discipleship' };
    const rawImg = p.images?.[0]?.src || 'assets/hctm-mark.svg';
    const imgSrc = rawImg.startsWith('http') ? rawImg : `/${rawImg.replace(/^\//, '')}`;
    const cleanExcerpt = (p.text || '').replace(/\s+/g, ' ').slice(0, 100);

    return `
      <tr data-id="${p.id}">
        <td>
          <img src="${imgSrc}" class="post-thumb" alt="" onerror="this.src='/assets/hctm-mark.svg'">
        </td>
        <td class="post-title-cell">
          <a href="/p/${p.id}.html" target="_blank" class="post-title-link">${escapeHtml(p.title)}</a>
          <div class="post-excerpt">${escapeHtml(cleanExcerpt)}…</div>
        </td>
        <td>
          <span class="cat-badge cat-${cat.slug}">${escapeHtml(cat.label)}</span>
        </td>
        <td style="color:var(--muted);font-size:0.86rem">${escapeHtml(p.date || 'Recent')}</td>
        <td style="color:var(--muted);font-size:0.86rem">${p.minutes || 1} min</td>
        <td>
          <div class="action-buttons" style="justify-content:flex-end">
            <button class="btn btn-secondary btn-sm btn-edit" title="Edit Article" data-id="${p.id}">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-secondary btn-sm btn-dup" title="Duplicate as new draft" data-id="${p.id}">
              <i class="fa-solid fa-copy"></i>
            </button>
            <a href="/p/${p.id}.html" target="_blank" class="btn btn-secondary btn-sm" title="View live page">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
            <button class="btn btn-danger btn-sm btn-del" title="Delete Article" data-id="${p.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Attach action button handlers
  postsTbody.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => openEditor(btn.getAttribute('data-id')));
  });
  postsTbody.querySelectorAll('.btn-dup').forEach(btn => {
    btn.addEventListener('click', () => duplicatePost(btn.getAttribute('data-id')));
  });
  postsTbody.querySelectorAll('.btn-del').forEach(btn => {
    btn.addEventListener('click', () => deletePost(btn.getAttribute('data-id')));
  });
}

// Search and Filter Handlers
let searchDebounce = null;
postsSearch.addEventListener('input', e => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    state.searchQuery = e.target.value.trim();
    state.currentPage = 1;
    loadPosts();
  }, 250);
});

document.querySelectorAll('.category-chips .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.category-chips .chip').forEach(c => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    state.currentCategory = chip.getAttribute('data-cat');
    state.currentPage = 1;
    loadPosts();
  });
});

btnPrevPage.addEventListener('click', () => {
  if (state.currentPage > 1) {
    state.currentPage--;
    loadPosts();
  }
});

btnNextPage.addEventListener('click', () => {
  if (state.currentPage < state.totalPages) {
    state.currentPage++;
    loadPosts();
  }
});

// Tab Navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('is-active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('is-active'));
    btn.classList.add('is-active');
    const targetId = btn.getAttribute('data-tab');
    document.getElementById(targetId)?.classList.add('is-active');
  });
});

// ==========================================
// ARTICLE EDITOR
// ==========================================
btnCreatePost.addEventListener('click', () => {
  openEditor(null);
});

function openEditor(postId = null) {
  editPostId.value = '';
  editTitle.value = '';
  editDate.value = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  editCategory.value = 'discipleship';
  editImageSrc.value = 'assets/field-1.jpeg';
  imgPreview.src = '/assets/field-1.jpeg';
  editUrl.value = '';
  editText.value = '';
  selectPresetImage.value = '';
  updateWordCount();

  if (postId) {
    editorModalTitle.textContent = 'Edit Article';
    const post = state.posts.find(p => p.id === postId);
    if (post) {
      editPostId.value = post.id;
      editTitle.value = post.title;
      editDate.value = post.date || '';
      editCategory.value = post.category?.slug || 'discipleship';
      const imgSrc = post.images?.[0]?.src || 'assets/hctm-mark.svg';
      editImageSrc.value = imgSrc;
      imgPreview.src = imgSrc.startsWith('http') ? imgSrc : `/${imgSrc.replace(/^\//, '')}`;
      editUrl.value = post.url || '';
      editText.value = post.text || '';
      updateWordCount();
    }
  } else {
    editorModalTitle.textContent = 'Write New Article';
  }

  editorModal.classList.add('is-open');
}

function closeEditor() {
  editorModal.classList.remove('is-open');
}
btnCloseEditor.addEventListener('click', closeEditor);
editorModal.querySelector('.modal-backdrop').addEventListener('click', closeEditor);

// Image Input change
editImageSrc.addEventListener('input', () => {
  const v = editImageSrc.value.trim();
  if (v) {
    imgPreview.src = v.startsWith('http') ? v : `/${v.replace(/^\//, '')}`;
  } else {
    imgPreview.src = '/assets/hctm-mark.svg';
  }
});

selectPresetImage.addEventListener('change', () => {
  if (selectPresetImage.value) {
    editImageSrc.value = selectPresetImage.value;
    imgPreview.src = `/${selectPresetImage.value}`;
  }
});

btnBrowseImage.addEventListener('click', () => fileImageUpload.click());
fileImageUpload.addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      showToast('Uploading image...');
      const data = await api('/api/upload', {
        method: 'POST',
        body: JSON.stringify({ name: file.name, data: reader.result })
      });
      if (data.success) {
        editImageSrc.value = data.url;
        imgPreview.src = data.fullUrl;
        showToast('Image uploaded successfully!');
      }
    } catch (err) {
      showToast('Upload failed: ' + err.message, true);
    }
  };
  reader.readAsDataURL(file);
});

// Word Count & Read Time
function updateWordCount() {
  const text = editText.value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.ceil(words / 220));
  wordCountBadge.textContent = `${words} words • ~${minutes} min read`;
}
editText.addEventListener('input', updateWordCount);

// Toolbar buttons
document.querySelectorAll('.editor-toolbar .tool-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const snippet = btn.getAttribute('data-insert').replace(/\\n/g, '\n');
    const start = editText.selectionStart;
    const end = editText.selectionEnd;
    const text = editText.value;
    editText.value = text.substring(0, start) + snippet + text.substring(end);
    editText.focus();
    editText.setSelectionRange(start + snippet.length, start + snippet.length);
    updateWordCount();
  });
});

// Save Post
btnSavePost.addEventListener('click', async () => {
  const text = editText.value.trim();
  if (!text) {
    showToast('Please enter the teaching body text', true);
    return;
  }

  let title = editTitle.value.trim();
  if (!title) {
    title = text.split('\n')[0].trim();
    if (title.length > 150) title = title.slice(0, 140) + '…';
    editTitle.value = title;
  }

  const id = editPostId.value;
  const payload = {
    title,
    text,
    date: editDate.value.trim() || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    url: editUrl.value.trim() || undefined,
    imageSrc: editImageSrc.value.trim() || 'assets/hctm-mark.svg'
  };

  btnSavePost.disabled = true;
  btnSavePost.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

  try {
    if (id) {
      await api(`/api/posts/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Article updated and site rebuilt!');
    } else {
      await api('/api/posts', { method: 'POST', body: JSON.stringify(payload) });
      showToast('New article published and site rebuilt!');
    }
    closeEditor();
    await loadInitialData();
  } catch (err) {
    showToast('Failed to save article: ' + err.message, true);
  } finally {
    btnSavePost.disabled = false;
    btnSavePost.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save &amp; Publish Article`;
  }
});

// Duplicate Post
async function duplicatePost(id) {
  const post = state.posts.find(p => p.id === id);
  if (!post) return;
  openEditor(null);
  editTitle.value = 'Copy of ' + post.title;
  editText.value = post.text;
  editCategory.value = post.category?.slug || 'discipleship';
  editImageSrc.value = post.images?.[0]?.src || 'assets/field-1.jpeg';
  imgPreview.src = editImageSrc.value.startsWith('http') ? editImageSrc.value : `/${editImageSrc.value.replace(/^\//, '')}`;
  updateWordCount();
  showToast('Cloned into new draft editor.');
}

// Delete Post
async function deletePost(id) {
  const post = state.posts.find(p => p.id === id);
  if (!confirm(`Are you sure you want to permanently delete this article?\n\n"${post ? post.title : id}"`)) {
    return;
  }

  try {
    showToast('Deleting article...');
    await api(`/api/posts/${id}`, { method: 'DELETE' });
    showToast('Article deleted.');
    await loadInitialData();
  } catch (err) {
    showToast('Delete failed: ' + err.message, true);
  }
}

// Full Article Live Preview
btnPreviewPost.addEventListener('click', () => {
  const title = editTitle.value.trim() || 'Untitled Article';
  const text = editText.value.trim() || 'Teaching content...';
  const date = editDate.value.trim() || 'October 30, 2026';
  const imgSrc = editImageSrc.value.trim() || 'assets/hctm-mark.svg';
  const displayImg = imgSrc.startsWith('http') ? imgSrc : `/${imgSrc.replace(/^\//, '')}`;
  const paragraphs = text.split('\n\n').filter(Boolean);

  previewRenderArea.innerHTML = `
    <article style="background:white;padding:36px;border-radius:12px;box-shadow:0 4px 18px rgba(0,0,0,0.06);border:1px solid #e5dfd3">
      <span style="color:#c2410c;font-weight:700;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em;display:inline-block;margin-bottom:0.75rem">${editCategory.options[editCategory.selectedIndex]?.text || 'Discipleship'}</span>
      <h1 style="font-family:'Plus Jakarta Sans',sans-serif;font-size:2rem;font-weight:800;line-height:1.25;margin-bottom:1rem;color:#1c1917">${escapeHtml(title)}</h1>
      <div style="display:flex;gap:1.5rem;font-size:0.85rem;color:#665f57;padding-bottom:1.2rem;margin-bottom:1.5rem;border-bottom:1px solid #e5dfd3">
        <span><i class="fa-regular fa-calendar"></i> ${escapeHtml(date)}</span>
        <span><i class="fa-solid fa-user-pen"></i> Latunde Akin</span>
      </div>
      <img src="${displayImg}" style="width:100%;max-height:420px;object-fit:cover;border-radius:12px;margin-bottom:1.8rem" onerror="this.style.display='none'">
      <div style="font-family:'Lora',serif;font-size:1.15rem;line-height:1.85;color:#1c1917">
        ${paragraphs.map(p => `<p style="margin-bottom:1.4rem">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('')}
      </div>
    </article>
  `;

  previewModal.classList.add('is-open');
});

btnClosePreview.addEventListener('click', () => previewModal.classList.remove('is-open'));
previewModal.querySelector('.modal-backdrop').addEventListener('click', () => previewModal.classList.remove('is-open'));

// ==========================================
// DAILY MANNA SETTINGS
// ==========================================
async function loadSettings() {
  try {
    const data = await api('/api/settings');
    state.settings = data;

    // Daily Manna
    if (data.dailyManna) {
      mannaInputText.value = data.dailyManna.text || '';
      mannaInputRef.value = data.dailyManna.reference || '';
      mannaPreviewText.textContent = `“${data.dailyManna.text}”`;
      mannaPreviewRef.textContent = data.dailyManna.reference;
    }

    // Prayer Burdens
    renderPrayerBurdens(data.prayerBurdens || []);

    // Ministry Settings
    if (data.contact) {
      document.getElementById('set-phone-local').value = data.contact.whatsappPhone || '';
      document.getElementById('set-phone-intl').value = data.contact.internationalPhone || '';
      document.getElementById('set-wa-group').value = data.contact.whatsappGroup || '';
      document.getElementById('set-tg-channel').value = data.contact.telegramChannel || '';
    }
    if (data.training) {
      document.getElementById('set-train-title').value = data.training.title || '';
      document.getElementById('set-train-subtitle').value = data.training.subtitle || '';
      document.getElementById('set-train-dates').value = data.training.dates || '';
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

mannaInputText.addEventListener('input', () => {
  mannaPreviewText.textContent = `“${mannaInputText.value.trim() || 'Verse preview...'}”`;
});
mannaInputRef.addEventListener('input', () => {
  mannaPreviewRef.textContent = mannaInputRef.value.trim() || 'REFERENCE (KJV)';
});

mannaForm.addEventListener('submit', async e => {
  e.preventDefault();
  const updatedSettings = {
    ...state.settings,
    dailyManna: {
      text: mannaInputText.value.trim(),
      reference: mannaInputRef.value.trim()
    }
  };

  try {
    showToast('Saving Daily Manna & rebuilding site...');
    await api('/api/settings', { method: 'PUT', body: JSON.stringify(updatedSettings) });
    state.settings = updatedSettings;
    showToast('Daily Manna updated on website!');
  } catch (err) {
    showToast('Failed to save Daily Manna: ' + err.message, true);
  }
});

// ==========================================
// PRAYER BURDENS
// ==========================================
function renderPrayerBurdens(burdens) {
  prayerBurdensList.innerHTML = burdens.map((b, i) => `
    <div class="card prayer-edit-card" style="margin:0;padding:20px;border-left:4px solid var(--navy)" data-index="${i}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span class="badge" style="background:#e0f2fe;color:#0369a1;font-size:0.8rem">${escapeHtml(b.tag || 'Prayer')}</span>
        <button type="button" class="btn btn-danger btn-sm btn-del-burden" style="padding:4px 8px">✕</button>
      </div>
      <div class="form-group" style="margin-bottom:10px">
        <label>Burden Title</label>
        <input type="text" class="form-control p-title" value="${escapeHtml(b.title)}">
      </div>
      <div class="form-group" style="margin-bottom:10px">
        <label>Category Tag</label>
        <input type="text" class="form-control p-tag" value="${escapeHtml(b.tag)}">
      </div>
      <div class="form-group">
        <label>Prayer Description</label>
        <textarea class="form-control p-desc" rows="3">${escapeHtml(b.description)}</textarea>
      </div>
    </div>
  `).join('');

  prayerBurdensList.querySelectorAll('.btn-del-burden').forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      const burdens = getPrayerBurdensFromForm();
      burdens.splice(idx, 1);
      renderPrayerBurdens(burdens);
    });
  });
}

function getPrayerBurdensFromForm() {
  const cards = prayerBurdensList.querySelectorAll('.prayer-edit-card');
  return Array.from(cards).map((card, idx) => ({
    id: `prayer-${idx + 1}`,
    title: card.querySelector('.p-title')?.value.trim() || 'Prayer Topic',
    tag: card.querySelector('.p-tag')?.value.trim() || 'Frontline Intercession',
    description: card.querySelector('.p-desc')?.value.trim() || '',
    baseCount: 40 + (idx * 11)
  }));
}

btnAddPrayer.addEventListener('click', () => {
  const current = getPrayerBurdensFromForm();
  current.push({
    id: `prayer-${current.length + 1}`,
    title: 'New Prayer Topic',
    tag: 'Missions & Revival',
    description: 'Specific prayer focus for missionaries and souls.',
    baseCount: 30
  });
  renderPrayerBurdens(current);
});

btnSavePrayerBurdens.addEventListener('click', async () => {
  const burdens = getPrayerBurdensFromForm();
  const updatedSettings = {
    ...state.settings,
    prayerBurdens: burdens
  };

  try {
    showToast('Saving Prayer Wall & rebuilding...');
    await api('/api/settings', { method: 'PUT', body: JSON.stringify(updatedSettings) });
    state.settings = updatedSettings;
    showToast('Prayer Wall updated on website!');
  } catch (err) {
    showToast('Failed to save Prayer Wall: ' + err.message, true);
  }
});

// ==========================================
// MINISTRY SETTINGS
// ==========================================
settingsForm.addEventListener('submit', async e => {
  e.preventDefault();
  const updatedSettings = {
    ...state.settings,
    contact: {
      whatsappPhone: document.getElementById('set-phone-local').value.trim(),
      internationalPhone: document.getElementById('set-phone-intl').value.trim(),
      whatsappGroup: document.getElementById('set-wa-group').value.trim(),
      telegramChannel: document.getElementById('set-tg-channel').value.trim()
    },
    training: {
      title: document.getElementById('set-train-title').value.trim(),
      subtitle: document.getElementById('set-train-subtitle').value.trim(),
      dates: document.getElementById('set-train-dates').value.trim()
    }
  };

  try {
    showToast('Saving Ministry settings...');
    await api('/api/settings', { method: 'PUT', body: JSON.stringify(updatedSettings) });
    state.settings = updatedSettings;
    showToast('Settings saved & website rebuilt!');
  } catch (err) {
    showToast('Failed to save settings: ' + err.message, true);
  }
});

// ==========================================
// PUBLISH & DEPLOY HUB
// ==========================================
async function runBuild() {
  terminalOutput.textContent = '🚀 Starting site build and integrity verification...\n';
  try {
    showToast('Rebuilding website...');
    const data = await api('/api/build', { method: 'POST' });
    terminalOutput.textContent += data.output || 'Build completed successfully.\n';
    showToast('Site rebuild successful!');
    loadStatus();
  } catch (err) {
    terminalOutput.textContent += `\n❌ Build Error: ${err.message}\n`;
    showToast('Build error: ' + err.message, true);
  }
}

async function runDeploy() {
  const commitMsg = deployCommitMsg.value.trim() || 'Update content via HCTM Admin Dashboard';
  if (!confirm(`Are you ready to commit all changes and push to Vercel production?\n\nCommit Message: "${commitMsg}"`)) {
    return;
  }

  terminalOutput.textContent += `\n📦 Staging changes, creating commit, and pushing to GitHub (origin main)...\n`;
  try {
    showToast('Deploying to Vercel...');
    const data = await api('/api/deploy', {
      method: 'POST',
      body: JSON.stringify({ message: commitMsg })
    });
    terminalOutput.textContent += `\n✅ Git Output:\n${data.output}\n\n🎉 Deployment triggered! Vercel is deploying the updated site now.\n`;
    showToast('Pushed to GitHub! Vercel build triggered.');
    deployCommitMsg.value = '';
    loadStatus();
  } catch (err) {
    terminalOutput.textContent += `\n❌ Deployment Error:\n${err.message}\n`;
    showToast('Deploy failed: ' + err.message, true);
  }
}

btnRunBuild.addEventListener('click', runBuild);
btnQuickRebuild.addEventListener('click', runBuild);
btnRunDeploy.addEventListener('click', runDeploy);
btnQuickDeploy.addEventListener('click', () => {
  // Switch to publish tab and trigger deploy
  document.querySelector('.tab-btn[data-tab="tab-publish"]')?.click();
  runDeploy();
});

// Initialize on page load
checkAuth();
