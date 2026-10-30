document.documentElement.classList.add('js');

// Hash redirection for legacy post URLs
const oldPost = location.hash.match(/^#\/post\/([a-f0-9]{12})$/);
if (oldPost && (location.pathname === '/' || location.pathname === '/index.html')) {
  location.replace('/p/' + oldPost[1] + '.html');
}

// Mobile navigation menu toggle
const menu = document.querySelector('.menu-toggle');
menu?.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!expanded));
  document.querySelector('#site-nav')?.classList.toggle('is-open', !expanded);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (menu?.getAttribute('aria-expanded') === 'true') {
      menu.setAttribute('aria-expanded', 'false');
      document.querySelector('#site-nav')?.classList.remove('is-open');
      menu.focus();
    }
    closeBibleModal();
  }
});

// Prayer Request form submission
document.querySelector('#prayer-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const request = document.querySelector('#prayer-message');
  if (!request.value.trim()) {
    request.setCustomValidity('Please enter your prayer request.');
    request.reportValidity();
    return;
  }
  request.setCustomValidity('');
  const name = document.querySelector('#prayer-name')?.value.trim();
  const reply = document.querySelector('#prayer-reply')?.checked;
  const text = [
    'Prayer request for HCTM',
    name ? 'Name: ' + name : '',
    request.value.trim(),
    reply ? 'I would appreciate a reply on WhatsApp.' : 'No reply needed.'
  ].filter(Boolean).join('\n\n');
  location.assign('https://wa.me/2348123428989?text=' + encodeURIComponent(text));
});

document.querySelector('#prayer-message')?.addEventListener('input', event => event.target.setCustomValidity(''));

const submit = document.querySelector('#prayer-submit');
if (submit) submit.disabled = false;

// Lightbox dialog for gallery photographs
const dialog = document.querySelector('#photo-dialog');
let photoTrigger;
document.querySelectorAll('.gallery-open').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  photoTrigger = link;
  const dialogImg = document.querySelector('#dialog-image');
  const dialogCap = document.querySelector('#dialog-caption');
  if (dialogImg) {
    dialogImg.src = link.href;
    dialogImg.alt = link.dataset.caption || '';
  }
  if (dialogCap) {
    dialogCap.textContent = link.dataset.caption || '';
  }
  dialog?.showModal();
}));

document.querySelector('#photo-close')?.addEventListener('click', () => dialog?.close());
dialog?.addEventListener('close', () => photoTrigger?.focus());
dialog?.addEventListener('click', event => {
  if (event.target === dialog) {
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) {
      dialog.close();
    }
  }
});

// Interactive Hero Carousel
(function initHeroCarousel() {
  if (typeof window === 'undefined') return;
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  if (!slides.length) return;

  const dots = Array.from(document.querySelectorAll('.carousel-dot'));
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  const container = document.querySelector('.hero');
  let currentIdx = 0;
  let timer = null;

  function setSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentIdx = index;

    slides.forEach((slide, i) => {
      const isActive = i === currentIdx;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });

    dots.forEach((dot, i) => {
      const isActive = i === currentIdx;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });
  }

  function advance() {
    setSlide(currentIdx + 1);
  }

  function retreat() {
    setSlide(currentIdx - 1);
  }

  prevBtn?.addEventListener('click', () => {
    retreat();
    resetAuto();
  });

  nextBtn?.addEventListener('click', () => {
    advance();
    resetAuto();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      setSlide(i);
      resetAuto();
    });
  });

  function startAuto() {
    if (typeof setInterval === 'function' && !timer) {
      timer = setInterval(advance, 6500);
      if (timer && typeof timer.unref === 'function') {
        timer.unref();
      }
    }
  }

  function stopAuto() {
    if (typeof clearInterval === 'function' && timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function resetAuto() {
    stopAuto();
    startAuto();
  }

  container?.addEventListener('mouseenter', stopAuto);
  container?.addEventListener('mouseleave', startAuto);
  container?.addEventListener('focusin', stopAuto);
  container?.addEventListener('focusout', startAuto);

  // Pause carousel when tab is hidden to prevent timer queue burst
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAuto();
      else startAuto();
    });
  }

  // Swipe gesture support on touch devices
  let touchStartX = 0;
  container?.addEventListener('touchstart', e => {
    if (e.changedTouches && e.changedTouches[0]) {
      touchStartX = e.changedTouches[0].screenX;
    }
  }, { passive: true });

  container?.addEventListener('touchend', e => {
    if (e.changedTouches && e.changedTouches[0]) {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 45) {
        if (diff < 0) advance();
        else retreat();
        resetAuto();
      }
    }
  }, { passive: true });

  startAuto();
})();

