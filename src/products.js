import { PRODUCTS, BADGES, CONTACT } from './data.js';
import { icon } from './icons.js';

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const formatPrice = (n) => n.toLocaleString('fr-FR');

const priceHtml = (p) =>
  p.price == null
    ? '<span class="amount amount--devis">Sur devis</span>'
    : `<span class="amount">${formatPrice(p.price)}</span><span class="cur">DT</span>`;

const badgeHtml = (p) =>
  p.badge ? `<span class="badge ${BADGES[p.badge].cls}">${BADGES[p.badge].label}</span>` : '';

export function orderUrl(p) {
  const priceLabel = p.price == null ? 'sur devis' : `${formatPrice(p.price)} DT`;
  const text = `Bonjour Play Tech 👋\nJe suis intéressé(e) par : ${p.brand} ${p.name} — ${priceLabel}.\nEst-il toujours disponible ?`;
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function renderProductCard(p, index = 0) {
  const old = p.oldPrice
    ? `<span class="old">${formatPrice(p.oldPrice)}&nbsp;DT</span>`
    : '';

  return `
    <article class="product-card" style="animation-delay:${Math.min(index * 45, 300)}ms">
      <div class="product-media">
        <img src="${escapeHtml(p.image)}" alt="Photo du produit ${escapeHtml(p.brand)} ${escapeHtml(p.name)}" loading="lazy" decoding="async" width="800" height="600">
        ${badgeHtml(p)}
      </div>
      <div class="product-body">
        <div class="product-brand">${escapeHtml(p.brand)}</div>
        <h3 class="product-name">${escapeHtml(p.name)}</h3>
        <p class="product-desc">${escapeHtml(p.desc)}</p>
        <ul class="spec-chips">${p.chips.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
        <div class="product-foot">
          <div class="product-price">${priceHtml(p)}${old}</div>
          <div class="product-actions">
            <button class="btn btn-ghost btn-sm" type="button" data-product-open="${escapeHtml(p.id)}">
              Détails
              ${icon('arrow', 'ico--xs')}
            </button>
            <button class="btn btn-primary btn-sm" type="button" data-order="${escapeHtml(p.id)}"
                    aria-label="Commander ${escapeHtml(p.name)} sur WhatsApp">
              ${icon('whatsapp', 'ico--fill')} Commander
            </button>
          </div>
        </div>
      </div>
    </article>`;
}

/* ---------- Grilles de produits (accueil) ---------- */
export function initProductGrids() {
  document.querySelectorAll('[data-product-grid]').forEach((grid) => {
    const mode = grid.dataset.productGrid;
    const list = mode === 'featured' ? PRODUCTS.filter((p) => p.featured) : PRODUCTS;
    grid.innerHTML = list.map((p, i) => renderProductCard(p, i)).join('');
  });
}

/* ---------- Fiche produit (modale) ---------- */
let dialogEl = null;

function ensureDialog() {
  if (dialogEl) return dialogEl;

  dialogEl = document.createElement('dialog');
  dialogEl.className = 'modal';
  dialogEl.id = 'productModal';
  dialogEl.setAttribute('aria-labelledby', 'productModalTitle');
  document.body.appendChild(dialogEl);

  dialogEl.addEventListener('click', (e) => {
    if (e.target === dialogEl) dialogEl.close();
  });

  dialogEl.addEventListener('close', () => {
    document.documentElement.classList.remove('modal-open');
  });

  return dialogEl;
}

export function openProduct(id) {
  const p = PRODUCTS.find((item) => item.id === id);
  if (!p) return;

  const dialog = ensureDialog();
  const badge = p.badge
    ? `<span class="badge ${BADGES[p.badge].cls}" style="position:static">${BADGES[p.badge].label}</span>`
    : '';

  dialog.innerHTML = `
    <div class="modal-shell">
      <button class="modal-close" type="button" data-close aria-label="Fermer la fiche produit">
        ${icon('close')}
      </button>
      <div class="modal-media">
        <img src="${escapeHtml(p.image)}" alt="Photo du produit ${escapeHtml(p.brand)} ${escapeHtml(p.name)}">
      </div>
      <div class="modal-body">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span class="modal-brand">${escapeHtml(p.brand)}</span>
          ${badge}
        </div>
        <h2 class="modal-title" id="productModalTitle">${escapeHtml(p.name)}</h2>
        <p class="modal-desc">${escapeHtml(p.desc)}</p>

        <div class="modal-price">
          ${
            p.price == null
              ? '<span class="amount" style="font-size:1.2rem">Sur devis</span>'
              : `<span class="amount">${formatPrice(p.price)}</span><span class="cur">DT</span>`
          }
          ${p.oldPrice ? `<span class="old">${formatPrice(p.oldPrice)}&nbsp;DT</span>` : ''}
        </div>

        <dl class="modal-specs">
          ${p.specs
            .map(
              ([label, value]) =>
                `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`
            )
            .join('')}
        </dl>

        <div class="modal-actions">
          <a class="btn btn-primary" href="${orderUrl(p)}" target="_blank" rel="noopener">
            ${icon('whatsapp', 'ico--fill')} Commander sur WhatsApp
          </a>
          <a class="btn btn-ghost" href="tel:${CONTACT.tel1}">
            ${icon('phone')} Appeler
          </a>
        </div>
        <p class="modal-guarantee">
          ${icon('shield')} Photo illustrative · Prix et disponibilité à confirmer auprès de la boutique
        </p>
      </div>
    </div>
  `;

  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.showModal();
  document.documentElement.classList.add('modal-open');
}

/* ---------- Interactions globales produits ---------- */
export function initProductInteractions() {
  document.addEventListener('click', (e) => {
    const orderBtn = e.target.closest('[data-order]');
    if (orderBtn) {
      e.preventDefault();
      const p = PRODUCTS.find((item) => item.id === orderBtn.dataset.order);
      if (!p) return;
      window.open(orderUrl(p), '_blank', 'noopener');
      return;
    }

    const trigger = e.target.closest('[data-product-open]');
    if (trigger) openProduct(trigger.dataset.productOpen);
  });
}

/* ---------- Catalogue (page Produits) ---------- */
export function initCatalogue() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  const search = document.getElementById('productSearch');
  const sortSelect = document.getElementById('sortSelect');
  const filters = document.getElementById('categoryFilters');
  const count = document.getElementById('catalogueCount');
  const empty = document.getElementById('emptyState');
  const resetBtn = document.getElementById('resetFilters');

  const state = { category: 'all', query: '', sort: 'featured' };

  const matches = (p) => {
    if (state.category !== 'all' && p.category !== state.category) return false;
    if (!state.query) return true;
    const haystack = `${p.brand} ${p.name} ${p.desc} ${p.chips.join(' ')}`.toLowerCase();
    return haystack.includes(state.query);
  };

  const render = () => {
    let list = PRODUCTS.filter(matches);

    if (state.sort === 'price-asc') {
      list = [...list].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    } else if (state.sort === 'price-desc') {
      list = [...list].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    }

    grid.innerHTML = list.map((p, i) => renderProductCard(p, i)).join('');

    if (count) {
      count.innerHTML = `<strong>${list.length}</strong> produit${list.length > 1 ? 's' : ''}${
        state.query || state.category !== 'all' ? ' trouvé' + (list.length > 1 ? 's' : '') : ''
      }`;
    }

    if (empty) empty.hidden = list.length !== 0;
    grid.hidden = list.length === 0;
  };

  search?.addEventListener('input', () => {
    state.query = search.value.trim().toLowerCase();
    render();
  });

  sortSelect?.addEventListener('change', () => {
    state.sort = sortSelect.value;
    render();
  });

  filters?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    state.category = btn.dataset.filter;
    filters.querySelectorAll('[data-filter]').forEach((b) => {
      const active = b === btn;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    render();
  });

  resetBtn?.addEventListener('click', () => {
    state.category = 'all';
    state.query = '';
    state.sort = 'featured';
    if (search) search.value = '';
    if (sortSelect) sortSelect.value = 'featured';
    filters?.querySelectorAll('[data-filter]').forEach((b) => {
      const active = b.dataset.filter === 'all';
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    render();
  });

  render();
}
