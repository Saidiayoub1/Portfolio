/* =============================================================
   AYOUB SAIDI — PORTFOLIO  |  script.js
   Clean rewrite — one reveal system, no conflicts
   ============================================================= */

/* ── ELEMENTS ──────────────────────────────────────────────── */
const header   = document.querySelector('.header');
const menuIcon = document.querySelector('#menu-icon');
const menuIconI = menuIcon?.querySelector('i');
const navbar   = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.navbar a');
const sections = document.querySelectorAll('section[id]');

/* ============================================================
   MOBILE MENU
   ============================================================ */
function openMenu() {
  navbar.classList.add('active');
  document.body.classList.add('menu-open');
  menuIconI?.classList.replace('bx-menu', 'bx-x');
  menuIcon?.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  navbar.classList.remove('active');
  document.body.classList.remove('menu-open');
  menuIconI?.classList.replace('bx-x', 'bx-menu');
  menuIcon?.setAttribute('aria-expanded', 'false');
}

menuIcon?.addEventListener('click', () => {
  navbar.classList.contains('active') ? closeMenu() : openMenu();
});

// Close on nav link click
navLinks.forEach(a => a.addEventListener('click', closeMenu));

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

// Close when clicking outside the open menu
document.addEventListener('click', e => {
  if (
    navbar?.classList.contains('active') &&
    !navbar.contains(e.target) &&
    e.target !== menuIcon &&
    !menuIcon?.contains(e.target)
  ) {
    closeMenu();
  }
});


/* ============================================================
   SCROLL — sticky header + active nav link
   ============================================================ */
function onScroll() {
  const scrollY = window.scrollY;

  // Sticky header
  header?.classList.toggle('sticky', scrollY > 80);

  // Active nav link: highlight whichever section is in view
  sections.forEach(sec => {
    const top    = sec.offsetTop - 130;
    const bottom = top + sec.offsetHeight;
    const link   = document.querySelector(`.navbar a[href="#${sec.id}"]`);
    if (!link) return;
    link.classList.toggle('active', scrollY >= top && scrollY < bottom);
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run once on load so header/nav state is correct immediately


/* ============================================================
   SCROLL REVEAL  (single IntersectionObserver)
   ============================================================ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target); // fire only once
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
);

// Helper: add .reveal and observe a CSS selector (or array of selectors)
function revealAll(selector) {
  document.querySelectorAll(selector).forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
}

// What to animate on scroll
revealAll('.about .heading');
revealAll('.about .about-img');
revealAll('.about .about-content p');

revealAll('.education .heading');
revealAll('.education .education-content');

revealAll('.skills .heading');
revealAll('.skills .skill-card');    // CSS stagger delays are in style.css

revealAll('.projects .heading');
revealAll('.projects .project-body');
revealAll('.projects .project-media-grid');


/* ============================================================
   LIGHTBOX  (click image → enlarge; click backdrop or image to close)
   ============================================================ */
(function initLightbox() {
  const lightbox  = document.querySelector('.lightbox');
  if (!lightbox) return;

  const imgEl  = lightbox.querySelector('.lightbox-image');
  const capEl  = lightbox.querySelector('.lightbox-caption');

  function open(src, alt) {
    imgEl.src         = src;
    imgEl.alt         = alt;
    capEl.textContent = alt;
    lightbox.classList.add('open');
    document.body.classList.add('lightbox-open');
    lightbox.removeAttribute('aria-hidden');
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.classList.remove('lightbox-open');
    lightbox.setAttribute('aria-hidden', 'true');
    // Clear src after fade (50 ms so the image doesn't flicker on close)
    setTimeout(() => { imgEl.src = ''; imgEl.alt = ''; capEl.textContent = ''; }, 50);
  }

  // ── OPEN: click on an image inside a project gallery ──────
  // Only <a data-lightbox> links trigger the lightbox;
  // PDF toolbar buttons (<a href="…pdf">) do NOT have data-lightbox so they open normally.
  document.querySelectorAll('.project-media-grid').forEach(grid => {
    grid.addEventListener('click', e => {
      // Must be an <img> click
      const img  = e.target.closest('img');
      if (!img) return;

      // Must be inside an <a data-lightbox> link
      const link = img.closest('a[data-lightbox]');
      if (!link) return;

      e.preventDefault();
      open(link.getAttribute('href'), img.getAttribute('alt') || '');
    });
  });

  // ── CLOSE: backdrop, image click, or Escape ───────────────
  lightbox.querySelector('.lightbox-backdrop')?.addEventListener('click', close);
  imgEl.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

