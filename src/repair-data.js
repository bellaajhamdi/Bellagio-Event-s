// Icons are restricted to IDs present in the site's SVG sprite.
export const REPAIR_ICONS = ['wrench','laptop','monitor','zap','keyboard','cpu','database','refresh','settings','drive','shield','headset'];
export function validateRepair(input, id) {
  if (!input || typeof input !== 'object') return null;
  const field=(value,max) => typeof value === 'string' && value.trim().length <= max ? value.trim() : null;
  const name=field(input.name,100), description=field(input.description,400), price=field(input.price,80), delay=field(input.delay,80);
  if (!name || description === null || !price || delay === null || !REPAIR_ICONS.includes(input.icon) || typeof input.visible !== 'boolean') return null;
  return {id,name,description,price,delay,icon:input.icon,visible:input.visible};
}
