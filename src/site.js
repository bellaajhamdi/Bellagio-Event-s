import { SPRITE, icon } from './icons.js';
import { CONTACT } from './data.js';

const NAV_ITEMS = [
  { key: 'accueil', href: '/index.html', label: 'Accueil' },
  { key: 'produits', href: '/produits.html', label: 'Produits' },
  { key: 'services', href: '/services.html', label: 'Réparation' },
  { key: 'contact', href: '/contact.html', label: 'Contact' },
];

const brandMarkup = () => `
  <span class="brand-mark" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 6.2v11.6l9.6-5.8L9 6.2Z"/></svg>
  </span>
  <span class="brand-text">
    <span class="brand-word">PLAY<span>TECH</span></span>
    <span class="brand-sub">Manouba</span>
  </span>`;

const headerMarkup = (active) => `
  <div class="topbar">
    <div class="container topbar-inner">
      <span>${icon('check')} Vente d’ordinateurs</span>
      <span class="dot" aria-hidden="true"></span>
      <span>${icon('truck')} Réparation informatique</span>
      <span class="dot" aria-hidden="true"></span>
      <span>${icon('shield')} Manouba, Tunisie</span>
    </div>
  </div>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="/index.html" aria-label="Play Tech Manouba — Accueil">${brandMarkup()}</a>

      <nav class="main-nav" id="mainNav" aria-label="Navigation principale">
        ${NAV_ITEMS.map(
          (item) =>
            `<a href="${item.href}" data-nav="${item.key}"${
              item.key === active ? ' class="is-active" aria-current="page"' : ''
            }>${item.label}</a>`
        ).join('')}
      </nav>

      <div class="header-actions">
        <a class="header-phone" href="tel:${CONTACT.tel1}">
          ${icon('phone')} ${CONTACT.phone1}
        </a>
        <a class="btn btn-primary btn-sm" href="https://wa.me/${CONTACT.whatsapp}" target="_blank" rel="noopener">
          ${icon('whatsapp', 'ico--fill')}<span class="btn-label">WhatsApp</span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mainNav" aria-label="Ouvrir le menu">
          <svg class="ico ico-menu" aria-hidden="true"><use href="#i-menu"></use></svg>
          <svg class="ico ico-close" aria-hidden="true"><use href="#i-close"></use></svg>
        </button>
      </div>
    </div>
  </header>`;

const footerMarkup = () => `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="/index.html" aria-label="Play Tech Manouba — Accueil">${brandMarkup()}</a>
          <p>Vente et réparation d'ordinateurs à Manouba. Découvrez notre sélection et contactez-nous pour vos besoins informatiques.</p>
          <div class="socials">
            <a href="${CONTACT.instagram}" target="_blank" rel="noopener" aria-label="Instagram Play Tech">
              ${icon('instagram')}
            </a>
            <a href="https://wa.me/${CONTACT.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp Play Tech">
              ${icon('whatsapp', 'ico--fill')}
            </a>
            <a href="tel:${CONTACT.tel1}" aria-label="Appeler Play Tech">
              ${icon('phone')}
            </a>
          </div>
        </div>

        <div class="footer-col">
          <h4>Navigation</h4>
          <ul>
            ${NAV_ITEMS.map((i) => `<li><a href="${i.href}">${i.label}</a></li>`).join('')}
          </ul>
        </div>

        <div class="footer-col">
          <h4>Services</h4>
          <ul>
            <li><a href="/services.html#reparations">Réparation ordinateurs</a></li>
            <li><a href="/services.html#reparations">Changement d'écran</a></li>
            <li><a href="/services.html#reparations">Récupération de données</a></li>
            <li><a href="/services.html#reparations">Upgrade SSD &amp; RAM</a></li>
            <li><a href="/services.html#reparations">Installation &amp; configuration</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Contact</h4>
          <ul class="footer-contact">
            <li>${icon('pin')}<span>${CONTACT.address}</span></li>
            <li>${icon('phone')}<a href="tel:${CONTACT.tel1}">${CONTACT.phone1}</a></li>
            <li>${icon('phone')}<a href="tel:${CONTACT.tel2}">${CONTACT.phone2}</a></li>
            <li>${icon('clock')}<span>${CONTACT.hours}<br>${CONTACT.hoursNote}</span></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© <span data-year>2026</span> Play Tech Manouba — Tous droits réservés.</p>
        <p>
          <a href="${CONTACT.instagram}" target="_blank" rel="noopener">@playtech_manouba</a>
          <span aria-hidden="true"> · </span>Manouba, Tunisie
        </p>
      </div>
    </div>
  </footer>
  <button class="to-top" type="button" aria-label="Remonter en haut de la page">
    ${icon('arrow-up')}
  </button>`;

export function mountChrome() {
  const active = document.body.dataset.page || 'accueil';

  if (!document.getElementById('icon-sprite')) {
    const holder = document.createElement('div');
    holder.id = 'icon-sprite';
    holder.innerHTML = SPRITE;
    document.body.prepend(holder);
  }

  const header = document.getElementById('site-header');
  if (header) header.innerHTML = headerMarkup(active);

  const footer = document.getElementById('site-footer');
  if (footer) footer.outerHTML = footerMarkup();
  else document.body.insertAdjacentHTML('beforeend', footerMarkup());
}

export function initChrome() {
  const header = document.getElementById('site-header');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('mainNav');

  const closeNav = () => {
    document.body.classList.remove('nav-open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Ouvrir le menu');
  };

  toggle?.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  });

  nav?.addEventListener('click', (e) => {
    if (e.target.closest('a')) closeNav();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) closeNav();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeNav();
  });

  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

/* ---------- Animations d'apparition ---------- */
export function initReveal() {
  const els = [...document.querySelectorAll('[data-reveal]')];
  if (!els.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );

  els.forEach((el) => {
    const delay = el.dataset.revealDelay;
    if (delay) el.style.transitionDelay = `${delay}ms`;
    io.observe(el);
  });
}

/* ---------- Compteurs ---------- */
export function initCounters() {
  const els = [...document.querySelectorAll('[data-count]')];
  if (!els.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const format = (value, decimals) =>
    value.toLocaleString('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  const run = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const decimals = Number(el.dataset.decimals || 0);

    if (reduce) {
      el.textContent = format(target, decimals) + suffix;
      return;
    }

    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(target * eased, decimals) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  els.forEach((el) => io.observe(el));
}

/* ---------- Retour en haut ---------- */
export function initToTop() {
  const btn = document.querySelector('.to-top');
  if (!btn) return;

  const onScroll = () => btn.classList.toggle('is-visible', window.scrollY > 700);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- Toast ---------- */
let toastEl = null;
let toastTimer = null;

export function toast(message) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }

  toastEl.textContent = message;
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2800);
}

/* ---------- FAQ ---------- */
export function initFaq() {
  const items = [...document.querySelectorAll('.faq-item')];
  if (!items.length) return;

  items.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      items.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
}

/* ---------- Boutons copier ---------- */
export function initCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const value = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
        toast(`Numéro copié : ${value}`);
      } catch {
        toast(value);
      }
    });
  });
}
