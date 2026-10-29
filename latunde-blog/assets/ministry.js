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
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
    menu.setAttribute('aria-expanded', 'false');
    document.querySelector('#site-nav')?.classList.remove('is-open');
    menu.focus();
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

  // Swipe gesture support on touch devices
  let touchStartX = 0;
  container?.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  container?.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 45) {
      if (diff < 0) advance();
      else retreat();
      resetAuto();
    }
  }, { passive: true });

  startAuto();
})();
