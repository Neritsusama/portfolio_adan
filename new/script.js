/* ═══════════════════════════════════════════════════════════════
   Adan Pereira Alves — script.js
   navigation par hash · header transparent puis plein · méga-menu ·
   menu mobile · hero (diaporama) · vignettes YouTube
   ═══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const root    = document.documentElement;
  const body    = document.body;
  const header  = $('#header');
  const drawer  = $('#drawer');
  const menuBtn = $('#menu-btn');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const wide         = window.matchMedia('(min-width: 900px)');
  const canHover     = window.matchMedia('(hover: hover)');


  /* ── 1. VIGNETTES YOUTUBE ──────────────────────────────────────
     Si la version HD n'existe pas, YouTube renvoie soit une erreur,
     soit un petit placeholder gris (120 px) : dans les deux cas on
     bascule sur la version hqdefault. */
  $$('img[data-yt]').forEach(img => {
    const fallback = () => {
      if (img.dataset.fallback) return;
      img.dataset.fallback = '1';
      img.src = `https://img.youtube.com/vi/${img.dataset.yt}/hqdefault.jpg`;
    };
    const check = () => { if (img.naturalWidth > 0 && img.naturalWidth <= 120) fallback(); };

    img.addEventListener('error', fallback);
    img.addEventListener('load', check);
    if (img.complete) check();
  });


  /* ── 2. PETITS DÉTAILS ────────────────────────────────────────── */

  // « Aller au contenu » sans toucher au hash (il sert au routage)
  $('#skip').addEventListener('click', e => {
    e.preventDefault();
    $('#main').focus();
  });

  // Annonce « nouvel onglet » aux lecteurs d'écran
  $$('a[target="_blank"]').forEach(a => {
    const s = document.createElement('span');
    s.className = 'sr-only';
    s.textContent = ' (nouvel onglet)';
    a.appendChild(s);
  });

  // Année du footer
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();


  /* ── 3. HEADER ────────────────────────────────────────────────────
     Transparent (texte blanc) tant qu'on est tout en haut de l'accueil,
     blanc plein dès qu'on scrolle, qu'un menu s'ouvre, ou sur les autres pages. */
  function updateHeader() {
    const clear = body.dataset.page === 'home'
      && window.scrollY < 8
      && !header.classList.contains('has-mega')
      && !drawer.classList.contains('is-open');
    header.classList.toggle('is-clear', clear);
  }
  window.addEventListener('scroll', updateHeader, { passive: true });


  /* ── 4. MÉGA-MENU ─────────────────────────────────────────────────
     S'ouvre au survol (souris) ou au focus clavier d'« Interviews ».
     Pour en ajouter un autre : data-mega="mon-id" sur le lien + un bloc
     <div class="mega" id="mon-id"> dans le header. */
  const megas    = $$('.mega');
  const triggers = $$('[data-mega]');
  let megaTimer;

  function openMega(id) {
    clearTimeout(megaTimer);
    megas.forEach(m => m.classList.toggle('is-open', m.id === id));
    triggers.forEach(t => t.setAttribute('aria-expanded', String(t.dataset.mega === id)));
    header.classList.add('has-mega');
    updateHeader();
  }

  function closeMega() {
    clearTimeout(megaTimer);
    megas.forEach(m => m.classList.remove('is-open'));
    triggers.forEach(t => t.setAttribute('aria-expanded', 'false'));
    header.classList.remove('has-mega');
    updateHeader();
  }

  triggers.forEach(t => {
    t.addEventListener('mouseenter', () => {
      if (wide.matches && canHover.matches) openMega(t.dataset.mega);
    });
    t.addEventListener('focus', () => {
      if (wide.matches && t.matches(':focus-visible')) openMega(t.dataset.mega);
    });
  });

  // Les autres liens du header referment le méga-menu
  $$('.nav-link:not([data-mega]), .logo').forEach(el => {
    el.addEventListener('mouseenter', closeMega);
    el.addEventListener('focus', closeMega);
  });

  header.addEventListener('mouseenter', () => clearTimeout(megaTimer));
  header.addEventListener('mouseleave', () => { megaTimer = setTimeout(closeMega, 140); });
  header.addEventListener('focusout', e => {
    if (!header.contains(e.relatedTarget)) closeMega();
  });


  /* ── 5. MENU MOBILE ───────────────────────────────────────────── */
  function openDrawer() {
    drawer.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    root.classList.add('no-scroll');
    updateHeader();
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    root.classList.remove('no-scroll');
    updateHeader();
  }

  menuBtn.addEventListener('click', () => {
    drawer.classList.contains('is-open') ? closeDrawer() : openDrawer();
  });
  drawer.addEventListener('click', e => { if (e.target.closest('a')) closeDrawer(); });
  wide.addEventListener('change', () => { closeDrawer(); closeMega(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeMega(); closeDrawer(); }
  });


  /* ── 6. HERO : DIAPORAMA AVEC BOUTON PAUSE ────────────────────────
     Une slide = un .hero-slide dans le HTML (data-title + data-href).
     Avec « mouvement réduit » activé dans l'OS, il démarre en pause. */
  const slides    = $$('.hero-slide');
  const heroLink  = $('#hero-link');
  const heroLabel = $('.t', heroLink);

  let slideIndex = 0;
  let slideTimer = null;
  // Pas de bouton Pause : le diaporama défile seul (sauf « mouvement réduit » dans l'OS)
  const userPaused = reduceMotion.matches;

  function showSlide(i) {
    slideIndex = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('is-active', k === slideIndex));
    heroLabel.textContent = slides[slideIndex].dataset.title;
    heroLink.href = slides[slideIndex].dataset.href;
  }

  function heroPlay() {
    if (slideTimer || userPaused || document.hidden || slides.length < 2) return;
    slideTimer = setInterval(() => showSlide(slideIndex + 1), 6500);
  }

  function heroStop() {
    clearInterval(slideTimer);
    slideTimer = null;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) heroStop();
    else if (body.dataset.page === 'home') heroPlay();
  });


  /* ── 7. NAVIGATION ────────────────────────────────────────────────
     Une seule page HTML, quatre « pages » : #/ · #/interviews · #/vlogs ·
     #/contact. Le bouton retour du navigateur fonctionne. */
  const PAGES = {
    home:       'Adan Pereira Alves',
    interviews: 'Interviews | Adan Pereira Alves',
    vlogs:      'Vidéos | Adan Pereira Alves',
    contact:    'Contact | Adan Pereira Alves',
  };

  const hashKey = () => location.hash.replace(/^#\/?/, '').split(/[/?]/)[0];
  const routeFromHash = () =>
    Object.prototype.hasOwnProperty.call(PAGES, hashKey()) ? hashKey() : 'home';

  function showPage(route, { firstLoad = false } = {}) {
    $$('.page').forEach(p => { p.hidden = p.dataset.page !== route; });
    body.dataset.page = route;
    document.title = PAGES[route];

    $$('[data-route]').forEach(a => {
      if (a.dataset.route === route) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    closeMega();
    closeDrawer();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    updateHeader();
    route === 'home' ? heroPlay() : heroStop();

    // Accessibilité : le titre de la nouvelle page reçoit le focus
    if (!firstLoad) {
      const title = $(`#page-${route} [tabindex="-1"]`);
      if (title) title.focus({ preventScroll: true });
    }
  }

  // Cliquer sur le lien de la page où l'on est déjà : retour en haut
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#/"]');
    if (!a) return;
    if (a.getAttribute('href').replace(/^#\/?/, '') === hashKey()) {
      e.preventDefault();
      closeMega();
      closeDrawer();
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }
  });

  window.addEventListener('hashchange', () => showPage(routeFromHash()));
  showPage(routeFromHash(), { firstLoad: true });

  // Fin de la séquence d'ouverture : elle ne se rejoue pas en revenant sur l'accueil
  setTimeout(() => root.classList.remove('intro'), 2400);
})();
