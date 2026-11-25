// Prepare the database before switching production traffic to the new Worker.
import { spawnSync } from 'node:child_process';
import process from 'node:process';
const cmd=process.platform === 'win32' ? 'node_modules/.bin/wrangler.cmd' : 'node_modules/.bin/wrangler';
function run(args,capture=false) {
  const r=spawnSync(cmd,args,{encoding:'utf8',stdio:capture?['inherit','pipe','inherit']:'inherit'});
  if(r.error || r.status!==0) throw new Error(r.error?.message || `Échec de wrangler ${args.join(' ')}.`);
  return r.stdout;
}
try {
  const databases=JSON.parse(run(['d1','list','--json'],true));
  if(!Array.isArray(databases)) throw new Error('Réponse D1 invalide.');
  if(!databases.some(db=>db.name==='playtech-db')) {
    console.log('Création de la base playtech-db…');
    run(['d1','create','playtech-db']);
  }
  console.log('Application des migrations nécessaires avant le déploiement…');
  run(['d1','migrations','apply','DB','--remote','--force']);
  run(['deploy']);
} catch(e) {console.error('Déploiement interrompu :',e.message);process.exitCode=1;}
