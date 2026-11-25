import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.js';

// Minimal D1 model for auth and theme routes; PBKDF2 is checked against Workers' production cap.
function fakeDb() {
  let credential=null, theme=null, attempts=null;
  return {get credential(){return credential;},prepare(sql){
    const statement={
      bind(...args){this.args=args;return this;},
      async first(){
        if(sql.includes('FROM admin_credentials')) return credential;
        if(sql.includes('FROM login_attempts')) return attempts;
        if(sql.includes('FROM site_settings')) return theme ? {value:theme} : null;
        throw Error('Unexpected query '+sql);
      },
      async run(){
        const args=this.args || [];
        if(sql.includes('INSERT INTO admin_credentials')) credential={salt:args[0],hash:args[1],iterations:args[2]};
        else if(sql.includes('INSERT INTO site_settings')) theme=args[0];
        else if(sql.includes('INSERT INTO login_attempts')) attempts={failures:args[1],until:args[2]};
        else if(sql.includes('DELETE FROM login_attempts')) attempts=null;
        else throw Error('Unexpected query '+sql);
        return {success:true};
      }
    };
    return statement;
  }};
}
function request(path,method='GET',data,cookie){return new Request('https://shop.example'+path,{method,headers:{origin:'https://shop.example',...(data?{'content-type':'application/json'}:{}),...(cookie?{cookie}:{})},...(data?{body:JSON.stringify(data)}:{})});}
async function json(response){return response.json();}
test('theme permissions and password rotation invalidate old sessions',async () => {
  const db=fakeDb(),env={DB:db,ADMIN_PASSWORD:'bootstrap-pass-long-enough'};
  const original=crypto.subtle.deriveBits.bind(crypto.subtle);
  Object.defineProperty(crypto.subtle,'deriveBits',{configurable:true,value:(algorithm,...args)=>{if(algorithm.name==='PBKDF2' && algorithm.iterations>100000) throw Error('Workers PBKDF2 cap exceeded');return original(algorithm,...args);}});
  try {
    let r=await worker.fetch(request('/api/theme','PUT',{palette:'noir'}),env); assert.equal(r.status,401);
    r=await worker.fetch(request('/api/login','POST',{password:env.ADMIN_PASSWORD}),env);assert.equal(r.status,200);
    const cookie=r.headers.get('set-cookie').split(';')[0];
    const theme={palette:'graphite',accent:'#fbbf24',radius:'square',font:'classic',density:'compact'};
    r=await worker.fetch(request('/api/theme','PUT',theme,cookie),env);assert.equal(r.status,200);
    r=await worker.fetch(request('/api/theme'),env);assert.deepEqual(await json(r),theme);
    r=await worker.fetch(request('/api/password','POST',{currentPassword:'wrong',newPassword:'new-password-long-enough'},cookie),env);assert.equal(r.status,401);
    r=await worker.fetch(request('/api/password','POST',{currentPassword:env.ADMIN_PASSWORD,newPassword:'new-password-long-enough'},cookie),env);assert.equal(r.status,200);
    assert.equal(db.credential.iterations,100000);
    assert.notEqual(db.credential.hash,'new-password-long-enough');
    r=await worker.fetch(request('/api/session','GET',undefined,cookie),env);assert.equal((await json(r)).authenticated,false);
    r=await worker.fetch(request('/api/login','POST',{password:env.ADMIN_PASSWORD}),env);assert.equal(r.status,401);
    r=await worker.fetch(request('/api/login','POST',{password:'new-password-long-enough'}),env);assert.equal(r.status,200);
  } finally {delete crypto.subtle.deriveBits;}
});
