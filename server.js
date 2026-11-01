const express = require('express');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const cms=require('./cms');
const app = express();
app.disable('x-powered-by');
app.use(express.json({limit:'512kb'}));
app.use((req,res,next)=>{res.set('X-Content-Type-Options','nosniff');res.set('X-Frame-Options','SAMEORIGIN'); if(req.path.startsWith('/api'))res.set('Cache-Control','no-store');next()});
const dataDir=process.env.DATA_DIR||path.join(__dirname,'data');
const file=path.join(dataDir,'store.json');
fs.mkdirSync(path.dirname(file),{recursive:true});
const defaults={title:"Là où l’amour s’illumine.",intro:"Une salle de lumière, un jardin sous les étoiles. À Bellagio Event’s, nous donnons vie à vos plus beaux instants.",phone:'+216 52 359 900',address:'Ariana, Grand Tunis, Tunisie',email:'',requests:[]};
function read(){const stored=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};const content={...structuredClone(defaults),...structuredClone(cms.defaults),...stored};if(stored.pricing&&stored.pricing.capacityStepVersion!==1){content.pricing={...structuredClone(cms.defaults.pricing),...stored.pricing,capacityStepVersion:1,capacityExtras:structuredClone(cms.defaults.pricing.capacityExtras)}}return content}
function save(data){fs.writeFileSync(file+'.tmp',JSON.stringify(data,null,2));fs.renameSync(file+'.tmp',file)}
const secretPath=path.join(dataDir,'admin-password');
if(!process.env.ADMIN_PASSWORD&&!fs.existsSync(secretPath))fs.writeFileSync(secretPath,crypto.randomBytes(12).toString('base64url'),{mode:0o600});
const password=process.env.ADMIN_PASSWORD||fs.readFileSync(secretPath,'utf8').trim();
const salt=crypto.randomBytes(16), hash=crypto.scryptSync(password,salt,64), sessions=new Map(), attempts=new Map();
function auth(req,res,next){const cookie=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('bellagio_session='));const token=req.headers.authorization?.startsWith('Bearer ')?req.headers.authorization.slice(7):cookie?.slice(17);if(!token||!sessions.has(token)||sessions.get(token)<Date.now())return res.status(401).json({error:'Veuillez vous connecter.'});next()}
app.use('/api',(req,res,next)=>{if(!['GET','HEAD'].includes(req.method)&&req.headers.origin&&req.headers.origin!==`${req.protocol}://${req.get('host')}`&&new URL(req.headers.origin).host!==req.get('host'))return res.status(403).json({error:'Origine non autorisée.'});next()});
app.get('/api/content',(req,res)=>{const {requests,...content}=read();res.json(content)});
app.post('/api/requests',(req,res)=>{const {name,phone,date,space,event,guests,message}=req.body; if(typeof name!=='string'||name.trim().length<2||typeof phone!=='string'||!/^\+?[\d\s()-]{8,22}$/.test(phone)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||date<new Date().toISOString().slice(0,10)||!['La Volta','La Cabana','À définir'].includes(space)||!Number.isInteger(Number(guests))||guests<1||guests>500)return res.status(400).json({error:'Merci de vérifier vos coordonnées, la date et le nombre d’invités.'});const d=read(); d.requests.unshift({id:crypto.randomUUID(),name:name.trim().slice(0,100),phone,date,space,event:String(event||'Mariage').slice(0,80),guests:Number(guests),message:String(message||'').slice(0,2000),status:'Nouvelle',created:new Date().toISOString()});save(d);res.status(201).json({ok:true})});
app.post('/api/login',(req,res)=>{const ip=req.socket.remoteAddress;let a=attempts.get(ip)||{n:0,until:Date.now()+900000};if(a.until<Date.now())a={n:0,until:Date.now()+900000};attempts.set(ip,a);if(a.n>=10)return res.status(429).json({error:'Trop de tentatives. Réessayez dans 15 minutes.'});a.n++;if(typeof req.body.password!=='string'||req.body.password.length>200||!crypto.timingSafeEqual(crypto.scryptSync(req.body.password,salt,64),hash))return res.status(401).json({error:'Mot de passe incorrect.'});attempts.delete(ip);const token=crypto.randomBytes(32).toString('hex');sessions.set(token,Date.now()+8*3600000);res.cookie('bellagio_session',token,{httpOnly:true,sameSite:'strict',secure:req.secure||req.headers['x-forwarded-proto']==='https',maxAge:8*3600000});res.json({ok:true,token})});
app.get('/api/admin',auth,(req,res)=>res.json(read()));
app.post('/api/logout',(req,res)=>{const c=(req.headers.cookie||'').match(/bellagio_session=([^;]+)/);if(c)sessions.delete(c[1]);const bearer=req.headers.authorization;if(bearer?.startsWith('Bearer '))sessions.delete(bearer.slice(7));res.clearCookie('bellagio_session');res.json({ok:true})});
app.patch('/api/admin/content',auth,(req,res)=>{let changes;try{changes=cms.validate(req.body)}catch(e){return res.status(400).json({error:e.message})}const d=read();Object.assign(d,changes);for(const k of ['title','intro','phone','address','email'])if(typeof req.body[k]==='string')d[k]=req.body[k].trim().slice(0,k==='intro'?1000:180);save(d);res.json({ok:true})});
app.patch('/api/admin/requests/:id',auth,(req,res)=>{if(!['Nouvelle','Contactée','Confirmée','Archivée'].includes(req.body.status))return res.sendStatus(400);const d=read(),r=d.requests.find(x=>x.id===req.params.id);if(!r)return res.sendStatus(404);r.status=req.body.status;save(d);res.json({ok:true})});
const uploads=path.join(dataDir,'uploads');fs.mkdirSync(uploads,{recursive:true});
app.post('/api/admin/upload',auth,express.raw({type:['image/jpeg','image/png','image/webp'],limit:'5mb'}),(req,res)=>{
const b=req.body;if(!Buffer.isBuffer(b))return res.status(400).json({error:'Choisissez une image JPEG, PNG ou WebP.'});
const ext=b.length>12&&b.subarray(0,3).equals(Buffer.from([255,216,255]))?'jpg':b.length>8&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'png':b.length>12&&b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP'?'webp':null;
if(!ext)return res.status(400).json({error:'Format d’image non reconnu. SVG et fichiers non image interdits.'});const name=crypto.randomUUID()+'.'+ext;fs.writeFileSync(path.join(uploads,name),b);res.status(201).json({url:'/uploads/'+name});
});
app.use('/uploads',express.static(uploads,{dotfiles:'deny',maxAge:'7d'}));
const assetVersion=crypto.createHash('sha256').update(['pricing.js','simulator.js','pages.js','cms-public.js','style.css'].map(name=>fs.readFileSync(path.join(__dirname,'public',name))).join('')).digest('hex').slice(0,12);
function publicPage(req,res){const {requests,...content}=read();let html=fs.readFileSync(path.join(__dirname,'public','index.html'),'utf8');const config=JSON.stringify(content).replace(/</g,'\\u003c');html=html.replace('<!-- CMS_BOOTSTRAP -->','<script>window.BELLAGIO_CONTENT='+config+';</script>');html=html.replace(/(src|href)="(\/[a-z-]+\.(?:js|css))"/g,(_,attr,url)=>attr+'="'+url+'?v='+assetVersion+'"');res.set('Cache-Control','no-store');res.type('html').send(html)}
app.get(['/', '/formules','/nos-espaces','/galerie','/a-propos','/contact','/espaces/la-salle','/espaces/le-jardin'],publicPage);
app.use(express.static(path.join(__dirname,'public')));

app.get('/admin',(req,res)=>res.sendFile(path.join(__dirname,'public','admin.html')));
app.use((err,req,res,next)=>{console.error(err.message);res.status(err.type==='entity.too.large'?413:500).json({error:err.type==='entity.too.large'?'Fichier trop volumineux (maximum 5 Mo pour une image).':'Une erreur est survenue. Veuillez réessayer.'})});
app.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('Bellagio disponible sur le port '+(process.env.PORT||3000)));
