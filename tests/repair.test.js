import test from 'node:test';
import assert from 'node:assert/strict';
import { REPAIR_ICONS, validateRepair } from '../src/repair-data.js';
const valid={name:'Réparation écran',description:'Un texte',price:'Sur devis',delay:'',icon:'laptop',visible:true};
test('service data is trimmed, validated and stored with the server id',()=>{
  assert.deepEqual(validateRepair({...valid,name:'  Écran  ',id:'ignored'},'new-id'),{...valid,id:'new-id',name:'Écran'});
  for(const icon of REPAIR_ICONS) assert.ok(validateRepair({...valid,icon},'id'));
});
test('missing fields, oversized text, invalid icon and visibility are rejected',()=>{
  for(const invalid of [{name:'  '},{price:''},{description:'x'.repeat(401)},{delay:'x'.repeat(81)},{icon:'<svg>'},{visible:'false'}]) {
    assert.equal(validateRepair({...valid,...invalid},'id'),null);
  }
});
