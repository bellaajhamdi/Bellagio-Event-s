import { icon } from './icons.js';
import { validateRepair } from './repair-data.js';
import { CONTACT } from './data.js';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function initRepairs() {
  const grid=document.getElementById('repairGrid');
  if(!grid) return;
  try {
    const response=await fetch('/api/services',{cache:'no-store'});
    if (!response.ok) throw new Error('Services indisponibles');
    const services=await response.json();
    if (!Array.isArray(services) || services.some(s=>!validateRepair(s,s.id))) throw new Error('Réponse invalide');
    if(!services.length) {
      grid.innerHTML='<p class="repair-empty">Les services sont momentanément indisponibles. <a href="/contact.html">Contactez-nous pour votre demande.</a></p>';
      return;
    }
    grid.innerHTML=services.map(s=>{
      const url=`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(`Bonjour Play Tech, je souhaite des renseignements sur : ${s.name}.`)}`;
      return `<article class="repa-card"><span class="service-icon">${icon(s.icon)}</span><h3>${escape(s.name)}</h3><p>${escape(s.description)}</p><div class="repa-price"><span>${escape(s.delay || 'Tarif')}</span><strong>${escape(s.price)}</strong></div><a class="repair-request" href="${url}" target="_blank" rel="noopener">Demander sur WhatsApp ${icon('arrow','ico--xs')}</a></article>`;
    }).join('');
  } catch(error) {
    console.warn('Impossible de charger les services mis à jour',error);
    grid.insertAdjacentHTML('beforebegin','<p class="repair-notice" role="status">Liste temporaire : contactez-nous pour confirmer nos services.</p>');
  }
}
