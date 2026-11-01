const pricing=require('./public/pricing').defaults;
const base='https://bellagio-events-tn.com/venue/';
const media=[['hall/facade-night-wide-1920.webp','Façade / accueil'],['hall/stage-gold-1600.webp','Scène de La Volta'],['hall/volta-hall-wide-1600.webp','Vue de la salle La Volta'],['jardin/pool-evening-1600.webp','Jardin La Cabana']].map(([src,label])=>({original:base+src,label}));
const defaults={pricing,media:{},texts:{},gallery:[{src:base+'hall/stage-gold-1600.webp',alt:'La scène dorée de La Volta',category:'volta'},{src:base+'jardin/pool-evening-1600.webp',alt:'La Cabana à la tombée de la nuit',category:'cabana'},{src:base+'hall/volta-hall-wide-1600.webp',alt:'La salle La Volta',category:'volta'},{src:base+'hall/facade-night-wide-1920.webp',alt:'La façade de Bellagio',category:'volta'}]};
const plain=x=>x&&typeof x==='object'&&!Array.isArray(x);
const url=s=>typeof s==='string'&&s.length<=2000&&(/^\/uploads\/[a-f0-9-]+\.(jpg|png|webp)$/.test(s)||(/^https:\/\//.test(s)&&(()=>{try{return !!new URL(s).hostname}catch{return false}})()));
function validate(body){
if(!plain(body))throw Error('Contenu invalide.');const out={};
if(body.pricing!==undefined){const p=body.pricing;if(!plain(p))throw Error('Tarifs invalides.');out.pricing=structuredClone(pricing);for(const k of ['soiree','soireeWeekendExtra','standardWeek','standardWeekend','goldenWeek','goldenWeekend','discountPercent']){const v=p[k];if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>(k==='discountPercent'?100:1000000))throw Error('Tarif invalide : '+k);out.pricing[k]=v}
for(const k of ['discountStart','discountEnd']){if(typeof p[k]!=='string'||!/^\d{2}-\d{2}$/.test(p[k])||new Date('2024-'+p[k]+'T12:00:00Z').toISOString().slice(5,10)!==p[k])throw Error('Période de remise invalide.');out.pricing[k]=p[k]}
for(const n of [250,300,350,400,450,500]){const v=p.capacityExtras?.[n];if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>1000000)throw Error('Supplément capacité invalide.');out.pricing.capacityExtras[n]=v}
for(const id of Object.keys(pricing.options)){const o=p.options?.[id];if(!plain(o)||typeof o.price!=='number'||!Number.isFinite(o.price)||o.price<0||o.price>1000000||typeof o.label!=='string'||!o.label.trim()||o.label.length>180||typeof o.detail!=='string'||o.detail.length>500)throw Error('Option invalide : '+id);out.pricing.options[id]={price:o.price,label:o.label.trim(),detail:o.detail.trim()}}
}
if(body.media!==undefined){if(!plain(body.media))throw Error('Photos invalides.');out.media={};for(const m of media)if(body.media[m.original]){if(!url(body.media[m.original]))throw Error('URL photo invalide.');out.media[m.original]=body.media[m.original]}}
if(body.texts!==undefined){if(!plain(body.texts)||Object.keys(body.texts).length>2000)throw Error('Textes invalides.');out.texts={};for(const [k,v]of Object.entries(body.texts)){if(!/^t[0-9a-f]{8}$/.test(k)||typeof v!=='string'||v.length>5000)throw Error('Texte invalide.');out.texts[k]=v}}
if(body.gallery!==undefined){if(!Array.isArray(body.gallery)||body.gallery.length>100)throw Error('Galerie limitée à 100 photos.');out.gallery=body.gallery.map(g=>{if(!plain(g)||!url(g.src)||typeof g.alt!=='string'||!g.alt.trim()||g.alt.length>300||!['volta','cabana'].includes(g.category))throw Error('Photo de galerie invalide.');return {src:g.src,alt:g.alt.trim(),category:g.category}})}
return out;
}
module.exports={defaults,media,validate};