// ==========================================
// BIBLE SCRIPTURE TOOLTIP & POPUP PLUGIN
// ==========================================
const SCRIPTURE_DICTIONARY = {
  'Jude 1:22': '“And of some have compassion, making a difference:”',
  'Jude 1:22-23': '“And of some have compassion, making a difference: And others save with fear, pulling them out of the fire; hating even the garment spotted by the flesh.”',
  'John 3:16': '“For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.”',
  'Romans 3:23': '“For all have sinned, and come short of the glory of God;”',
  'Romans 5:8': '“But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.”',
  'Romans 6:23': '“For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.”',
  'Romans 10:9-10': '“That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved. For with the heart man believeth unto righteousness; and with the mouth confession is made unto salvation.”',
  'Romans 10:14': '“How then shall they call on him in whom they have not believed? and how shall they believe in him of whom they have not heard? and how shall they hear without a preacher?”',
  'Matthew 28:19': '“Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:”',
  'Matthew 28:19-20': '“Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost: Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the end of the world. Amen.”',
  'Matthew 9:37-38': '“Then saith he unto his disciples, The harvest truly is plenteous, but the labourers are few; Pray ye therefore the Lord of the harvest, that he will send forth labourers into his harvest.”',
  'Proverbs 11:30': '“The fruit of the righteous is a tree of life; and he that winneth souls is wise.”',
  'Luke 19:10': '“For the Son of man is come to seek and to save that which was lost.”',
  'Acts 1:8': '“But ye shall receive power, after that the Holy Ghost is come upon you: and ye shall be witnesses unto me both in Jerusalem, and in all Judaea, and in Samaria, and unto the uttermost part of the earth.”',
  '2 Corinthians 5:17': '“Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.”',
  '2 Corinthians 5:20': '“Now then we are ambassadors for Christ, as though God did beseech you by us: we pray you in Christ\'s stead, be ye reconciled to God.”',
  'Galatians 2:20': '“I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me.”',
  'Ephesians 6:10-12': '“Finally, my brethren, be strong in the Lord, and in the power of his might. Put on the whole armour of God, that ye may be able to stand against the wiles of the devil. For we wrestle not against flesh and blood, but against principalities, against powers, against the rulers of the darkness of this world, against spiritual wickedness in high places.”',
  '1 Thessalonians 5:17': '“Pray without ceasing.”',
  '3 John 1:8': '“We therefore ought to receive such, that we might be fellowhelpers to the truth.”',
  'James 5:16': '“Confess your faults one to another, and pray one for another, that ye may be healed. The effectual fervent prayer of a righteous man availeth much.”'
};

