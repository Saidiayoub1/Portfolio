// ====== ELEMENTS ======
const header   = document.querySelector('.header');      // <header class="header">
const menuIcon = document.querySelector('#menu-icon');   // burger (boxicons)
const navbar   = document.querySelector('.navbar');      // <nav class="navbar">
const navLinks = document.querySelectorAll('header nav a');
const sections = document.querySelectorAll('section');
const footerEl = document.querySelector('.footer');      // <div class="footer"> (class)

// Trigger reveals a bit earlier so animations feel faster
const REVEAL_OFFSET = 50; // px before the section top to start "show-animate"

// ====== MENU CONTROL ======
function setMenu(open) {
  if (!navbar || !menuIcon) return;
  navbar.classList.toggle('active', open);           // shows the full-screen overlay (CSS)
  menuIcon.classList.toggle('bx-x', open);           // burger → X
  document.body.classList.toggle('menu-open', open); // lock/unlock page scroll
  menuIcon.setAttribute('aria-expanded', String(open));
}

menuIcon?.addEventListener('click', () => {
  setMenu(!navbar.classList.contains('active'));
});

// close menu when a link is clicked
navLinks.forEach(a => a.addEventListener('click', () => setMenu(false)));

// close on Escape
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setMenu(false);
});

// ====== SCROLL BEHAVIOR ======
window.addEventListener('scroll', () => {
  const top = window.scrollY;

  // sticky header
  header?.classList.toggle('sticky', top > 100);

  // section activation + one-time reveal
  sections.forEach(sec => {
    const offset = sec.offsetTop - REVEAL_OFFSET; // << earlier trigger
    const height = sec.offsetHeight;
    const id = sec.getAttribute('id');
    if (top >= offset && top < offset + height) {
      navLinks.forEach(l => l.classList.remove('active'));
      const current = document.querySelector(`header nav a[href*="${id}"]`);
      current?.classList.add('active');
      sec.classList.add('show-animate'); // don't remove it later = no re-fade
    }
  });

  // (Optional) close menu when you start scrolling
  if (navbar?.classList.contains('active')) {
    setMenu(false);
  }

  // footer reveal if present
  if (footerEl) {
    const atBottom = window.innerHeight + window.scrollY >= document.scrollingElement.scrollHeight;
    footerEl.classList.toggle('show-animate', atBottom);
  }
}, { passive: true });

// initial ARIA state
menuIcon?.setAttribute('aria-expanded', 'false');

// ===== LIGHTBOX (no controls; click outside to close) =====
(() => {
  const lightbox = document.querySelector('.lightbox');
  if (!lightbox) return;

  const imgEl = lightbox.querySelector('.lightbox-image');
  const capEl = lightbox.querySelector('.lightbox-caption');

  function openLightbox(src, alt='') {
    imgEl.src = src;
    imgEl.alt = alt;
    capEl.textContent = alt;
    lightbox.classList.add('open');
    document.body.classList.add('lightbox-open');
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.classList.remove('lightbox-open');
    imgEl.src = '';
    imgEl.alt = '';
    capEl.textContent = '';
  }

  // Intercept clicks on project images (don’t open new tab)
 // Intercept ONLY image clicks inside the media grid
document.querySelectorAll('.project-media-grid').forEach(grid => {
  grid.addEventListener('click', (e) => {
    const img = e.target.closest('img');
    if (!img || !grid.contains(img)) return;   // ignore clicks that aren't on an image

    const link = img.closest('a');
    if (!link) return;

    e.preventDefault();                         // block the anchor only for images
    openLightbox(link.getAttribute('href'), img.getAttribute('alt') || '');
  });
});


  // Close when clicking backdrop or outside content
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop')) {
      closeLightbox();
    }
  });

  // Also close on Esc or by clicking the image itself
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
  imgEl.addEventListener('click', closeLightbox);
})();

// ===== REVEAL SYSTEM (modern, smooth, no placeholders) =====
(() => {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        // if container has data-stagger, assign small delays to children once
        const st = e.target.getAttribute('data-stagger');
        if (st && !e.target.__staggered) {
          const step = parseInt(st, 10) || 80; // ms between items
          [...e.target.children].forEach((el, i) => {
            el.style.transitionDelay = `${i * step}ms`;
          });
          e.target.__staggered = true;
        }
        io.unobserve(e.target); // fire once
      }
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  // Helper: tag selector(s) with classes and observe
  function tag(sel, classes, { stagger = 0 } = {}) {
    document.querySelectorAll(sel).forEach(el => {
      classes.split(/\s+/).forEach(c => el.classList.add(c));
      if (stagger) el.setAttribute('data-stagger', String(stagger));
      io.observe(el);
    });
  }

  // ===== What to animate (no HTML edits required) =====

  // Hero (just in case): title + paragraph
  tag('.home .home-content h1',       'reveal reveal-up');
  tag('.home .home-content p',        'reveal reveal-up');

  // About
  tag('.about .heading',              'reveal reveal-up');
  tag('.about .about-img',            'reveal reveal-scale');
  tag('.about .about-content p',      'reveal reveal-up');

  // Education timeline items
  tag('.education .heading',          'reveal reveal-up');
  tag('.education .education-content','reveal reveal-left'); // each card

  // Skills: stagger the cards
  tag('.skills .heading',             'reveal reveal-up');
  tag('.skills .skills-grid',         'reveal-stagger reveal', { stagger: 90 });
  // apply variant to each card so they move a bit
  document.querySelectorAll('.skills .skill-card').forEach((card, i) => {
    card.classList.add('reveal');
    // alternate directions for variety
    card.classList.add(i % 2 ? 'reveal-right' : 'reveal-left');
  });

  // Projects: gallery then text, with a small stagger for tiles
  tag('.projects .heading',           'reveal reveal-up');
  document.querySelectorAll('.projects .project').forEach((proj, idx) => {
    const grid = proj.querySelector('.project-media-grid');
    const body = proj.querySelector('.project-body');
    if (grid) {
      grid.classList.add('reveal', 'reveal-stagger', 'reveal-up');
      grid.setAttribute('data-stagger', '80');
      // give each tile a slight variant
      grid.querySelectorAll('a').forEach((a, i) => {
        a.classList.add('reveal');
        a.classList.add(i % 2 ? 'reveal-right' : 'reveal-left');
      });
      io.observe(grid);
    }
    if (body) {
      body.classList.add('reveal', idx % 2 ? 'reveal-right' : 'reveal-left');
      io.observe(body);
    }
  });

  // Contact
  tag('.contact .heading',            'reveal reveal-up');
  tag('.contact form',                'reveal reveal-up');

  // Footer
  tag('.footer',                      'reveal reveal-up');
})();

/* --- Progressive Reveal Init (smooth, single speed, no placeholders) --- */

// Mark that JS is running → only now apply hidden states from CSS
document.documentElement.classList.add('js-ready');

// Observer: when items enter view, show them once
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

// Helper: add .reveal and observe
// Helper: add .reveal and observe
function addReveal(selector){
  document.querySelectorAll(selector).forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
}


// WHAT to reveal (keeps your markup; just selects existing parts)
addReveal('.about .heading');
addReveal('.about .about-img');
addReveal('.about .about-content p');

addReveal('.education .heading');
addReveal('.education .education-content .content');

addReveal('.skills .heading');
addReveal('.skills .skill-card');

addReveal('.projects .heading');
addReveal('.projects .project .project-body');
document.querySelectorAll('.projects .project .project-media-grid a')
  .forEach(a => { a.classList.add('reveal'); revealObserver.observe(a); });

addReveal('.contact .heading');
addReveal('.contact form');
addReveal('.footer');


