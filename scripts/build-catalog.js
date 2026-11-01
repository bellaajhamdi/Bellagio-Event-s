const {JSDOM}=require('jsdom');const fs=require('node:fs');
const routes={'/':'Accueil','/nos-espaces':'Nos espaces','/espaces/la-salle':'La Volta','/espaces/le-jardin':'La Cabana','/a-propos':'L’expérience','/formules':'Formules et simulateur','/galerie':'Galerie','/contact':'Contact'};
const entries=new Map();
for(const [route,label] of Object.entries(routes)){
const dom=new JSDOM(fs.readFileSync('public/index.html','utf8'),{url:'http://localhost'+route,runScripts:'outside-only'}),w=dom.window;w.fetch=async()=>({json:async()=>({title:'Là où l’amour s’illumine.',intro:'Une salle de lumière, un jardin sous les étoiles. À Bellagio Event’s, nous donnons vie à vos plus beaux instants.',phone:'+216 52 359 900',address:'Ariana, Grand Tunis, Tunisie'})});
for(const script of ['pricing','cms-public','pages','app'])w.eval(fs.readFileSync('public/'+script+'.js','utf8'));
function collect(){for(const n of w.BellagioCMS.nodes()){const original=n.textContent.trim();if(!/[\p{L}\p{N}]/u.test(original))continue;const id=w.BellagioCMS.key(original);if(entries.has(id)){if(!entries.get(id).pages.includes(label))entries.get(id).pages.push(label)}else entries.set(id,{id,original,pages:[label],type:n.parentElement.tagName.toLowerCase()})}}
collect();if(route==='/'){for(const i of [1,2]){w.showQuote(i);collect()}}dom.window.close();
}
fs.writeFileSync('public/content-catalog.json',JSON.stringify({entries:[...entries.values()]},null,2)+'\n');console.log(entries.size+' textes éditables');
