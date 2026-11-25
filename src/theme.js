// Validated values only: the same schema is used by the Worker and both UIs.
export const DEFAULT_THEME = Object.freeze({palette:'noir', accent:'#22d3ee', radius:'rounded', font:'modern', density:'comfortable'});
export const PALETTES = {
  noir: {label:'Noir profond', bg:'#05080e', deep:'#03060b', surface:'#0a0f18', surface2:'#0e1521', surface3:'#131c2b'},
  midnight: {label:'Bleu nuit', bg:'#091525', deep:'#050d19', surface:'#102035', surface2:'#152943', surface3:'#1d3552'},
  graphite: {label:'Graphite', bg:'#171a1f', deep:'#101216', surface:'#20242b', surface2:'#292e37', surface3:'#333b46'},
};
function luminance(hex) {
  const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(c=>c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4);
  return 0.2126*rgb[0]+0.7152*rgb[1]+0.0722*rgb[2];
}
export function validTheme(theme) {
  if (!theme || typeof theme !== 'object') return false;
  return Object.hasOwn(PALETTES,theme.palette) && typeof theme.accent==='string' && /^#[0-9a-f]{6}$/i.test(theme.accent) && (luminance(theme.accent)+0.05)/(luminance('#04121a')+0.05)>=4.5 && ['rounded','soft','square'].includes(theme.radius) && ['modern','classic'].includes(theme.font) && ['comfortable','compact'].includes(theme.density);
}
export function applyTheme(theme) {
  const t=validTheme(theme)?theme:DEFAULT_THEME, p=PALETTES[t.palette], style=document.documentElement.style;
  for(const [key,value] of Object.entries({bg:p.bg,'bg-deep':p.deep,surface:p.surface,'surface-2':p.surface2,'surface-3':p.surface3,cyan:t.accent,'cyan-soft':`color-mix(in srgb, ${t.accent}, white 35%)`,blue:`color-mix(in srgb, ${t.accent}, #3b82f6 40%)`,mint:`color-mix(in srgb, ${t.accent}, white 20%)`,grad:`linear-gradient(100deg, color-mix(in srgb, ${t.accent}, white 45%), ${t.accent} 55%, color-mix(in srgb, ${t.accent}, #3b82f6 40%))`,'grad-btn':`linear-gradient(115deg, color-mix(in srgb, ${t.accent}, white 25%), ${t.accent} 55%, color-mix(in srgb, ${t.accent}, #3b82f6 30%))`,radius:({rounded:'20px',soft:'12px',square:'4px'})[t.radius],'radius-sm':({rounded:'12px',soft:'8px',square:'3px'})[t.radius]})) style.setProperty('--'+key,value);
  style.setProperty('--font-display', t.font==='classic' ? "'Inter Variable', system-ui, sans-serif" : "'Space Grotesk Variable', system-ui, sans-serif");
  document.documentElement.dataset.themeDensity=t.density;
  document.documentElement.dataset.themeRadius=t.radius;
}
