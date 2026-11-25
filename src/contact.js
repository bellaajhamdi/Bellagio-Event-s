import { CONTACT } from './data.js';
import { toast } from './site.js';

const onlyDigits = (value) => value.replace(/\D/g, '');

export function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.elements.name?.value.trim() || '';
    const phone = form.elements.phone?.value.trim() || '';
    const type = form.elements.type?.value || 'Demande';
    const message = form.elements.message?.value.trim() || '';

    if (name.length < 2) {
      toast('Merci d’indiquer votre nom.');
      form.elements.name?.focus();
      return;
    }

    if (onlyDigits(phone).length !== 8) {
      toast('Numéro de téléphone invalide (8 chiffres).');
      form.elements.phone?.focus();
      return;
    }

    if (message.length < 5) {
      toast('Décrivez votre demande en quelques mots.');
      form.elements.message?.focus();
      return;
    }

    const text = [
      'Bonjour Play Tech 👋',
      '',
      `Nom : ${name}`,
      `Téléphone : ${phone}`,
      `Demande : ${type}`,
      '',
      message,
    ].join('\n');

    const url = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
    const win = window.open(url, '_blank', 'noopener');

    if (!win) window.location.href = url;

    toast('Ouverture de WhatsApp avec votre message…');
    form.reset();
  });
}
