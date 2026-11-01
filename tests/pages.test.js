const {test}=require('node:test');const assert=require('node:assert/strict');const {JSDOM}=require('jsdom');const fs=require('node:fs');
function page(path){const dom=new JSDOM(fs.readFileSync('public/index.html','utf8'),{url:'http://localhost'+path,runScripts:'outside-only'});dom.window.fetch=async()=>({json:async()=>({title:'Là où l’amour s’illumine.',intro:'Présentation',phone:'+216 52 359 900',address:'Ariana'})});for(const s of ['pricing','cms-public','pages','app','simulator'])dom.window.eval(fs.readFileSync('public/'+s+'.js','utf8'));dom.window.BellagioCMS.apply();return dom}
test('toutes les pages publiques initialisent leurs interactions sans erreur',()=>{for(const path of ['/','/nos-espaces','/galerie','/contact','/a-propos','/espaces/la-salle','/espaces/le-jardin']){const dom=page(path);assert.ok(dom.window.document.querySelector('#visit-form'));assert.ok(dom.window.document.querySelector('h1'));dom.window.close()}});
test('simulateur interactif, contraintes, transfert de devis et galerie',()=>{
const dom=page('/formules'),w=dom.window,d=w.document,f=d.querySelector('#sim-form');
assert.match(d.querySelector('#sim-total').textContent,/5.*500/);
f.elements.pack.value='golden';f.dispatchEvent(new w.Event('change'));assert.equal(f.elements.guests.value,'250');assert.equal(f.elements.space.value,'La Cabana');assert.equal(f.elements.space.querySelector('[value="La Volta"]').disabled,true);
f.elements.date.value='2027-06-11';f.dispatchEvent(new w.Event('change'));assert.match(d.querySelector('#sim-total').textContent,/4.*500/);
const coffee=d.querySelector('#sim-options input[value=coffee]');coffee.checked=true;coffee.dispatchEvent(new w.Event('change'));assert.match(d.querySelector('#sim-total').textContent,/5.*000/);
d.querySelector('#sim-contact').onclick();assert.match(JSON.parse(w.sessionStorage.getItem('bellagio-estimate')).message,/Stand café turc/);dom.window.close();
const gallery=page('/galerie');gallery.window.document.querySelector('[data-filter="cabana"]').click();assert.equal([...gallery.window.document.querySelectorAll('[data-category]')].filter(x=>!x.hidden).length,1);gallery.window.close();
});
test('le total visible change immédiatement à chaque palier de 50 invités',()=>{
const dom=page('/formules'),w=dom.window,d=w.document,f=d.querySelector('#sim-form');
for(const [guests,price,extra]of [[250,5500,0],[300,5700,200],[350,5900,400],[400,6100,600],[450,6300,800],[500,6500,1000]]){
f.elements.guests.value=String(guests);f.elements.guests.dispatchEvent(new w.Event('input',{bubbles:true}));
assert.equal(Number(d.querySelector('#sim-total').textContent.replace(/[^\d]/g,'')),price);
assert.equal(d.querySelector('#sim-inline-total').textContent,d.querySelector('#sim-total').textContent);
assert.ok(d.querySelector('#sim-capacity-note').textContent.includes(String(guests)));
if(extra)assert.match(d.querySelector('#sim-breakdown').textContent,/Supplément capacité/);
}
f.elements.date.value='2027-01-04';f.elements.date.dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(Number(d.querySelector('#sim-inline-total').textContent.replace(/[^\d]/g,'')),5200);
dom.window.close();
});
