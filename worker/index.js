import { DEFAULT_THEME, completeTheme, validTheme } from '../src/theme.js';
import { validateRepair } from '../src/repair-data.js';

const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {status, headers: {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers}});
const bad = (message, status = 400) => json({error: message}, status);
const bytes = new TextEncoder();
const hex = b => Array.from(new Uint8Array(b), n => n.toString(16).padStart(2,'0')).join('');
const digest = async value => hex(await crypto.subtle.digest('SHA-256', bytes.encode(value)));
async function signature(secret, message) {
  const key = await crypto.subtle.importKey('raw', bytes.encode(secret), {name:'HMAC', hash:'SHA-256'}, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, bytes.encode(message)));
}
function equal(a,b) { if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false; let v=0; for(let i=0;i<a.length;i++) v |= a.charCodeAt(i)^b.charCodeAt(i); return v===0; }
const getCredential = env => env.DB.prepare('SELECT salt, hash, iterations FROM admin_credentials WHERE id=1').first();
async function passwordHash(password, salt, iterations) {
  const key=await crypto.subtle.importKey('raw',bytes.encode(password),'PBKDF2',false,['deriveBits']);
  const saltBytes=new Uint8Array(salt.match(/../g).map(x=>parseInt(x,16)));
  return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:saltBytes,iterations},key,256));
}
async function verifyPassword(password, env, credential) {
  if (typeof password !== 'string' || password.length > 256) return false;
  if (credential && (!Number.isInteger(credential.iterations) || credential.iterations < 1 || credential.iterations > 100000 || !/^[a-f0-9]{32}$/.test(credential.salt) || !/^[a-f0-9]{64}$/.test(credential.hash))) return false;
  return credential ? equal(await passwordHash(password,credential.salt,credential.iterations),credential.hash) : equal(await digest(password),await digest(env.ADMIN_PASSWORD));
}
function signingKey(env, credential) { return credential ? `${env.ADMIN_PASSWORD}:${credential.hash}` : env.ADMIN_PASSWORD; }
async function checkAttempt(req,env) {
  const ip=req.headers.get('CF-Connecting-IP') || 'local';
  const attempt=await env.DB.prepare('SELECT failures, until FROM login_attempts WHERE ip=?').bind(ip).first();
  return {ip,attempt,blocked:!!(attempt && attempt.until > Date.now() && attempt.failures >= 5)};
}
async function recordFailure(env,ip,attempt) {
  const active=attempt && attempt.until > Date.now();
  await env.DB.prepare('INSERT INTO login_attempts (ip,failures,until) VALUES (?,?,?) ON CONFLICT(ip) DO UPDATE SET failures=excluded.failures, until=excluded.until').bind(ip,active ? attempt.failures+1 : 1,active ? attempt.until : Date.now()+900000).run();
}
async function authenticated(req, env) {
  if (!env.ADMIN_PASSWORD || env.ADMIN_PASSWORD.length < 16) return false;
  const token = (req.headers.get('Cookie') || '').match(/(?:^|;\s*)pt_session=([^;]+)/)?.[1];
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3 || !/^\d+$/.test(parts[0]) || Number(parts[0]) < Date.now() || Number(parts[0]) > Date.now() + 86400000) return false;
  const credential=await getCredential(env);
  return equal(parts[2], await signature(signingKey(env,credential), `${parts[0]}.${parts[1]}`));
}
function cookie(req, value, maxAge) {
  return `pt_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${new URL(req.url).protocol === 'https:' ? '; Secure' : ''}`;
}
function sameOrigin(req) { return req.headers.get('Origin') === new URL(req.url).origin; }
const text = (v,max) => typeof v === 'string' && v.trim().length <= max ? v.trim() : null;
export function validateProduct(input, id, previous = null) {
  if (!input || typeof input !== 'object') return null;
  const name=text(input.name,100), brand=text(input.brand,60), desc=text(input.desc,600);
  const category=input.category;
  const price=input.price === null || input.price === '' ? null : Number(input.price);
  const image=text(input.image,200);
  const stock=input.stock ?? previous?.stock ?? 'available';
  if (!['available','sold_out'].includes(stock)) return null;
  if (!name || !brand || desc === null || !['portable','bureau','gaming','simracing'].includes(category) || (price !== null && (!Number.isFinite(price) || price < 0 || price > 10000000)) || !image || !/^\/(?:images\/[\w.-]+|api\/images\/[a-f0-9-]{36})$/.test(image)) return null;
  if (!Array.isArray(input.chips) || input.chips.length > 8 || !Array.isArray(input.specs) || input.specs.length > 12) return null;
  const chips=input.chips.map(c=>text(c,60)); const specs=input.specs.map(pair=>Array.isArray(pair) && pair.length===2 ? pair.map(x=>text(x,100)) : null);
  if(chips.some(c=>!c) || specs.some(pair=>!pair || pair.some(c=>!c))) return null;
  return {id,brand,name,category,price,image,desc,chips,specs,stock,featured:input.featured===true, ...(input.badge && ['new','promo','gaming','reco','devis'].includes(input.badge) ? {badge: input.badge}: {})};
}
async function cleanup(env, image) {
  if (!image?.startsWith('/api/images/')) return;
  await env.DB.prepare(`DELETE FROM images WHERE id = ? AND NOT EXISTS (SELECT 1 FROM products WHERE json_extract(data, '$.image') = ?) AND NOT EXISTS (SELECT 1 FROM site_images WHERE image = ?)`).bind(image.slice(12),image,image).run();
}
async function handle(req, env) {
  const url=new URL(req.url), path=url.pathname;
  if (!path.startsWith('/api/')) return env.ASSETS.fetch(req);
  if (req.method === 'GET' && path === '/api/theme') {
    const row=await env.DB.prepare("SELECT value FROM site_settings WHERE key='theme'").first();
    if (!row) return json(DEFAULT_THEME);
    try {const theme=JSON.parse(row.value);return json(validTheme(theme) ? completeTheme(theme) : DEFAULT_THEME);} catch {return json(DEFAULT_THEME);}
  }
  if (req.method === 'GET' && path === '/api/services') {
    const rows=await env.DB.prepare('SELECT data FROM repair_services ORDER BY position, id').all();
    return json(rows.results.map(row=>JSON.parse(row.data)).filter(service=>service.visible));
  }
  if (req.method === 'GET' && path === '/api/products') {
    const rows=await env.DB.prepare('SELECT data FROM products ORDER BY position, id').all();
    return json(rows.results.map(row=>JSON.parse(row.data)));
  }
  if (req.method === 'GET' && path === '/api/site-images') {
    const rows=await env.DB.prepare('SELECT name, image FROM site_images').all();
    return json(Object.fromEntries(rows.results.map(r=>[r.name,r.image])));
  }
  const imageMatch=path.match(/^\/api\/images\/([a-f0-9-]{36})$/);
  if (req.method === 'GET' && imageMatch) {
    const image=await env.DB.prepare('SELECT data, type FROM images WHERE id=?').bind(imageMatch[1]).first();
    return image ? new Response(image.data,{headers:{'Content-Type':image.type,'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'}}) : bad('Image introuvable',404);
  }
  if (req.method !== 'GET' && !sameOrigin(req)) return bad('Origine non autorisée.',403);
  if (req.method === 'POST' && path === '/api/login') {
    if (!env.ADMIN_PASSWORD || env.ADMIN_PASSWORD.length < 16) return bad('Administration non configurée : définissez un mot de passe de 16 caractères minimum.',503);
    const {ip,attempt,blocked}=await checkAttempt(req,env);
    if (blocked) return bad('Trop de tentatives. Réessayez dans 15 minutes.',429);
    let body; try { body=await req.json(); } catch { return bad('Requête invalide.'); }
    const credential=await getCredential(env);
    if (!await verifyPassword(body.password,env,credential)) {
      await recordFailure(env,ip,attempt);
      return bad('Mot de passe incorrect.',401);
    }
    await env.DB.prepare('DELETE FROM login_attempts WHERE ip=?').bind(ip).run();
    const payload=`${Date.now()+28800000}.${crypto.randomUUID()}`;
    return json({ok:true},200,{'Set-Cookie':cookie(req,`${payload}.${await signature(signingKey(env,credential),payload)}`,28800)});
  }
  if (req.method === 'GET' && path === '/api/session') return json({authenticated:await authenticated(req,env)});
  if (req.method === 'POST' && path === '/api/logout') return json({ok:true},200,{'Set-Cookie':cookie(req,'',0)});
  if (!(await authenticated(req,env))) return bad('Connectez-vous pour continuer.',401);

  if (req.method === 'GET' && path === '/api/admin/services') {
    const rows=await env.DB.prepare('SELECT data FROM repair_services ORDER BY position, id').all();
    return json(rows.results.map(row=>JSON.parse(row.data)));
  }
  if (req.method === 'POST' && path === '/api/services') {
    let body; try { body=await req.json(); } catch { return bad('Données invalides.'); }
    const id=crypto.randomUUID(), service=validateRepair(body,id);
    if (!service) return bad('Vérifiez le nom, le tarif, les détails et l’icône du service.');
    await env.DB.prepare('INSERT INTO repair_services (id,data,position) VALUES (?,?,(SELECT COALESCE(MAX(position),-1)+1 FROM repair_services))').bind(id,JSON.stringify(service)).run();
    return json(service,201);
  }
  const serviceMatch=path.match(/^\/api\/services\/([a-zA-Z0-9-]+)$/);
  if (serviceMatch && ['PUT','DELETE'].includes(req.method)) {
    const existing=await env.DB.prepare('SELECT data FROM repair_services WHERE id=?').bind(serviceMatch[1]).first();
    if (!existing) return bad('Service introuvable.',404);
    if (req.method === 'DELETE') {await env.DB.prepare('DELETE FROM repair_services WHERE id=?').bind(serviceMatch[1]).run();return json({ok:true});}
    let body; try {body=await req.json();} catch {return bad('Données invalides.');}
    const service=validateRepair(body,serviceMatch[1]);
    if (!service) return bad('Vérifiez le nom, le tarif, les détails et l’icône du service.');
    await env.DB.prepare('UPDATE repair_services SET data=? WHERE id=?').bind(JSON.stringify(service),service.id).run();
    return json(service);
  }
  if (req.method === 'PUT' && path === '/api/theme') {
    let theme; try {theme=await req.json()} catch {return bad('Données invalides.')};
    if (!validTheme(theme)) return bad('Choisissez une couleur suffisamment claire et des options valides.');
    const full=completeTheme(theme);
    const saved={palette:full.palette,accent:full.accent.toLowerCase(),radius:full.radius,font:full.font,density:full.density,cards:full.cards,buttons:full.buttons,width:full.width,effects:full.effects};
    await env.DB.prepare("INSERT INTO site_settings (key,value) VALUES ('theme',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(JSON.stringify(saved)).run();
    return json(saved);
  }
  if (req.method === 'POST' && path === '/api/password') {
    if (!env.ADMIN_PASSWORD || env.ADMIN_PASSWORD.length < 16) return bad('Administration non configurée.',503);
    const {ip,attempt,blocked}=await checkAttempt(req,env);
    if (blocked) return bad('Trop de tentatives. Réessayez dans 15 minutes.',429);
    let body; try {body=await req.json()} catch {return bad('Données invalides.')};
    const credential=await getCredential(env);
    if (!await verifyPassword(body.currentPassword,env,credential)) {await recordFailure(env,ip,attempt);return bad('Mot de passe actuel incorrect.',401);}
    if (typeof body.newPassword !== 'string' || body.newPassword.length < 16 || body.newPassword.length > 256) return bad('Le nouveau mot de passe doit contenir entre 16 et 256 caractères.');
    if (body.newPassword===body.currentPassword) return bad('Choisissez un mot de passe différent.');
    // Cloudflare Workers caps PBKDF2 at 100,000 iterations per call.
    const salt=hex(crypto.getRandomValues(new Uint8Array(16))), iterations=100000;
    const hash=await passwordHash(body.newPassword,salt,iterations);
    await env.DB.prepare('INSERT INTO admin_credentials (id,salt,hash,iterations) VALUES (1,?,?,?) ON CONFLICT(id) DO UPDATE SET salt=excluded.salt,hash=excluded.hash,iterations=excluded.iterations').bind(salt,hash,iterations).run();
    await env.DB.prepare('DELETE FROM login_attempts WHERE ip=?').bind(ip).run();
    return json({ok:true},200,{'Set-Cookie':cookie(req,'',0)});
  }

  if (req.method === 'POST' && path === '/api/upload') {
    if (Number(req.headers.get('content-length')) > 1200000) return bad('Image trop volumineuse (1 Mo maximum).',413);
    let form; try { form=await req.formData(); } catch { return bad('Fichier invalide.'); }
    const f=form.get('image');
    if (!(f instanceof File) || f.size === 0 || f.size > 1000000) return bad('Choisissez une image de 1 Mo maximum.');
    const data=await f.arrayBuffer(), b=new Uint8Array(data);
    let type = b[0]===0xff && b[1]===0xd8 && b[2]===0xff ? 'image/jpeg' : b.length>=8 && [137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v) ? 'image/png' : b.length>=12 && String.fromCharCode(...b.slice(0,4))==='RIFF' && String.fromCharCode(...b.slice(8,12))==='WEBP' ? 'image/webp' : null;
    if (!type) return bad('Formats acceptés : JPG, PNG ou WebP.');
    const id=crypto.randomUUID(); await env.DB.prepare('INSERT INTO images (id,data,type) VALUES (?,?,?)').bind(id,data,type).run();
    return json({url:`/api/images/${id}`},201);
  }
  if (req.method === 'POST' && path === '/api/products') {
    let body; try {body=await req.json()} catch {return bad('Données invalides.')};
    const id=crypto.randomUUID(), product=validateProduct(body,id); if(!product) return bad('Vérifiez les champs du produit.');
    if (product.image.startsWith('/api/images/') && !await env.DB.prepare('SELECT id FROM images WHERE id=?').bind(product.image.slice(12)).first()) return bad('Image introuvable.');
    await env.DB.prepare('INSERT INTO products (id,data,position) VALUES (?,?,(SELECT COALESCE(MAX(position),-1)+1 FROM products))').bind(id,JSON.stringify(product)).run();
    return json(product,201);
  }
  const productMatch=path.match(/^\/api\/products\/([a-zA-Z0-9-]+)$/);
  if (productMatch && ['PUT','DELETE'].includes(req.method)) {
    const old=await env.DB.prepare('SELECT data FROM products WHERE id=?').bind(productMatch[1]).first(); if(!old) return bad('Produit introuvable.',404);
    const previous=JSON.parse(old.data);
    if (req.method === 'DELETE') { await env.DB.prepare('DELETE FROM products WHERE id=?').bind(productMatch[1]).run(); await cleanup(env,previous.image); return json({ok:true}); }
    let body; try {body=await req.json()} catch {return bad('Données invalides.')};
    const product=validateProduct(body,productMatch[1],previous); if(!product) return bad('Vérifiez les champs du produit.');
    if (product.image.startsWith('/api/images/') && !await env.DB.prepare('SELECT id FROM images WHERE id=?').bind(product.image.slice(12)).first()) return bad('Image introuvable.');
    await env.DB.prepare('UPDATE products SET data=? WHERE id=?').bind(JSON.stringify(product),product.id).run();
    if(previous.image!==product.image) await cleanup(env,previous.image);
    return json(product);
  }
  const siteMatch=path.match(/^\/api\/site-images\/(hero|showroom|repair)$/);
  if (siteMatch && ['PUT','DELETE'].includes(req.method)) {
    const old=await env.DB.prepare('SELECT image FROM site_images WHERE name=?').bind(siteMatch[1]).first();
    if(req.method==='DELETE') await env.DB.prepare('DELETE FROM site_images WHERE name=?').bind(siteMatch[1]).run();
    else {
      let body; try{body=await req.json()}catch{return bad('Données invalides.')};
      if(typeof body.image!=='string' || !/^\/api\/images\/[a-f0-9-]{36}$/.test(body.image) || !await env.DB.prepare('SELECT id FROM images WHERE id=?').bind(body.image.slice(12)).first()) return bad('Image introuvable.');
      await env.DB.prepare('INSERT INTO site_images (name,image) VALUES (?,?) ON CONFLICT(name) DO UPDATE SET image=excluded.image').bind(siteMatch[1],body.image).run();
      if(old?.image !== body.image) await cleanup(env,old?.image);
      return json({ok:true});
    }
    await cleanup(env,old?.image); return json({ok:true});
  }
  return bad('Page introuvable.',404);
}
export default {async fetch(req,env) {try{return await handle(req,env)}catch(e){console.error(e);return bad('Une erreur est survenue. Réessayez plus tard.',500)}}};
