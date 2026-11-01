(()=>{
const form=document.getElementById('sim-form');
const money=n=>new Intl.NumberFormat('fr-TN',{maximumFractionDigits:0}).format(n);
if(form){
const P=window.BellagioPricing,fields=form.elements,container=document.getElementById('sim-options');let selection=new Set();
fields.date.min=new Date().toISOString().slice(0,10);
function update(){
const pack=fields.pack.value,evening=pack==='soiree';
fields.space.querySelector('option[value="La Volta"]').disabled=pack==='golden';if(pack==='golden')fields.space.value='La Cabana';
[...fields.guests.options].forEach(o=>o.disabled=!evening&&Number(o.value)>250);if(!evening)fields.guests.value='250';
const available=P.options.filter(o=>(!o.evening||evening)&&(!o.reception||!evening));selection=new Set([...selection].filter(id=>available.some(o=>o.id===id)));
container.replaceChildren();available.forEach(o=>{const label=document.createElement('label');label.className='sim-option';const input=document.createElement('input');input.type='checkbox';input.value=o.id;input.checked=selection.has(o.id);input.addEventListener('change',()=>{if(input.checked){if(o.group)P.options.filter(other=>other.group===o.group).forEach(other=>selection.delete(other.id));selection.add(o.id)}else selection.delete(o.id);update()});const copy=document.createElement('span'),title=document.createElement('strong');title.textContent=o.label;copy.append(title);if(o.detail){const small=document.createElement('small');small.textContent=o.detail;copy.append(small)}const price=document.createElement('b');price.textContent='+'+money(o.price*(o.per100?Number(fields.guests.value)/100:1))+' DT';label.append(input,copy,price);container.append(label)});
const result=P.calculate({pack,guests:Number(fields.guests.value),date:fields.date.value,holiday:fields.holiday.checked,selected:[...selection]});
const breakdown=document.getElementById('sim-breakdown');breakdown.replaceChildren();function line(label,value,cls){const div=document.createElement('div');div.className='estimate-line '+(cls||'');const name=document.createElement('span'),amount=document.createElement('b');name.textContent=label;amount.textContent=value;div.append(name,amount);breakdown.append(div)}
line(evening?'Forfait de départ':'Forfait',money(result.base)+' DT');if(result.discount)line('Remise saisonnière −20 %','−'+money(result.discount)+' DT','discount');result.lines.forEach(o=>line(o.label,money(o.amount)+' DT'));
document.getElementById('sim-total').textContent=money(result.total);
const description=P.labels[pack]+' · '+fields.space.value+' · '+fields.guests.value+' invités'+(fields.date.value?' · '+new Date(fields.date.value+'T12:00:00').toLocaleDateString('fr-FR'):'');document.getElementById('sim-description').textContent=description;
document.getElementById('sim-warning').textContent=evening?'Estimation à partir de 5 500 DT : les majorations éventuelles selon la date et le nombre d’invités ne sont pas publiées dans les informations accessibles. Elles seront confirmées par l’équipe.':(fields.date.value?(result.weekend?'Tarif week-end / jour férié appliqué.':'Tarif semaine (lundi–jeudi) appliqué.'):'Choisissez une date pour déterminer le tarif semaine ou week-end.');
let message='Bonjour Bellagio Event’s, je souhaite un devis pour : '+description+'.\n'+result.lines.map(o=>o.label+' : '+money(o.amount)+' DT').join('\n')+'\nEstimation indicative : '+money(result.total)+' TND'+(result.discount?' (remise saisonnière incluse)':'')+'. Tarif à confirmer.';
document.getElementById('sim-whatsapp').href='https://wa.me/21652359900?text='+encodeURIComponent(message);
document.getElementById('sim-contact').onclick=()=>{try{sessionStorage.setItem('bellagio-estimate',JSON.stringify({message,date:fields.date.value,guests:fields.guests.value,space:fields.space.value,event:evening?'Mariage':'Réception'}))}catch{}};
}
form.addEventListener('change',e=>{if(e.target.closest('#sim-options'))return;update()});form.onsubmit=e=>e.preventDefault();
document.querySelectorAll('.choose-pack').forEach(a=>a.onclick=()=>{fields.pack.value=a.dataset.pack;update()});update();
}
if(location.pathname.replace(/\/$/,'')==='/contact'){try{const draft=JSON.parse(sessionStorage.getItem('bellagio-estimate'));if(draft){const f=document.getElementById('visit-form');for(const k of ['message','date','guests','space','event'])if(draft[k])f.elements[k].value=draft[k];const note=document.createElement('p');note.className='estimate-note';note.textContent='Votre simulation a été ajoutée à votre demande. Complétez vos coordonnées pour recevoir votre devis.';f.prepend(note)}}catch{}}
// Progressive enhancement: all content stays visible without JavaScript.
const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
if(!reduce&&'IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');observer.unobserve(e.target)}})},{threshold:.08});document.querySelectorAll('.intro,.section-top,.space-card,.experience-picture,.experience-copy,.formula-grid article,.gallery-image,.quote,.contact-copy,.contact form,.signature-pack,.reception-packs article,.sim-summary,.page-banner,.venue-detail,.sim-teaser').forEach((el,i)=>{el.classList.add('reveal');el.style.setProperty('--reveal-delay',(i%2)*90+'ms');observer.observe(el)})}
// Header state follows the viewport, with no motion required to use navigation.
const header=document.querySelector('.header');window.addEventListener('scroll',()=>header.classList.toggle('scrolled',window.scrollY>40),{passive:true});
if(location.hash){requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:reduce?'instant':'smooth'}))}
})();
