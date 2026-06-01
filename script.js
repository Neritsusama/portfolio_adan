/* ═══════════════════════════════════════
   PORTFOLIO — Marie Dupont
   script.js
═══════════════════════════════════════ */

/* ── CURSEUR PERSONNALISÉ ── */
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

// Grossit le curseur sur les éléments interactifs
document.querySelectorAll('a, button, .int-row, .vlog-row, .contact-col').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('big'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
});

/* ── LOADER ── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('gone');
  }, 1800);
});

/* ── NAVIGATION ── */
const ALL_SECTIONS = ['home', 'interviews-sec', 'vlogs-sec', 'contact-sec'];

const NAV_MAP = {
  'interviews-sec': 'nb-int',
  'vlogs-sec':      'nb-vlog',
  'contact-sec':    'nb-ct',
};

/**
 * Affiche une section et masque les autres.
 * @param {string} id - ID de la section à afficher.
 */
function showSection(id) {
  ALL_SECTIONS.forEach(sid => {
    const el = document.getElementById(sid);
    if (!el) return;

    if (sid === id) {
      el.style.display = 'block';
      el.classList.add('active');
    } else {
      el.style.display = 'none';
      el.classList.remove('active');
    }
  });

  // Met à jour l'état actif des boutons de nav
  document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(NAV_MAP[id]);
  if (activeBtn) activeBtn.classList.add('active');
}

/** Revient à la page d'accueil. */
function showHome() {
  ALL_SECTIONS.forEach(sid => {
    const el = document.getElementById(sid);
    if (!el) return;

    if (sid === 'home') {
      el.style.display = 'flex';
      el.classList.remove('active');
    } else {
      el.style.display = 'none';
      el.classList.remove('active');
    }
  });

  document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
}

/* ── ÉCOUTEURS DE LA NAV ── */
document.getElementById('nav-home').addEventListener('click', e => {
  e.preventDefault();
  showHome();
});

document.getElementById('nb-int').addEventListener('click',  () => showSection('interviews-sec'));
document.getElementById('nb-vlog').addEventListener('click', () => showSection('vlogs-sec'));
document.getElementById('nb-ct').addEventListener('click',   () => showSection('contact-sec'));

/* ── ÉTAT INITIAL ── */
// S'assure que seule la page d'accueil est visible au chargement
showHome();
