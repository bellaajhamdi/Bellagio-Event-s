const {test}=require('node:test');const assert=require('node:assert/strict');const {calculate}=require('../public/pricing');
test('tarifs réception semaine, week-end et jour férié',()=>{
assert.equal(calculate({pack:'standard',date:'2027-06-07'}).total,3000);
assert.equal(calculate({pack:'standard',date:'2027-06-11'}).total,3500);
assert.equal(calculate({pack:'golden',date:'2027-06-07'}).total,4000);
assert.equal(calculate({pack:'golden',date:'2027-06-11'}).total,4500);
assert.equal(calculate({pack:'golden',date:'2027-06-07',holiday:true}).total,4500);
});
test('remise saisonnière, limites inclusives, options proportionnelles',()=>{
assert.equal(calculate({date:'2027-09-15'}).total,4400);
assert.equal(calculate({date:'2027-05-31'}).total,4400);
assert.equal(calculate({date:'2027-06-01'}).total,5500);
assert.equal(calculate({date:'2027-09-14'}).total,5500);
assert.equal(calculate({guests:250,selected:['sweet','variety','savory']}).total,8000);
assert.equal(calculate({pack:'standard',selected:['dinner','cake','music']}).total,3000);
});
