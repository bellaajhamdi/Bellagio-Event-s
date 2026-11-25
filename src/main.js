import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import './styles.css';

import {
  mountChrome,
  initChrome,
  initReveal,
  initCounters,
  initToTop,
  initFaq,
  initCopyButtons,
} from './site.js';
import { initProductGrids, initProductInteractions, initCatalogue } from './products.js';
import { initContactForm } from './contact.js';
import { PRODUCTS } from './data.js';

mountChrome();
initChrome();
// Published changes come from the shared database, not browser-local storage.
async function loadContent() {
  try {
    const response = await fetch('/api/products', { cache: 'no-store' });
    if (!response.ok) throw new Error('Catalogue indisponible');
    const products = await response.json();
    if (!Array.isArray(products)) throw new Error('Catalogue invalide');
    PRODUCTS.splice(0, PRODUCTS.length, ...products);
  } catch (error) {
    console.warn('Catalogue en ligne indisponible : affichage de la sélection intégrée.', error);
    const grid = document.querySelector('#productGrid, [data-product-grid="featured"]');
    if (grid) grid.insertAdjacentHTML('beforebegin', '<p class="catalogue-count">Sélection temporaire : contactez-nous pour confirmer les disponibilités.</p>');
  }
  initProductGrids();
  initCatalogue();
  try {
    const response = await fetch('/api/site-images');
    if (!response.ok) return;
    const images = await response.json();
    document.querySelectorAll('img[data-site-image]').forEach(img => {
      if (images[img.dataset.siteImage]) img.src = images[img.dataset.siteImage];
    });
  } catch { /* The original images remain available. */ }
}
initProductInteractions();
loadContent();
initContactForm();
initFaq();
initCopyButtons();
initReveal();
initCounters();
initToTop();