function closeBibleModal() {
  const modal = document.querySelector('#bible-verse-modal');
  if (modal) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function showBibleVerse(ref, text) {
  let modal = document.querySelector('#bible-verse-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'bible-verse-modal';
    modal.className = 'bible-modal';
    modal.innerHTML = `
      <div class="bible-modal-backdrop"></div>
      <div class="bible-modal-card" role="dialog" aria-modal="true" aria-labelledby="bible-modal-title">
        <button class="bible-modal-close" aria-label="Close scripture popup">✕</button>
        <div class="bible-modal-header">
          <span class="bible-tag">HOLY SCRIPTURE (KJV)</span>
          <h3 id="bible-modal-title" class="bible-ref"></h3>
        </div>
        <div class="bible-modal-body">
          <p id="bible-modal-text" class="bible-text"></p>
        </div>
        <div class="bible-modal-footer">
          <button id="bible-copy-btn" class="button secondary btn-sm">📋 Copy Scripture</button>
          <a id="bible-whatsapp-share" class="button btn-sm" target="_blank" rel="noopener noreferrer">Share to WhatsApp</a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.bible-modal-close')?.addEventListener('click', closeBibleModal);
    modal.querySelector('.bible-modal-backdrop')?.addEventListener('click', closeBibleModal);
    modal.querySelector('#bible-copy-btn')?.addEventListener('click', () => {
      const copyText = `${document.querySelector('#bible-modal-text')?.textContent} — ${document.querySelector('#bible-modal-title')?.textContent} (KJV)`;
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(copyText);
        const btn = document.querySelector('#bible-copy-btn');
        if (btn) {
          const prev = btn.textContent;
          btn.textContent = '✓ Copied!';
          setTimeout(() => btn.textContent = prev, 2000);
        }
      }
    });
  }

  const titleEl = modal.querySelector('#bible-modal-title');
  const textEl = modal.querySelector('#bible-modal-text');
  const waShare = modal.querySelector('#bible-whatsapp-share');

  if (titleEl) titleEl.textContent = ref;
  if (textEl) textEl.textContent = text;
  if (waShare) {
    const shareMessage = `📖 Scripture of Hope & Truth:\n\n${text}\n\n— ${ref} (KJV)\n\nShared via Have Compassion on Them Missions (HCTM)\nhttps://latunde-akin-blog.vercel.app/`;
    waShare.href = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(shareMessage);
  }

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
}

// Bind verse trigger clicks
document.querySelectorAll('[data-verse]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    const ref = el.getAttribute('data-verse') || el.textContent.trim();
    const cached = SCRIPTURE_DICTIONARY[ref];
    if (cached) {
      showBibleVerse(ref, cached);
    } else {
      showBibleVerse(ref, 'Loading Scripture passage...');
      if (typeof fetch === 'function') {
        fetch(`https://bible-api.com/${encodeURIComponent(ref)}?translation=kjv`)
          .then(r => r.json())
          .then(data => {
            if (data && data.text) {
              const clean = data.text.replace(/\s+/g, ' ').trim();
              SCRIPTURE_DICTIONARY[ref] = `“${clean}”`;
              showBibleVerse(ref, `“${clean}”`);
            } else {
              showBibleVerse(ref, '“Search the scriptures; for in them ye think ye have eternal life: and they are they which testify of me.” — John 5:39');
            }
          })
          .catch(() => {
            showBibleVerse(ref, '“Thy word is a lamp unto my feet, and a light unto my path.” — Psalm 119:105');
          });
      }
    }
  });
});

// ==========================================
// INTERACTIVE PRAYER WALL COUNTER
// ==========================================
const storage = typeof localStorage !== 'undefined' ? localStorage : null;

document.querySelectorAll('.prayer-stand-btn').forEach(btn => {
  const prayerId = btn.getAttribute('data-prayer-id') || 'general';
  const countSpan = btn.querySelector('.prayer-count');
  
  // Load saved count
  let currentCount = 12; // Base intercessors
  if (storage) {
    const saved = storage.getItem('hctm_pray_' + prayerId);
    if (saved) currentCount = parseInt(saved, 10);
  }
  if (countSpan) countSpan.textContent = String(currentCount);

  btn.addEventListener('click', () => {
    currentCount++;
    if (countSpan) {
      countSpan.textContent = String(currentCount);
    }
    btn.classList.add('has-prayed');
    btn.setAttribute('disabled', 'true');
    const label = btn.querySelector('.prayer-btn-label');
    if (label) label.textContent = 'Prayed with You 🙏';
    if (storage) {
      storage.setItem('hctm_pray_' + prayerId, String(currentCount));
    }
  });
});

// ==========================================
// DAILY MANNA STATUS SHARER
// ==========================================
document.querySelector('#daily-manna-share')?.addEventListener('click', e => {
  e.preventDefault();
  const verseEl = document.querySelector('#manna-verse-text');
  const refEl = document.querySelector('#manna-verse-ref');
  const text = verseEl ? verseEl.textContent.trim() : 'And of some have compassion, making a difference.';
  const ref = refEl ? refEl.textContent.trim() : 'Jude 1:22';
  const msg = `🌅 Daily Manna for the Harvest · HCTM\n\n${text}\n— ${ref} (KJV)\n\n“Winning souls for Christ. Restoring discipleship. Supporting missionaries.”\nhttps://latunde-akin-blog.vercel.app/`;
  location.assign('https://api.whatsapp.com/send?text=' + encodeURIComponent(msg));
});

// ==========================================
// PRINT TRACT / HANDOUT TRIGGER
// ==========================================
document.querySelectorAll('.btn-print-tract').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  });
});
