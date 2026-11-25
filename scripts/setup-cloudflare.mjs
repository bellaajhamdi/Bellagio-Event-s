/** Configure and deploy in the account currently authenticated with Wrangler.
 * The generated config contains only resource IDs, never credentials. */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import process from 'node:process';

const wrangler = process.platform === 'win32' ? 'node_modules/.bin/wrangler.cmd' : 'node_modules/.bin/wrangler';
const configPath = 'wrangler.deploy.json';
function run(args, capture = false) {
  const result = spawnSync(wrangler, args, { encoding:'utf8', stdio: capture ? ['inherit','pipe','inherit'] : 'inherit' });
  if (result.error || result.status !== 0) throw new Error(result.error?.message || `Échec : wrangler ${args.join(' ')}`);
  return result.stdout;
}
async function confirm(question) {
  const rl = createInterface({ input:process.stdin, output:process.stdout });
  try { return /^(o|oui)$/i.test((await rl.question(`${question} (oui/non) `)).trim()); }
  finally { rl.close(); }
}
function databases() {
  const data = JSON.parse(run(['d1','list','--json'],true));
  if (!Array.isArray(data)) throw new Error('La liste des bases Cloudflare est invalide.');
  return data;
}
try {
  if (!process.stdin.isTTY) throw new Error('Cette configuration doit être lancée dans un terminal interactif.');
  console.log('\nConfiguration de Play Tech sur Cloudflare\nLe déploiement publiera ou mettra à jour le Worker « playtech-manouba » dans le compte Cloudflare connecté.');
  if (!(await confirm('Continuer avec ce compte ?'))) process.exit(0);
  const name='playtech-db';
  let db=databases().find(item=>item.name===name);
  if (db) {
    console.log(`La base « ${name} » existe déjà (${db.uuid}). Elle ne sera pas supprimée.`);
    if (!(await confirm('Utiliser cette base et appliquer les migrations manquantes ?'))) process.exit(0);
  } else {
    console.log(`Création de la base D1 « ${name} »…`);
    run(['d1','create',name]);
    db=databases().find(item=>item.name===name);
  }
  if (!db || !/^[\da-f]{8}-[\da-f-]{27}$/i.test(db.uuid || '')) throw new Error('Identifiant de base introuvable. Vérifiez la base D1 dans Cloudflare.');
  const config=JSON.parse(readFileSync('wrangler.jsonc','utf8'));
  config.d1_databases[0].database_id=db.uuid;
  writeFileSync(configPath,JSON.stringify(config,null,2)+'\n');
  console.log('Application des migrations manquantes (les données existantes ne sont pas effacées)…');
  run(['d1','migrations','apply',name,'--remote','--config',configPath]);
  console.log('Compilation du site…');
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const build=spawnSync(npm,['run','build'],{stdio:'inherit'});
  if (build.error || build.status !== 0) throw new Error('Échec de la compilation.');
  console.log('Publication du Worker…');
  run(['deploy','--config',configPath]);
  console.log('\nLe site est déployé. Pour activer ou changer le mot de passe admin, lancez :\n\n  npx wrangler secret put ADMIN_PASSWORD --config wrangler.deploy.json\n\nChoisissez au moins 16 caractères. L’adresse publique est affichée ci-dessus par Wrangler ; ajoutez /admin pour accéder à l’administration.');
} catch (error) {
  console.error('\nConfiguration interrompue :', error.message);
  console.error('Vérifiez que Wrangler est connecté (npx wrangler login) et que le compte dispose de Workers et D1.');
  process.exitCode=1;
}
