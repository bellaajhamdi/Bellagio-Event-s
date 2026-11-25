import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import './admin.css';

const $ = (selector) => document.querySelector(selector);
const escape = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let products = [], siteImages = {}, editingId = null, previewUrl = null;
const defaults = {hero:'/images/hero.jpg',showroom:'/images/showroom.jpg',repair:'/images/repair.jpg'};
const labels = {hero:'Image principale', showroom:'Notre magasin', repair:'Atelier & réparation'};
const categories = {portable:'PC portable',bureau:'PC de bureau',gaming:'Gaming',simracing:'Sim Racing'};

async function api(path, options = {}) {
  const response = await fetch(path, {credentials:'same-origin', ...options});
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Une erreur est survenue.');
  return data;
}
const send = (method, data) => ({method, headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
function notice(message, error=false) {const el=error && $('#editor').open ? $('#editorNotice') : $('#notice'); el.textContent=message; el.className='notice'+(error?' error':''); el.hidden=false; window.scrollTo({top:0,behavior:'smooth'});}
function loggedIn(on) {$('#loginView').hidden=on; $('#dashboard').hidden=!on; $('#logout').hidden=!on;}
function renderProducts() {
  const search=$('#adminSearch').value.toLowerCase().trim();
  const shown=products.filter(p=>`${p.brand} ${p.name}`.toLowerCase().includes(search));
  $('#productCount').textContent=products.length;
  $('#featuredCount').textContent=products.filter(p=>p.featured).length;
  $('#noProducts').hidden=shown.length!==0;
  $('#productList').innerHTML=shown.map(p=>`<article class="product-row"><img src="${escape(p.image)}" alt=""><div class="product-info"><strong>${escape(p.name)}</strong><span>${escape(p.brand)} · ${escape(categories[p.category] || p.category)}${p.featured ? ' · À la une' : ''}</span></div><div class="product-value">${p.price == null ? 'Sur devis' : escape(new Intl.NumberFormat('fr-FR').format(p.price))+' DT'}</div><div class="row-actions"><button class="secondary" data-edit="${escape(p.id)}">Modifier</button><button class="danger" data-delete="${escape(p.id)}" aria-label="Supprimer ${escape(p.name)}">Supprimer</button></div></article>`).join('');
}
function renderSiteImages() {
  $('#sitePhotos').innerHTML=Object.entries(defaults).map(([key,url])=>`<article class="site-photo"><img src="${escape(siteImages[key] || url)}" alt="${escape(labels[key])}"><div><strong>${escape(labels[key])}</strong><p class="hint">Image de la page d’accueil</p><label class="secondary file-button">Changer la photo<input type="file" data-site-upload="${key}" accept="image/jpeg,image/png,image/webp"></label>${siteImages[key] ? `<button class="danger" data-reset-image="${key}">Rétablir l’originale</button>` : ''}</div></article>`).join('');
}
async function refresh() { [products,siteImages]=await Promise.all([api('/api/products'),api('/api/site-images')]);renderProducts();renderSiteImages(); }
async function upload(file) {
  if (!file || file.size > 1000000 || !['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Choisissez une image JPG, PNG ou WebP de 1 Mo maximum.');
  const form=new FormData();form.append('image',file);
  return (await api('/api/upload',{method:'POST',body:form})).url;
}
function openEditor(product) {
  const form=$('#productForm');form.reset();$('#editorNotice').hidden=true;editingId=product?.id || null;
  $('#editorTitle').textContent=product?'Modifier le produit':'Ajouter un produit';
  for (const key of ['brand','name','category','price','desc','badge']) form.elements[key].value=product?.[key] ?? (key==='category'?'portable':'');
  form.elements.chips.value=(product?.chips || []).join(', ');
  form.elements.specs.value=(product?.specs || []).map(pair=>pair.join(' : ')).join('\n');
  form.elements.featured.checked=Boolean(product?.featured);
  form.dataset.image=product?.image || '/images/product-placeholder.svg';
  $('#imagePreview').src=form.dataset.image;
  $('#editor').showModal();
}
$('#removeProductImage').addEventListener('click',()=>{ $('#productImage').value=''; $('#productForm').dataset.image='/images/product-placeholder.svg'; $('#imagePreview').src='/images/product-placeholder.svg'; });
$('#productImage').addEventListener('change', e=>{if(previewUrl) URL.revokeObjectURL(previewUrl);const file=e.target.files[0];if(file){previewUrl=URL.createObjectURL(file);$('#imagePreview').src=previewUrl;}});
$('#loginForm').addEventListener('submit', async e=>{e.preventDefault();const btn=e.submitter;btn.disabled=true;try{await api('/api/login',send('POST',{password:$('#password').value}));$('#password').value='';await refresh();loggedIn(true);$('#notice').hidden=true;}catch(err){notice(err.message,true)}finally{btn.disabled=false}});
$('#logout').addEventListener('click',async()=>{try{await api('/api/logout',{method:'POST'});loggedIn(false);notice('Vous êtes déconnecté.');}catch(e){notice(e.message,true)}});
$('#newProduct').addEventListener('click',()=>openEditor());
for (const id of ['closeEditor','cancelEditor']) $('#'+id).addEventListener('click',()=>$('#editor').close());
$('#adminSearch').addEventListener('input',renderProducts);
$('#productList').addEventListener('click',async e=>{const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');if(edit){openEditor(products.find(p=>p.id===edit.dataset.edit));return;}if(del){const p=products.find(p=>p.id===del.dataset.delete);if(!p || !confirm(`Supprimer « ${p.name} » du catalogue ?`))return;del.disabled=true;try{await api(`/api/products/${encodeURIComponent(p.id)}`,{method:'DELETE'});await refresh();notice('Produit supprimé du catalogue.');}catch(err){notice(err.message,true);del.disabled=false;}}});
$('#productForm').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,btn=e.submitter;$('#editorNotice').hidden=true;const specs=form.elements.specs.value.split('\n').map(s=>s.trim()).filter(Boolean).map(line=>{const i=line.indexOf(':');return i<0 ? null : [line.slice(0,i).trim(),line.slice(i+1).trim()]});if(specs.some(x=>!x || !x[0] || !x[1])){notice('Chaque détail doit être écrit sous la forme « Nom : valeur ».',true);return;}btn.disabled=true;btn.textContent='Enregistrement…';try{let image=form.dataset.image;const file=$('#productImage').files[0];if(file)image=await upload(file);const product={brand:form.elements.brand.value,name:form.elements.name.value,category:form.elements.category.value,price:form.elements.price.value===''?null:Number(form.elements.price.value),desc:form.elements.desc.value,chips:form.elements.chips.value.split(',').map(x=>x.trim()).filter(Boolean),specs,featured:form.elements.featured.checked,badge:form.elements.badge.value,image};await api(editingId?`/api/products/${encodeURIComponent(editingId)}`:'/api/products',send(editingId?'PUT':'POST',product));$('#editor').close();await refresh();notice('Produit enregistré et visible sur le site.');}catch(err){notice(err.message,true)}finally{btn.disabled=false;btn.textContent='Enregistrer le produit';}});
for(const tab of ['products','photos']) $('#'+tab+'Tab').addEventListener('click',()=>{for(const name of ['products','photos']){$('#'+name+'Tab').setAttribute('aria-selected',String(name===tab));$('#'+name+'Panel').hidden=name!==tab;}});
$('#sitePhotos').addEventListener('change',async e=>{const input=e.target.closest('[data-site-upload]');if(!input?.files[0])return;input.disabled=true;try{const image=await upload(input.files[0]);await api('/api/site-images/'+input.dataset.siteUpload,send('PUT',{image}));await refresh();notice('Photo du site mise à jour.');}catch(err){notice(err.message,true);input.disabled=false;input.value='';}});
$('#sitePhotos').addEventListener('click',async e=>{const btn=e.target.closest('[data-reset-image]');if(!btn || !confirm('Rétablir la photo originale ?'))return;btn.disabled=true;try{await api('/api/site-images/'+btn.dataset.resetImage,{method:'DELETE'});await refresh();notice('Photo originale rétablie.');}catch(err){notice(err.message,true);btn.disabled=false;}});
try {const session=await api('/api/session');if(session.authenticated){await refresh();loggedIn(true)}else loggedIn(false);} catch(error){loggedIn(false);notice('Administration indisponible : vérifiez la configuration du serveur. '+error.message,true)}
